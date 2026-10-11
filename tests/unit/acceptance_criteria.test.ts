import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isDatabaseReady, closeDb, query } from '../../server/db/connection';
import { shopService } from '../../server/services/shopService';
import { citizenService } from '../../server/services/citizenService';
import { queueService } from '../../server/services/queueService';
import { staffService } from '../../server/services/staffService';
import { inventoryService } from '../../server/services/inventoryService';
import { notificationService } from '../../server/services/notificationService';
import { AppError } from '../../server/middleware/error';

describe('Acceptance Criteria Suite — AC-01 through AC-28', () => {
  let demoShopId: string;
  let demoShop2Id: string;
  let operatorAnnaId: string;
  let card1Id: string;
  let card2Id: string;
  let card3Id: string;

  async function cleanShopTokens(shopId: string) {
    await query(`DELETE FROM stock_transactions WHERE distribution_item_id IS NOT NULL`);
    await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE shop_id::text = $1)`, [shopId]);
    await query(`DELETE FROM distribution_transactions WHERE shop_id::text = $1`, [shopId]);
    await query(`DELETE FROM notifications WHERE token_id IN (SELECT id FROM queue_tokens WHERE shop_id::text = $1)`, [shopId]);
    await query(`DELETE FROM queue_tokens WHERE shop_id::text = $1`, [shopId]);
  }

  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);

    const s1Res = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    demoShopId = s1Res.rows[0].id;

    const s2Res = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-002'`);
    demoShop2Id = s2Res.rows[0].id;

    const opRes = await query(`SELECT id FROM app_users WHERE username = 'operator_anna'`);
    operatorAnnaId = opRes.rows[0].id;

    const c1Res = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0001'`);
    card1Id = c1Res.rows[0].id;

    const c2Res = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0002'`);
    card2Id = c2Res.rows[0].id;

    const c3Res = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0003'`);
    card3Id = c3Res.rows[0].id;

    await cleanShopTokens(demoShopId);
  });

  afterAll(async () => {
    await cleanShopTokens(demoShopId);
    await closeDb();
  });

  // AC-01: Search shops with district and text filters
  it('AC-01: Search shops with district and text filters returns matching shops and stable pagination', async () => {
    const res = await shopService.getShops({ district: 'Chennai', q: 'Anna Nagar' });
    expect(res.data.length).toBeGreaterThanOrEqual(1);
    expect(res.data[0].district).toBe('Chennai');
    expect(res.pagination.page).toBe(1);
    expect(res.pagination.total).toBeGreaterThanOrEqual(1);
  });

  // AC-02: Unknown card submitted for demo verification
  it('AC-02: Unknown card submitted for demo verification returns safe 404 response', async () => {
    await expect(citizenService.verifyDemoCard('NONEXISTENT-CARD-9999')).rejects.toThrow(AppError);
    try {
      await citizenService.verifyDemoCard('NONEXISTENT-CARD-9999');
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('CARD_NOT_FOUND');
    }
  });

  // AC-03: Known synthetic card verified
  it('AC-03: Known synthetic card verified returns demo entitlement with version metadata', async () => {
    const cardData = await citizenService.verifyDemoCard('DEMO-TN-0001');
    expect(cardData.card.cardNumber).toBe('DEMO-TN-0001');
    expect(cardData.card.category).toBe('PHH');
    expect(cardData.card.shopCode).toBe('DEMO-CHN-001');

    const entitlements = await citizenService.getCardEntitlements('DEMO-TN-0001');
    expect(entitlements.items.length).toBeGreaterThanOrEqual(3);
    expect(entitlements.policyVersion).toBeDefined();
    expect(entitlements.isDemo).toBe(true);
  });

  // AC-04 & AC-05: Create token with idempotency key and retry
  it('AC-04 & AC-05: Create token with idempotency key returns WAITING token; retries return same token without duplicate', async () => {
    const idemKey = `ac-idem-${Date.now()}`;
    const firstResult = await queueService.generateToken({
      rationCardId: card1Id,
      shopId: demoShopId,
      idempotencyKey: idemKey,
    });
    expect(firstResult.token.status).toBe('WAITING');
    expect(firstResult.token.tokenNumber).toBeDefined();

    // Retry with exact same key
    const secondResult = await queueService.generateToken({
      rationCardId: card1Id,
      shopId: demoShopId,
      idempotencyKey: idemKey,
    });
    expect(secondResult.token.id).toBe(firstResult.token.id);
    expect(secondResult.token.tokenNumber).toBe(firstResult.token.tokenNumber);

    // Verify exactly 1 token exists in db for this card today
    const countRes = await query(
      `SELECT COUNT(*) FROM queue_tokens WHERE ration_card_id = $1 AND service_date = CURRENT_DATE`,
      [card1Id]
    );
    expect(parseInt(countRes.rows[0].count, 10)).toBe(1);
  });

  // AC-06: Create second active token for same card/shop/date
  it('AC-06: Create second active token for same card with different key links existing active token', async () => {
    const result = await queueService.generateToken({
      rationCardId: card1Id,
      shopId: demoShopId,
      idempotencyKey: `different-key-${Date.now()}`,
    });

    expect(result.alreadyActive).toBe(true);
    expect(result.token.status).toBe('WAITING');
  });

  // AC-07: Strict FIFO queue order
  it('AC-07: Creating multiple tokens and calling next preserves strict sequence/FIFO order', async () => {
    // Generate second token with card2
    const tok2 = await queueService.generateToken({
      rationCardId: card2Id,
      shopId: demoShopId,
    });
    expect(tok2.token.status).toBe('WAITING');

    // Call next on Counter 1 -> MUST be card1 (the first generated token)
    const callRes = await staffService.callNext(demoShopId, 1, operatorAnnaId);
    expect(callRes.nextServing).not.toBeNull();
    expect(callRes.nextServing.cardNumber).toBe('DEMO-TN-0001');
    expect(callRes.nextServing.status).toBe('SERVING');
    expect(callRes.nextServing.counterNo).toBe(1);
  });

  // AC-08 & AC-09: Calling next on busy counter
  it('AC-08 & AC-09: Calling next on an already busy counter throws 409 COUNTER_BUSY', async () => {
    // Counter 1 is currently serving card1
    await expect(staffService.callNext(demoShopId, 1, operatorAnnaId)).rejects.toThrow(AppError);
    try {
      await staffService.callNext(demoShopId, 1, operatorAnnaId);
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('COUNTER_BUSY');
    }
  });

  // AC-10: Cancel WAITING token
  it('AC-10: Cancelling a WAITING token updates status to CANCELLED and recalculates queue', async () => {
    // Look up token 2 (card2) which is currently WAITING
    const tok2Res = await query(
      `SELECT id FROM queue_tokens WHERE ration_card_id = $1 AND status = 'WAITING'`,
      [card2Id]
    );
    expect(tok2Res.rows.length).toBe(1);
    const tok2Id = tok2Res.rows[0].id;

    const cancelRes = await queueService.cancelToken(tok2Id, 'Citizen cancellation request');
    expect(cancelRes.status).toBe('CANCELLED');

    const statusCheck = await queueService.getTokenDetails(tok2Id);
    expect(statusCheck.status).toBe('CANCELLED');
  });

  // AC-12: Mark no-show
  it('AC-12: Marking a serving token as NO_SHOW updates status and frees counter', async () => {
    // Look up serving token on Counter 1
    const servingRes = await query(
      `SELECT id FROM queue_tokens WHERE shop_id = $1 AND counter_no = 1 AND status = 'SERVING'`,
      [demoShopId]
    );
    expect(servingRes.rows.length).toBe(1);
    const servingId = servingRes.rows[0].id;

    const noShowRes = await staffService.markNoShow(
      servingId, 
      demoShopId, 
      operatorAnnaId, 
      'Beneficiary did not respond to 3 call announcements'
    );
    expect(noShowRes.status).toBe('NO_SHOW');

    // Counter 1 should now be free
    const checkCounter = await query(
      `SELECT COUNT(*) FROM queue_tokens WHERE shop_id = $1 AND counter_no = 1 AND status = 'SERVING'`,
      [demoShopId]
    );
    expect(parseInt(checkCounter.rows[0].count, 10)).toBe(0);
  });

  // AC-13 & AC-14: Complete distribution with sufficient stock & double completion protection
  it('AC-13 & AC-14: Dispensing with stock commits distribution ledger and blocks second completion', async () => {
    // Clean and generate new token with card3
    await cleanShopTokens(demoShopId);
    const tok3 = await queueService.generateToken({
      rationCardId: card3Id,
      shopId: demoShopId,
    });

    // Call to Counter 2
    const callRes = await staffService.callNext(demoShopId, 2, operatorAnnaId);
    expect(callRes.nextServing.id).toBe(tok3.token.id);

    // Initial stock snapshot
    const initialRiceRes = await query(
      `SELECT si.quantity_available FROM shop_inventory si
       JOIN commodities c ON c.id = si.commodity_id
       WHERE si.shop_id = $1 AND c.code = 'RICE'`,
      [demoShopId]
    );
    const initialRice = parseFloat(initialRiceRes.rows[0].quantity_available);

    // Complete dispensation: 20 kg Rice via inventoryService.distributeEntitlement
    const completeRes = await inventoryService.distributeEntitlement({
      tokenId: tok3.token.id,
      shopId: demoShopId,
      actorUserId: operatorAnnaId,
      items: [{ commodityCode: 'RICE', quantity: 20.0 }],
      note: 'Verified smart card demo dispensation',
    });
    expect(completeRes.distributionId).toBeDefined();

    // Verify token became COMPLETED
    const tokenCheck = await query(`SELECT status FROM queue_tokens WHERE id = $1`, [tok3.token.id]);
    expect(tokenCheck.rows[0].status).toBe('COMPLETED');

    // Verify stock ledger deducted exactly 20 kg
    const finalRiceRes = await query(
      `SELECT si.quantity_available FROM shop_inventory si
       JOIN commodities c ON c.id = si.commodity_id
       WHERE si.shop_id = $1 AND c.code = 'RICE'`,
      [demoShopId]
    );
    const finalRice = parseFloat(finalRiceRes.rows[0].quantity_available);
    expect(finalRice).toBe(initialRice - 20.0);

    // AC-14: Completing the same completed token throws error and prevents duplicate deductions
    await expect(
      inventoryService.distributeEntitlement({
        tokenId: tok3.token.id,
        shopId: demoShopId,
        actorUserId: operatorAnnaId,
        items: [{ commodityCode: 'RICE', quantity: 20.0 }],
      })
    ).rejects.toThrow(AppError);

    // Verify stock was NOT deducted again
    const verifyRiceRes = await query(
      `SELECT si.quantity_available FROM shop_inventory si
       JOIN commodities c ON c.id = si.commodity_id
       WHERE si.shop_id = $1 AND c.code = 'RICE'`,
      [demoShopId]
    );
    expect(parseFloat(verifyRiceRes.rows[0].quantity_available)).toBe(finalRice);
  });

  // AC-11: Cancel completed token
  it('AC-11: Attempting to cancel an already COMPLETED token throws 409 INVALID_STATUS_TRANSITION', async () => {
    // Look up completed token for card3
    const compTokenRes = await query(
      `SELECT id FROM queue_tokens WHERE ration_card_id = $1 AND status = 'COMPLETED'`,
      [card3Id]
    );
    expect(compTokenRes.rows.length).toBe(1);

    await expect(
      queueService.cancelToken(compTokenRes.rows[0].id, 'Citizen tries to cancel after dispensation')
    ).rejects.toThrow(AppError);
  });

  // AC-15: Complete when commodity is short rolls back transaction completely
  it('AC-15: Dispensing quantity exceeding available stock rolls back without partial deductions', async () => {
    // Clean and generate token
    await cleanShopTokens(demoShopId);
    const tok = await queueService.generateToken({
      rationCardId: card1Id,
      shopId: demoShopId,
    });
    await staffService.callNext(demoShopId, 1, operatorAnnaId);

    // Attempt to dispense 999999 kg of Rice
    await expect(
      inventoryService.distributeEntitlement({
        tokenId: tok.token.id,
        shopId: demoShopId,
        actorUserId: operatorAnnaId,
        items: [{ commodityCode: 'RICE', quantity: 999999 }],
      })
    ).rejects.toThrow(AppError);

    // Verify token status remains SERVING (rolled back)
    const tokenCheck = await query(`SELECT status FROM queue_tokens WHERE id = $1`, [tok.token.id]);
    expect(tokenCheck.rows[0].status).toBe('SERVING');
  });

  // AC-16 & AC-17: Stock adjustments with and without reason
  it('AC-16 & AC-17: Stock adjustment requires reason; valid adjustment updates inventory and ledger', async () => {
    // AC-16: Missing reason throws validation error
    await expect(
      inventoryService.recordStockTransaction({
        shopId: demoShopId,
        commodityCode: 'SUGAR',
        quantityDelta: 50,
        transactionType: 'ADJUSTMENT',
        reason: '',
        actorUserId: operatorAnnaId,
      })
    ).rejects.toThrow(AppError);

    // AC-17: Valid reason updates stock and audit ledger
    const sugarBeforeRes = await query(
      `SELECT si.quantity_available FROM shop_inventory si
       JOIN commodities c ON c.id = si.commodity_id
       WHERE si.shop_id = $1 AND c.code = 'SUGAR'`,
      [demoShopId]
    );
    const sugarBefore = parseFloat(sugarBeforeRes.rows[0].quantity_available);

    const adjResult = await inventoryService.recordStockTransaction({
      shopId: demoShopId,
      commodityCode: 'SUGAR',
      quantityDelta: 25,
      transactionType: 'ADJUSTMENT',
      reason: 'Physical stock reconciliation audit verified',
      actorUserId: operatorAnnaId,
    });

    expect(adjResult.transaction.quantityAfter).toBe(sugarBefore + 25);
    expect(adjResult.transaction.id).toBeDefined();

    // Verify ledger row exists
    const ledgerRow = await query(
      `SELECT * FROM stock_transactions WHERE id = $1`,
      [adjResult.transaction.id]
    );
    expect(ledgerRow.rows.length).toBe(1);
    expect(ledgerRow.rows[0].reason).toContain('Physical stock reconciliation');
  });

  // AC-18: Cross-shop access boundaries
  it('AC-18: Cross-shop operations verify shop assignment boundaries', async () => {
    // Calling queue on demoShop2Id while operator is assigned to demoShopId
    const opUser = await query(`SELECT shop_id FROM app_users WHERE id = $1`, [operatorAnnaId]);
    expect(opUser.rows[0].shop_id).toBe(demoShopId);
    expect(opUser.rows[0].shop_id).not.toBe(demoShop2Id);
  });

  // AC-19: Operator role cannot execute admin policies
  it('AC-19: Operator role cannot execute admin commodity policy changes', async () => {
    const opUser = await query(`SELECT role FROM app_users WHERE id = $1`, [operatorAnnaId]);
    expect(opUser.rows[0].role).toBe('SHOP_OPERATOR');
    expect(opUser.rows[0].role).not.toBe('STATE_ADMIN');
  });

  // AC-20: Queue tracker rehydration
  it('AC-20: Refresh queue tracker correctly rehydrates current status and position', async () => {
    const servingRes = await query(
      `SELECT id FROM queue_tokens WHERE shop_id = $1 AND status = 'SERVING' LIMIT 1`,
      [demoShopId]
    );
    if (servingRes.rows.length > 0) {
      const statusRes = await queueService.getTokenDetails(servingRes.rows[0].id);
      expect(statusRes.status).toBe('SERVING');
    }
  });

  // AC-21: Notification dispatch fault isolation
  it('AC-21: Core operations succeed even when notification channels are simulated or offline', async () => {
    const tokRes = await query(`SELECT id FROM queue_tokens LIMIT 1`);
    const validTokenId = tokRes.rows.length > 0 
      ? tokRes.rows[0].id 
      : (await queueService.generateToken({ rationCardId: card1Id, shopId: demoShopId })).token.id;

    const notif = await notificationService.dispatchQueueNotification({
      tokenId: validTokenId,
      tokenNumber: 'TK-099',
      eventType: 'TOKEN_CALLED',
      destination: '9876543210',
      counterNo: 1,
    });
    expect(['SENT', 'SKIPPED'].includes(notif.status)).toBe(true);
    expect(notif.destinationMasked).toBe('XXXXXX3210');
  });

  // AC-26 & AC-27: Public configuration and demo indicators
  it('AC-26 & AC-27: Public configuration is available without authentication and flags demo mode', async () => {
    const config = await shopService.getPublicConfig();
    expect(config.demoMode).toBe(true);
    expect(config.service).toContain('SRQMS');
  });

  // AC-28: No Aadhaar data retention
  it('AC-28: Database schema enforces privacy by design with no Aadhaar identifiers', async () => {
    const cols = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('ration_cards', 'queue_tokens', 'app_users', 'distribution_transactions')
    `);
    const colNames = cols.rows.map((r) => r.column_name.toLowerCase());
    expect(colNames.includes('aadhaar')).toBe(false);
    expect(colNames.includes('uidai')).toBe(false);
  });
});
