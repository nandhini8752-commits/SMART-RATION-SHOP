import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isDatabaseReady, closeDb, query } from '../../server/db/connection';
import { shopService } from '../../server/services/shopService';
import { citizenService } from '../../server/services/citizenService';
import { queueService } from '../../server/services/queueService';
import { AppError } from '../../server/middleware/error';

describe('Milestone 3 — Citizen Services & Queue Logic', () => {
  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);
  });

  afterAll(async () => {
    await closeDb();
  });

  // 1. Shop Discovery & Public Catalogs
  it('TC-C1: shopService.getPublicConfig returns portal configuration', async () => {
    const config = await shopService.getPublicConfig();
    expect(config.service).toBe('SRQMS Tamil Nadu');
    expect(config.demoMode).toBe(true);
    expect(config.helplines.tollFree).toBe('1967');
  });

  it('TC-C2: shopService.getShops retrieves shops with filtering and search', async () => {
    const allShops = await shopService.getShops({});
    expect(allShops.pagination.total).toBeGreaterThanOrEqual(3);
    expect(allShops.data.some((s) => s.shopCode === 'DEMO-CHN-001')).toBe(true);

    const chennaiShops = await shopService.getShops({ district: 'Chennai' });
    expect(chennaiShops.data.every((s) => s.district === 'Chennai')).toBe(true);

    const searched = await shopService.getShops({ q: 'Mogappair' });
    expect(searched.data.length).toBeGreaterThanOrEqual(1);
    expect(searched.data[0].locality).toContain('Mogappair');
  });

  it('TC-C3: shopService.getShopById and getShopAvailability retrieve stock and queue snapshot', async () => {
    const shop = await shopService.getShopById('DEMO-CHN-001');
    expect(shop).not.toBeNull();
    expect(shop?.shopCode).toBe('DEMO-CHN-001');

    const availability = await shopService.getShopAvailability('DEMO-CHN-001');
    expect(availability).not.toBeNull();
    expect(availability?.shop.shopCode).toBe('DEMO-CHN-001');
    expect(Array.isArray(availability?.stock)).toBe(true);
    expect(availability?.stock.length).toBeGreaterThan(0);
  });

  it('TC-C4: shopService.getCommodities and getCurrentPolicies return canonical rules', async () => {
    const commodities = await shopService.getCommodities();
    expect(commodities.length).toBeGreaterThanOrEqual(4);

    const policies = await shopService.getCurrentPolicies();
    expect(policies.length).toBeGreaterThanOrEqual(4);
    const riceRule = policies.find((p) => p.commodityCode === 'RICE');
    expect(riceRule).toBeDefined();
  });

  // 2. Synthetic Card Verification & Entitlements
  it('TC-C5: citizenService.verifyDemoCard verifies valid synthetic card DEMO-TN-0001', async () => {
    const res = await citizenService.verifyDemoCard('DEMO-TN-0001');
    expect(res.verificationId).toBeDefined();
    expect(res.card.cardNumber).toBe('DEMO-TN-0001');
    expect(res.card.category).toBe('PHH');
    expect(res.card.familyMembers).toBe(4);
    expect(res.card.shopCode).toBe('DEMO-CHN-001');
  });

  it('TC-C6: citizenService.verifyDemoCard rejects unknown card numbers with 404 AppError', async () => {
    await expect(citizenService.verifyDemoCard('INVALID-CARD-9999')).rejects.toThrow(AppError);
    try {
      await citizenService.verifyDemoCard('INVALID-CARD-9999');
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('CARD_NOT_FOUND');
    }
  });

  it('TC-C7: citizenService.getCardEntitlements computes correct quotas based on scale', async () => {
    const res = await citizenService.getCardEntitlements('DEMO-TN-0001');
    expect(res.card.cardNumber).toBe('DEMO-TN-0001');
    expect(res.items.length).toBeGreaterThanOrEqual(3);

    // Rice is 5kg per person for PHH with 4 members = 20kg
    const rice = res.items.find((i) => i.commodityCode === 'RICE');
    expect(rice).toBeDefined();
    expect(rice?.quantity).toBe(20);
    expect(rice?.pricePerUnit).toBe(0);
  });

  // 3. FIFO Queue Token Generation & Lifecycle
  it('TC-C8: queueService.generateToken creates sequential token and prevents duplicate active tokens', async () => {
    // Look up card ID and shop ID for DEMO-TN-0001
    const cardRes = await query(`SELECT id, shop_id FROM ration_cards WHERE card_number = 'DEMO-TN-0001'`);
    const card = cardRes.rows[0];

    // Clean up any existing tokens for this shop to ensure deterministic sequence
    await query(`DELETE FROM stock_transactions WHERE distribution_item_id IS NOT NULL`);
    await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE shop_id::text = $1)`, [card.shop_id]);
    await query(`DELETE FROM distribution_transactions WHERE shop_id::text = $1`, [card.shop_id]);
    await query(`DELETE FROM notifications WHERE token_id IN (SELECT id FROM queue_tokens WHERE shop_id::text = $1)`, [card.shop_id]);
    await query(`DELETE FROM queue_tokens WHERE shop_id::text = $1`, [card.shop_id]);

    // 1st generation -> should create new token
    const gen1 = await queueService.generateToken({
      rationCardId: card.id,
      shopId: card.shop_id,
    });
    expect(gen1.alreadyActive).toBe(false);
    expect(gen1.token.tokenNumber).toMatch(/^TK-\d{3}$/);
    expect(gen1.token.status).toBe('WAITING');
    expect(gen1.position).toBeGreaterThanOrEqual(1);

    const firstTokenId = gen1.token.id;

    // 2nd generation on same day -> must return existing token with alreadyActive = true
    const gen2 = await queueService.generateToken({
      rationCardId: card.id,
      shopId: card.shop_id,
    });
    expect(gen2.alreadyActive).toBe(true);
    expect(gen2.token.id).toBe(firstTokenId);
    expect(gen2.position).toBe(gen1.position);

    // Get token details
    const details = await queueService.getTokenDetails(firstTokenId);
    expect(details.tokenNumber).toBe(gen1.token.tokenNumber);
    expect(details.cardNumber).toBe('DEMO-TN-0001');

    // Cancel token
    const cancelled = await queueService.cancelToken(firstTokenId, 'Beneficiary cancelled test');
    expect(cancelled.status).toBe('CANCELLED');

    // Cancelling an already cancelled token should fail with 409
    await expect(queueService.cancelToken(firstTokenId)).rejects.toThrow(AppError);
  });

  // 4. Grievance Redressal
  it('TC-C9: citizenService creates and tracks demonstration complaints', async () => {
    const shopRes = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    const shopId = shopRes.rows[0].id;

    const created = await citizenService.createComplaint({
      category: 'COMMODITY_QUALITY',
      subject: 'Test Quality Inquiry',
      message: 'Quality of Tur Dal inspected during demonstration session.',
      shopId,
      demoContactHint: '9840000001',
    });

    expect(created.referenceCode).toMatch(/^CMP-TN-\d{6}$/);
    expect(created.status).toBe('RECEIVED');

    const tracked = await citizenService.getComplaintByReference(created.referenceCode);
    expect(tracked.referenceCode).toBe(created.referenceCode);
    expect(tracked.subject).toBe('Test Quality Inquiry');
    expect(tracked.status).toBe('RECEIVED');
  });
});
