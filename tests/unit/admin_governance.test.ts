import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { isDatabaseReady, closeDb, query } from '../../server/db/connection';
import { adminService } from '../../server/services/adminService';
import { AppError } from '../../server/middleware/error';

describe('Milestone 6 — Administrator Portal & Governance Controls', () => {
  let adminUserId: string;
  let demoShopId: string;

  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);

    const adminRes = await query(`SELECT id FROM app_users WHERE username = 'admin_tn'`);
    adminUserId = adminRes.rows[0].id;

    const shopRes = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    demoShopId = shopRes.rows[0].id;
  });

  afterAll(async () => {
    try {
      await query(`DELETE FROM audit_logs WHERE resource_id IN (SELECT id::text FROM policy_rules WHERE rule_code LIKE 'RICE_TEST_POLICY_%')`);
      await query(`DELETE FROM policy_rules WHERE rule_code LIKE 'RICE_TEST_POLICY_%'`);
      await query(`DELETE FROM commodities WHERE code LIKE 'TEST_COM_%'`);
      await query(`DELETE FROM app_users WHERE username LIKE 'op_test_%' OR username LIKE 'status_test_%'`);
      await query(`DELETE FROM shops WHERE shop_code LIKE 'DEMO-TEST-%'`);
    } catch (e) {
      // ignore cleanup errors
    }
    await closeDb();
  });

  // 1. Dashboard summary
  it('TC-A1: adminService.getDashboardSummary returns active counts', async () => {
    const summary = await adminService.getDashboardSummary();
    expect(summary).toBeDefined();
    expect(summary.activeShops).toBeGreaterThanOrEqual(2);
    expect(summary.activeStaffUsers).toBeGreaterThanOrEqual(2);
    expect(summary.activeCommodities).toBeGreaterThanOrEqual(4);
    expect(summary.versionedPolicies).toBeGreaterThanOrEqual(4);
    expect(summary.totalAuditEvents).toBeGreaterThanOrEqual(1);
  });

  // 2. Shop management
  it('TC-A2: adminService.createShop registers new shop and logs to audit_logs', async () => {
    const shopCode = `DEMO-TEST-${Date.now().toString().slice(-4)}`;
    const newShop = await adminService.createShop(
      {
        shopCode,
        name: 'SRQMS Automated Testing Shop',
        district: 'Chennai',
        taluk: 'Mylapore',
        locality: 'Alwarpet',
        address: '42 Governance Way, Alwarpet, Chennai - 600018',
        pincode: '600018',
        phoneDisplay: '044-24991122',
        openingHours: { morning: '08:30 - 12:30', afternoon: '15:00 - 19:00' },
      },
      adminUserId
    );

    expect(newShop.id).toBeDefined();
    expect(newShop.shopCode).toBe(shopCode);
    expect(newShop.isActive).toBe(true);

    // Verify audit log
    const auditRes = await query(
      `SELECT * FROM audit_logs WHERE action = 'CREATE_SHOP' AND resource_id = $1`,
      [newShop.id]
    );
    expect(auditRes.rows.length).toBe(1);
  });

  // 3. Shop list with card counts
  it('TC-A3: adminService.getShops returns shop records with assignedCardsCount', async () => {
    const res = await adminService.getShops();
    expect(Array.isArray(res.shops)).toBe(true);
    expect(res.shops.length).toBeGreaterThanOrEqual(3);

    const s1 = res.shops.find((s) => s.shopCode === 'DEMO-CHN-001');
    expect(s1).toBeDefined();
    expect(typeof s1?.assignedCardsCount).toBe('number');
  });

  // 4. User creation with bcrypt hash
  it('TC-A4: adminService.createUser registers staff user with bcrypt hash and role check', async () => {
    const username = `operator_test_${Date.now().toString().slice(-4)}`;
    const created = await adminService.createUser(
      {
        username,
        fullName: 'Test Operator User',
        password: 'TestPassword@123',
        role: 'SHOP_OPERATOR',
        shopId: demoShopId,
      },
      adminUserId
    );

    expect(created.id).toBeDefined();
    expect(created.username).toBe(username);
    expect(created.role).toBe('SHOP_OPERATOR');

    // Verify stored password is a bcrypt hash
    const userRes = await query(`SELECT password_hash FROM app_users WHERE id = $1`, [created.id]);
    const isMatch = await bcrypt.compare('TestPassword@123', userRes.rows[0].password_hash);
    expect(isMatch).toBe(true);

    // Operator without shopId must be rejected
    await expect(
      adminService.createUser(
        {
          username: `bad_op_${Date.now()}`,
          fullName: 'Bad Operator',
          password: 'Pass',
          role: 'SHOP_OPERATOR',
          shopId: null,
        },
        adminUserId
      )
    ).rejects.toThrowError(AppError);
  });

  // 5. User status toggle
  it('TC-A5: adminService.updateUserStatus activates/deactivates user', async () => {
    const testUser = await adminService.createUser(
      {
        username: `status_test_${Date.now().toString().slice(-4)}`,
        fullName: 'Status Check User',
        password: 'Pass@12345678',
        role: 'SHOP_OPERATOR',
        shopId: demoShopId,
      },
      adminUserId
    );

    const updated = await adminService.updateUserStatus(testUser.id, false, adminUserId);
    expect(updated.isActive).toBe(false);

    const checkRes = await query(`SELECT is_active FROM app_users WHERE id = $1`, [testUser.id]);
    expect(checkRes.rows[0].is_active).toBe(false);
  });

  // 6. Commodity catalogue
  it('TC-A6: adminService.createCommodity adds active commodity', async () => {
    const code = `TEST_COM_${Date.now().toString().slice(-4)}`;
    const commodity = await adminService.createCommodity(
      {
        code,
        nameI18n: { en: 'Test Fortified Salt', ta: 'செறிவூட்டப்பட்ட உப்பு' },
        unit: 'kg',
      },
      adminUserId
    );

    expect(commodity.id).toBeDefined();
    expect(commodity.code).toBe(code);
    expect(commodity.isActive).toBe(true);

    const list = await adminService.getCommodities();
    expect(list.commodities.some((c) => c.code === code)).toBe(true);
  });

  // 7. Versioned policy rules
  it('TC-A7: adminService.createPolicyRule increments version and stores source citation', async () => {
    const ruleCode = `RICE_TEST_POLICY_${Date.now().toString().slice(-4)}`;
    const rule = await adminService.createPolicyRule(
      {
        ruleCode,
        cardCategory: 'PHH',
        commodityCode: 'RICE',
        ruleConfig: { scale: 'PER_PERSON', quantity: 6.0, unit: 'kg', pricePerUnit: 0.0 },
        explanationI18n: { en: 'Updated special test allocation 6kg' },
        sourceUrl: 'https://consumer.tn.gov.in/test-policy',
        sourceNote: 'State executive committee decision',
        validFrom: '2026-11-01',
      },
      adminUserId
    );

    expect(rule.id).toBeDefined();
    expect(rule.ruleCode).toBe(ruleCode);
    expect(rule.version).toBe(1);

    // Add version 2
    const ruleV2 = await adminService.createPolicyRule(
      {
        ruleCode,
        cardCategory: 'PHH',
        commodityCode: 'RICE',
        ruleConfig: { scale: 'PER_PERSON', quantity: 7.0, unit: 'kg', pricePerUnit: 0.0 },
        explanationI18n: { en: 'Revised festival allocation 7kg' },
        sourceUrl: 'https://consumer.tn.gov.in/test-policy',
        sourceNote: 'Festival enhancement',
        validFrom: '2026-12-01',
      },
      adminUserId
    );
    expect(ruleV2.version).toBe(2);
  });

  // 8. Notices management
  it('TC-A8: adminService.createNotice publishes multilingual department announcement', async () => {
    const notice = await adminService.createNotice(
      {
        titleI18n: {
          en: 'Automated System Maintenance Notice',
          ta: 'கணினி பராமரிப்பு அறிவிப்பு',
        },
        bodyI18n: {
          en: 'Portal services will undergo routine database optimization between 11 PM and midnight.',
          ta: 'இரவு 11 மணி முதல் நள்ளிரவு வரை போர்டல் பராமரிப்பு நடைபெறும்.',
        },
        category: 'MAINTENANCE',
        status: 'PUBLISHED',
      },
      adminUserId
    );

    expect(notice.id).toBeDefined();
    expect(notice.status).toBe('PUBLISHED');

    const noticesList = await adminService.getNotices();
    expect(noticesList.notices.some((n) => n.id === notice.id)).toBe(true);
  });

  // 9. Complaints triage
  it('TC-A9: adminService.updateComplaint updates status and records official response note', async () => {
    // Insert a test complaint
    const cmpRes = await query(
      `
      INSERT INTO complaints (reference_code, category, subject, message, status, shop_id)
      VALUES ($1, 'TIMINGS', 'Counter opened 15 mins late', 'Observed late opening on Saturday morning.', 'RECEIVED', $2)
      RETURNING id, reference_code as "referenceCode"
      `,
      [`CMP-TEST-${Date.now().toString().slice(-4)}`, demoShopId]
    );
    const complaintId = cmpRes.rows[0].id;

    const updated = await adminService.updateComplaint(
      complaintId,
      'RESOLVED',
      'Area inspection completed. Staff instructed to strictly adhere to 08:30 AM schedule.',
      adminUserId
    );

    expect(updated.status).toBe('RESOLVED');
    expect(updated.responseNote).toContain('Area inspection completed');

    // Verify audit log
    const auditRes = await query(
      `SELECT * FROM audit_logs WHERE action = 'TRIAGE_COMPLAINT' AND resource_id = $1`,
      [complaintId]
    );
    expect(auditRes.rows.length).toBe(1);
  });

  // 10. Immutable Audit stream
  it('TC-A10: adminService.getAuditLogs returns chronological event trail', async () => {
    const logsRes = await adminService.getAuditLogs(10, 0);
    expect(Array.isArray(logsRes.auditLogs)).toBe(true);
    expect(logsRes.auditLogs.length).toBeGreaterThanOrEqual(1);

    const latest = logsRes.auditLogs[0];
    expect(latest.id).toBeDefined();
    expect(latest.action).toBeDefined();
    expect(latest.resourceType).toBeDefined();
    expect(latest.timestamp).toBeDefined();
  });
});
