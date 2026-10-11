import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { isDatabaseReady, closeDb, query } from '../../server/db/connection';
import { staffService } from '../../server/services/staffService';
import { queueService } from '../../server/services/queueService';
import { generateToken, AuthUser } from '../../server/middleware/auth';
import { AppError } from '../../server/middleware/error';

describe('Milestone 4 — Queue Engine & Operator Portal', () => {
  let demoShopId: string;
  let operatorUserId: string;
  let demoCardId: string;

  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);

    // Look up demo shop DEMO-CHN-001
    const shopRes = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    demoShopId = shopRes.rows[0].id;

    // Look up operator_anna
    const userRes = await query(`SELECT id FROM app_users WHERE username = 'operator_anna'`);
    operatorUserId = userRes.rows[0].id;

    // Look up demo card DEMO-TN-0001
    const cardRes = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0001'`);
    demoCardId = cardRes.rows[0].id;
  });

  afterAll(async () => {
    await closeDb();
  });

  // 1. Authentication & Role Claims
  it('TC-S1: Staff authentication verifies password and role claims', async () => {
    const userRes = await query(
      `SELECT id, username, password_hash, full_name, role, shop_id, is_active FROM app_users WHERE username = 'operator_anna'`
    );
    expect(userRes.rows.length).toBe(1);
    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare('DemoOperator@123', user.password_hash);
    expect(isMatch).toBe(true);

    const isBadMatch = await bcrypt.compare('WrongPassword', user.password_hash);
    expect(isBadMatch).toBe(false);

    const token = generateToken({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      shopId: user.shop_id,
    });
    expect(typeof token).toBe('string');
  });

  // 2. Queue Inspection & Metrics
  it('TC-S2: staffService.getQueue returns scoped queue lists, summary, and counters', async () => {
    const data = await staffService.getQueue(demoShopId);
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('counters');
    expect(data).toHaveProperty('serving');
    expect(data).toHaveProperty('waiting');
    expect(data.counters.length).toBeGreaterThanOrEqual(2);
  });

  // 3. FIFO Dispatch & Counter State
  it('TC-S3: Atomic FIFO dispatch calls oldest waiting token to counter', async () => {
    const today = new Date().toISOString().split('T')[0];

    // Clean up existing tokens for this shop today
    await query(`DELETE FROM stock_transactions WHERE distribution_item_id IS NOT NULL`);
    await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE shop_id::text = $1)`, [demoShopId]);
    await query(`DELETE FROM distribution_transactions WHERE shop_id::text = $1`, [demoShopId]);
    await query(`DELETE FROM notifications WHERE token_id IN (SELECT id FROM queue_tokens WHERE shop_id::text = $1)`, [demoShopId]);
    await query(`DELETE FROM queue_tokens WHERE shop_id::text = $1`, [demoShopId]);

    // Create 2 waiting tokens in sequence
    const tok1 = await queueService.generateToken({
      rationCardId: demoCardId,
      shopId: demoShopId,
    });
    expect(tok1.token.status).toBe('WAITING');

    // Look up second card DEMO-TN-0002
    const card2Res = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0002'`);
    const tok2 = await queueService.generateToken({
      rationCardId: card2Res.rows[0].id,
      shopId: demoShopId,
    });
    expect(tok2.token.status).toBe('WAITING');

    // Call next token to Counter 1 -> MUST be tok1 (oldest FIFO)
    const callRes = await staffService.callNext(demoShopId, 1, operatorUserId);
    expect(callRes.nextServing).not.toBeNull();
    expect(callRes.nextServing.id).toBe(tok1.token.id);
    expect(callRes.nextServing.status).toBe('SERVING');
    expect(callRes.nextServing.counterNo).toBe(1);
  });

  it('TC-S4: Calling next on an already busy counter throws 409 COUNTER_BUSY', async () => {
    // Counter 1 is already serving from TC-S3
    await expect(staffService.callNext(demoShopId, 1, operatorUserId)).rejects.toThrow(AppError);
    try {
      await staffService.callNext(demoShopId, 1, operatorUserId);
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('COUNTER_BUSY');
    }
  });

  it('TC-S5: Completing a token in SERVING status transitions to COMPLETED', async () => {
    // Find currently serving token on Counter 1
    const today = new Date().toISOString().split('T')[0];
    const servingRes = await query(
      `SELECT id FROM queue_tokens WHERE shop_id::text = $1 AND counter_no = 1 AND status = 'SERVING'`,
      [demoShopId]
    );
    expect(servingRes.rows.length).toBe(1);
    const tokenId = servingRes.rows[0].id;

    const completed = await staffService.completeToken(tokenId, demoShopId, operatorUserId, 'Delivered successfully');
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBeDefined();

    // Attempting to complete already completed token must fail with 409
    await expect(staffService.completeToken(tokenId, demoShopId, operatorUserId)).rejects.toThrow(AppError);
  });

  it('TC-S6: Mark No-Show requires reason and transitions status', async () => {
    // Now Counter 1 is free; call next token (tok2)
    const callRes = await staffService.callNext(demoShopId, 1, operatorUserId);
    expect(callRes.nextServing).not.toBeNull();
    const tokenId = callRes.nextServing.id;

    // Empty reason should fail
    await expect(staffService.markNoShow(tokenId, demoShopId, operatorUserId, '')).rejects.toThrow(AppError);

    // Valid reason marks NO_SHOW
    const noShowRes = await staffService.markNoShow(tokenId, demoShopId, operatorUserId, 'Customer did not respond after 3 announcements');
    expect(noShowRes.status).toBe('NO_SHOW');
    expect(noShowRes.noShowAt).toBeDefined();
    expect(noShowRes.statusReason).toContain('3 announcements');
  });

  it('TC-S7: Staff cancellation requires reason and records reason', async () => {
    // Create another token to cancel
    const cardRes = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0003'`);
    const tok = await queueService.generateToken({
      rationCardId: cardRes.rows[0].id,
      shopId: demoShopId,
    });

    const cancelled = await staffService.cancelTokenByStaff(
      tok.token.id,
      demoShopId,
      operatorUserId,
      'Card holder requested reschedule'
    );
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.statusReason).toBe('Card holder requested reschedule');
  });

  it('TC-S8: Shop scoping blocks operations across shops with 403', async () => {
    // Look up shop 2
    const shop2Res = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-002'`);
    const shop2Id = shop2Res.rows[0].id;

    // Create token in shop 2
    const cardRes = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0004'`);
    const tok = await queueService.generateToken({
      rationCardId: cardRes.rows[0].id,
      shopId: shop2Id,
    });

    // Operator assigned to shop 1 attempts to complete token in shop 2 -> 403 FORBIDDEN
    await expect(staffService.completeToken(tok.token.id, demoShopId, operatorUserId)).rejects.toThrow(AppError);
    try {
      await staffService.completeToken(tok.token.id, demoShopId, operatorUserId);
    } catch (err: any) {
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    }
  });

  it('TC-S9: staffService.getBeneficiaries returns shop ration cards', async () => {
    const result = await staffService.getBeneficiaries(demoShopId);
    expect(Array.isArray(result.beneficiaries)).toBe(true);
    expect(result.beneficiaries.length).toBeGreaterThanOrEqual(1);

    const searched = await staffService.getBeneficiaries(demoShopId, 'DEMO-TN-0001');
    expect(searched.beneficiaries.some((b) => b.cardNumber === 'DEMO-TN-0001')).toBe(true);
  });
});
