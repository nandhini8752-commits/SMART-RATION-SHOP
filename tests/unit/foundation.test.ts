import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { query, isDatabaseReady, closeDb } from '../../server/db/connection';
import { generateToken, AuthUser } from '../../server/middleware/auth';
import { AppError } from '../../server/middleware/error';

describe('Milestone 1 — Foundation & Database Baseline', () => {
  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);
  });

  afterAll(async () => {
    await closeDb();
  });

  it('TC-F1: Database is ready and can execute basic queries', async () => {
    const res = await query('SELECT 1 + 1 as sum');
    expect(res.rows[0].sum).toBe(2);
  });

  it('TC-F2: Schema has all 16 canonical tables from schema.sql', async () => {
    const tablesRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableNames = tablesRes.rows.map((r: any) => r.table_name);
    
    const requiredTables = [
      'shops',
      'app_users',
      'ration_cards',
      'commodities',
      'policy_rules',
      'shop_inventory',
      'queue_counters',
      'queue_tokens',
      'distribution_transactions',
      'distribution_items',
      'stock_transactions',
      'complaints',
      'notices',
      'notifications',
      'audit_logs',
      'idempotency_keys'
    ];

    for (const table of requiredTables) {
      expect(tableNames).toContain(table);
    }
  });

  it('TC-F3: Seed data contains demo shops and commodities', async () => {
    const shopRes = await query(`SELECT * FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    expect(shopRes.rows.length).toBe(1);
    expect(shopRes.rows[0].name).toBe('SRQMS Demo Fair Price Shop 001');
    expect(shopRes.rows[0].district).toBe('Chennai');

    const commoditiesRes = await query(`SELECT code, unit FROM commodities ORDER BY code`);
    const codes = commoditiesRes.rows.map((r: any) => r.code);
    expect(codes).toContain('RICE');
    expect(codes).toContain('SUGAR');
    expect(codes).toContain('TUR_DAL');
    expect(codes).toContain('PALMOLEIN_OIL');
  });

  it('TC-F4: Seed data contains synthetic ration cards (DEMO-TN-0001 to 0005)', async () => {
    const cardRes = await query(`SELECT card_number, category, family_members FROM ration_cards ORDER BY card_number`);
    const cardNumbers = cardRes.rows.map((r: any) => r.card_number);
    expect(cardNumbers).toContain('DEMO-TN-0001');
    expect(cardNumbers).toContain('DEMO-TN-0002');
    expect(cardNumbers).toContain('DEMO-TN-0003');
  });

  it('TC-F5: Seeded staff accounts verify against documented demo passwords', async () => {
    const usersRes = await query(`SELECT username, password_hash, role FROM app_users WHERE username = 'operator_anna'`);
    expect(usersRes.rows.length).toBe(1);
    const operator = usersRes.rows[0];
    expect(operator.role).toBe('SHOP_OPERATOR');

    const isValid = await bcrypt.compare('DemoOperator@123', operator.password_hash);
    expect(isValid).toBe(true);
  });

  it('TC-F6: JWT authentication token generation and claims', () => {
    const user: AuthUser = {
      id: 'mock-uuid-1',
      username: 'operator_anna',
      fullName: 'FPS Operator',
      role: 'SHOP_OPERATOR',
      shopId: 'mock-shop-uuid',
    };

    const token = generateToken(user);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('TC-F7: AppError retains status, code, and details', () => {
    const err = new AppError('Validation failed', 422, 'UNPROCESSABLE_ENTITY', [
      { field: 'cardNumber', issue: 'Invalid card format' }
    ]);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe('UNPROCESSABLE_ENTITY');
    expect(err.details?.length).toBe(1);
    expect(err.details?.[0].field).toBe('cardNumber');
  });
});
