import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isDatabaseReady, closeDb, query } from '../../server/db/connection';
import { notificationService } from '../../server/services/notificationService';
import { queueService } from '../../server/services/queueService';
import { staffService } from '../../server/services/staffService';

describe('Milestone 7 — Notifications & Alerts Adapter Engine', () => {
  let demoShopId: string;
  let demoCardId: string;
  let adminUserId: string;

  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);

    const shopRes = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    demoShopId = shopRes.rows[0].id;

    const cardRes = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0001'`);
    demoCardId = cardRes.rows[0].id;

    const adminRes = await query(`SELECT id FROM app_users WHERE username = 'admin_tn'`);
    adminUserId = adminRes.rows[0].id;

    async function cleanQueue() {
      await query(`DELETE FROM stock_transactions WHERE distribution_item_id IS NOT NULL`);
      await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE shop_id::text = $1)`, [demoShopId]);
      await query(`DELETE FROM distribution_transactions WHERE shop_id::text = $1`, [demoShopId]);
      await query(`DELETE FROM notifications WHERE token_id IN (SELECT id FROM queue_tokens WHERE shop_id::text = $1)`, [demoShopId]);
      await query(`DELETE FROM queue_tokens WHERE shop_id::text = $1`, [demoShopId]);
    }

    await cleanQueue();
  });

  afterAll(async () => {
    try {
      await query(`DELETE FROM stock_transactions WHERE distribution_item_id IS NOT NULL`);
      await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE shop_id::text = $1)`, [demoShopId]);
      await query(`DELETE FROM distribution_transactions WHERE shop_id::text = $1`, [demoShopId]);
      await query(`DELETE FROM notifications WHERE token_id IN (SELECT id FROM queue_tokens WHERE shop_id::text = $1)`, [demoShopId]);
      await query(`DELETE FROM queue_tokens WHERE shop_id::text = $1`, [demoShopId]);
    } catch (e) {
      // ignore
    }
    await closeDb();
  });

  // 1. PII masking
  it('TC-N1: notificationService.maskDestination masks mobile phones, usernames and emails', () => {
    expect(notificationService.maskDestination('9876543210')).toBe('XXXXXX3210');
    expect(notificationService.maskDestination('+91 94441 23456')).toBe('XXXXXX3456');
    expect(notificationService.maskDestination('@citizen_anna')).toBe('@c***a');
    expect(notificationService.maskDestination('beneficiary@tnega.tn.gov.in')).toBe('b***y@tnega.tn.gov.in');
    expect(notificationService.maskDestination(undefined)).toBe('XXXXXX0001');
  });

  // 2. Telegram Alert unconfigured fallback
  it('TC-N2: notificationService.sendTelegramAlert gracefully handles unconfigured bot token', async () => {
    const res = await notificationService.sendTelegramAlert('Test alert message');
    expect(res.success).toBe(true);
    expect(['SKIPPED', 'SENT']).toContain(res.status);
    if (res.status === 'SKIPPED') {
      expect(res.providerId).toBe('SIMULATED-DEMO');
    }
  });

  // 3. Bilingual message formatting
  it('TC-N3: notificationService.formatMessage generates bilingual English and Tamil texts', () => {
    const issuedMsg = notificationService.formatMessage({
      tokenId: 'test-tok-1',
      eventType: 'TOKEN_ISSUED',
      tokenNumber: 'TK-042',
      shopName: 'Anna Nagar Fair Price Shop',
      queueAhead: 4,
      estimatedWaitMinutes: 16,
    });

    expect(issuedMsg).toContain('#TK-042');
    expect(issuedMsg).toContain('Anna Nagar Fair Price Shop');
    expect(issuedMsg).toContain('Ahead in Queue: 4');
    expect(issuedMsg).toContain('வரிசை டோக்கன் எண் #TK-042');

    const calledMsg = notificationService.formatMessage({
      tokenId: 'test-tok-1',
      eventType: 'TOKEN_CALLED',
      tokenNumber: 'TK-042',
      counterNo: 2,
    });

    expect(calledMsg).toContain('#TK-042');
    expect(calledMsg).toContain('Counter #2');
    expect(calledMsg).toContain('கவுண்டர் #2');

    const completedMsg = notificationService.formatMessage({
      tokenId: 'test-tok-1',
      eventType: 'TOKEN_COMPLETED',
      tokenNumber: 'TK-042',
    });

    expect(completedMsg).toContain('Distribution Successful');
    expect(completedMsg).toContain('வெற்றிகரமாக விநியோகிக்கப்பட்டது');
  });

  // 4. Persistence of notification records
  it('TC-N4: notificationService.dispatchQueueNotification persists Telegram and SMS audit records', async () => {
    // Generate a test token first
    const tokenRes = await queueService.generateToken({
      rationCardId: demoCardId,
      shopId: demoShopId,
    });
    const tokenId = tokenRes.token.id;

    const notif = await notificationService.dispatchQueueNotification({
      tokenId,
      eventType: 'TOKEN_MILESTONE_10_AHEAD',
      destination: '9840012345',
      tokenNumber: tokenRes.token.tokenNumber,
    });

    expect(notif.id).toBeDefined();
    expect(notif.channel).toBe('TELEGRAM');
    expect(notif.eventType).toBe('TOKEN_MILESTONE_10_AHEAD');
    expect(notif.destinationMasked).toBe('XXXXXX2345');

    // Verify DB records
    const dbNotifs = await notificationService.getTokenNotifications(tokenId);
    expect(dbNotifs.notifications.length).toBeGreaterThanOrEqual(2); // Initial TOKEN_ISSUED + MILESTONE
    const hasSms = dbNotifs.notifications.some((n) => n.channel === 'SMS_GATEWAY');
    const hasTg = dbNotifs.notifications.some((n) => n.channel === 'TELEGRAM');
    expect(hasSms).toBe(true);
    expect(hasTg).toBe(true);
  });

  // 5. Automatic notification on token issuance
  it('TC-N5: queueService.generateToken automatically triggers and persists TOKEN_ISSUED notification', async () => {
    // Look up notifications for the token created in TC-N4
    const tokenRes = await query(
      `SELECT id FROM queue_tokens WHERE shop_id::text = $1 AND ration_card_id::text = $2 LIMIT 1`,
      [demoShopId, demoCardId]
    );
    expect(tokenRes.rows.length).toBe(1);
    const tokenId = tokenRes.rows[0].id;

    const notifRes = await notificationService.getTokenNotifications(tokenId);
    const issuedNotif = notifRes.notifications.find((n) => n.eventType === 'TOKEN_ISSUED');
    expect(issuedNotif).toBeDefined();
    expect(issuedNotif?.destinationMasked).toBeDefined();
  });

  // 6. Automatic notification on counter call
  it('TC-N6: staffService.callNext automatically triggers and persists TOKEN_CALLED notification', async () => {
    const callRes = await staffService.callNext(demoShopId, 1, adminUserId);
    expect(callRes.nextServing).toBeDefined();
    const calledTokenId = callRes.nextServing.id;

    const notifRes = await notificationService.getTokenNotifications(calledTokenId);
    const calledNotif = notifRes.notifications.find((n) => n.eventType === 'TOKEN_CALLED');
    expect(calledNotif).toBeDefined();
    expect(calledNotif?.destinationMasked).toBeDefined();
  });

  // 7. Shop notification audit log retrieval
  it('TC-N7: notificationService.getShopNotificationAudit returns recent audit stream', async () => {
    const auditRes = await notificationService.getShopNotificationAudit(demoShopId, 10);
    expect(auditRes.notifications.length).toBeGreaterThanOrEqual(1);
    const first = auditRes.notifications[0];
    expect(first.tokenNumber).toBeDefined();
    expect(first.channel).toBeDefined();
    expect(first.status).toBeDefined();
  });
});
