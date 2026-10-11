import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isDatabaseReady, closeDb, query } from '../../server/db/connection';
import { inventoryService } from '../../server/services/inventoryService';
import { queueService } from '../../server/services/queueService';
import { staffService } from '../../server/services/staffService';
import { AppError } from '../../server/middleware/error';

describe('Milestone 5 — Inventory Management & Transactional Audit Ledger', () => {
  let demoShopId: string;
  let operatorUserId: string;
  let demoCardId: string;

  beforeAll(async () => {
    const ready = await isDatabaseReady();
    expect(ready).toBe(true);

    const shopRes = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001'`);
    demoShopId = shopRes.rows[0].id;

    const userRes = await query(`SELECT id FROM app_users WHERE username = 'operator_anna'`);
    operatorUserId = userRes.rows[0].id;

    const cardRes = await query(`SELECT id FROM ration_cards WHERE card_number = 'DEMO-TN-0001'`);
    demoCardId = cardRes.rows[0].id;
  });

  afterAll(async () => {
    await closeDb();
  });

  // 1. Inventory snapshot
  it('TC-IN1: inventoryService.getShopInventory returns active commodities with balances and statuses', async () => {
    const res = await inventoryService.getShopInventory(demoShopId);
    expect(res).toBeDefined();
    expect(res.shopId).toBe(demoShopId);
    expect(Array.isArray(res.inventory)).toBe(true);
    expect(res.inventory.length).toBeGreaterThanOrEqual(4);

    const rice = res.inventory.find((i) => i.commodityCode === 'RICE');
    expect(rice).toBeDefined();
    expect(rice.unit).toBe('kg');
    expect(typeof rice.quantityAvailable).toBe('number');
    expect(['ADEQUATE', 'LOW_STOCK', 'OUT_OF_STOCK']).toContain(rice.status);
  });

  // 2. Restock intake
  it('TC-IN2: recordStockTransaction records atomic restock, updates inventory, and logs to ledger and audit_logs', async () => {
    // Check initial stock for RICE
    const beforeInv = await inventoryService.getShopInventory(demoShopId);
    const riceBefore = beforeInv.inventory.find((i) => i.commodityCode === 'RICE')!;

    const restockQty = 75;
    const idempotencyKey = `restock-test-${Date.now()}`;
    const reason = 'Godown lorry delivery challan #TN-TEST-99';

    const result = await inventoryService.recordStockTransaction({
      shopId: demoShopId,
      commodityCode: 'RICE',
      transactionType: 'RESTOCK',
      quantityDelta: restockQty,
      reason,
      actorUserId: operatorUserId,
      idempotencyKey,
    });

    expect(result.idempotentReplay).toBe(false);
    expect(result.transaction).toBeDefined();
    expect(result.transaction.commodityCode).toBe('RICE');
    expect(result.transaction.quantityDelta).toBe(restockQty);
    expect(result.transaction.quantityBefore).toBe(riceBefore.quantityAvailable);
    expect(result.transaction.quantityAfter).toBe(riceBefore.quantityAvailable + restockQty);

    // Verify shop_inventory was updated
    const afterInv = await inventoryService.getShopInventory(demoShopId);
    const riceAfter = afterInv.inventory.find((i) => i.commodityCode === 'RICE')!;
    expect(riceAfter.quantityAvailable).toBe(riceBefore.quantityAvailable + restockQty);

    // Verify audit_logs has the entry
    const auditRes = await query(
      `SELECT * FROM audit_logs WHERE action = 'STOCK_RESTOCK' AND actor_id::text = $1 ORDER BY created_at DESC LIMIT 1`,
      [operatorUserId]
    );
    expect(auditRes.rows.length).toBe(1);
    expect(auditRes.rows[0].reason).toBe(reason);
  });

  // 3. Idempotency replay
  it('TC-IN3: recordStockTransaction is idempotent: replays do not duplicate stock updates', async () => {
    const key = `idemp-check-${Date.now()}`;
    const input = {
      shopId: demoShopId,
      commodityCode: 'SUGAR',
      transactionType: 'RESTOCK' as const,
      quantityDelta: 25,
      reason: 'Sugar stock replenishment',
      actorUserId: operatorUserId,
      idempotencyKey: key,
    };

    const firstRun = await inventoryService.recordStockTransaction(input);
    expect(firstRun.idempotentReplay).toBe(false);

    const invAfterFirst = await inventoryService.getShopInventory(demoShopId);
    const sugarAfterFirst = invAfterFirst.inventory.find((i) => i.commodityCode === 'SUGAR')!.quantityAvailable;

    // Second run with same idempotency key and actor
    const secondRun = await inventoryService.recordStockTransaction(input);
    expect(secondRun.idempotentReplay).toBe(true);
    expect(secondRun.transaction.id).toBe(firstRun.transaction.id);

    const invAfterSecond = await inventoryService.getShopInventory(demoShopId);
    const sugarAfterSecond = invAfterSecond.inventory.find((i) => i.commodityCode === 'SUGAR')!.quantityAvailable;

    // Stock MUST not have doubled
    expect(sugarAfterSecond).toBe(sugarAfterFirst);
  });

  // 4. Over-deduction prevention
  it('TC-IN4: recordStockTransaction rejects deductions exceeding available stock', async () => {
    const inv = await inventoryService.getShopInventory(demoShopId);
    const dal = inv.inventory.find((i) => i.commodityCode === 'TUR_DAL')!;

    const excessDeduction = -(dal.quantityAvailable + 500);

    await expect(
      inventoryService.recordStockTransaction({
        shopId: demoShopId,
        commodityCode: 'TUR_DAL',
        transactionType: 'ADJUSTMENT',
        quantityDelta: excessDeduction,
        reason: 'Spoilage write-off attempt beyond stock',
        actorUserId: operatorUserId,
      })
    ).rejects.toThrowError(AppError);
  });

  // 5. Stock movement ledger
  it('TC-IN5: getStockLedger retrieves chronological movements with actor details and filters', async () => {
    const ledgerAll = await inventoryService.getStockLedger(demoShopId, { limit: 20 });
    expect(ledgerAll.ledger.length).toBeGreaterThan(0);

    const firstEntry = ledgerAll.ledger[0];
    expect(firstEntry.id).toBeDefined();
    expect(firstEntry.commodityCode).toBeDefined();
    expect(firstEntry.type).toBeDefined();
    expect(typeof firstEntry.delta).toBe('number');
    expect(firstEntry.actorUsername).toBe('operator_anna');

    // Filter by RESTOCK
    const ledgerRestock = await inventoryService.getStockLedger(demoShopId, { type: 'RESTOCK' });
    expect(ledgerRestock.ledger.every((l) => l.type === 'RESTOCK')).toBe(true);
  });

  // 6. Entitlement dispensation
  it('TC-IN6: distributeEntitlement atomically dispenses commodities, logs distribution and stock transactions, and completes token', async () => {
    // 1. Create/ensure isolated test card for shop
    const testCardRes = await query(
      `
      INSERT INTO ration_cards (card_number, category, head_name, family_members, shop_id, locality, is_demo)
      VALUES ('DEMO-TN-IN06', 'PHH', 'Test Dispense Beneficiary', 4, $1, 'Anna Nagar East', TRUE)
      ON CONFLICT (card_number) DO UPDATE SET shop_id = EXCLUDED.shop_id
      RETURNING id
      `,
      [demoShopId]
    );
    const cardId = testCardRes.rows[0].id;
    await query(`DELETE FROM stock_transactions WHERE distribution_item_id IN (SELECT di.id FROM distribution_items di JOIN distribution_transactions dt ON dt.id = di.distribution_id WHERE dt.ration_card_id = $1)`, [cardId]);
    await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE ration_card_id = $1)`, [cardId]);
    await query(`DELETE FROM distribution_transactions WHERE ration_card_id = $1`, [cardId]);
    await query(`DELETE FROM queue_tokens WHERE ration_card_id = $1`, [cardId]);

    const tokenGen = await queueService.generateToken({ shopId: demoShopId, rationCardId: cardId });
    const token = tokenGen.token;

    // 2. Put token in SERVING state
    await query(
      `UPDATE queue_tokens SET status = 'SERVING', counter_no = 1, serving_started_at = NOW() WHERE id = $1`,
      [token.id]
    );

    // 3. Get initial stock of RICE & SUGAR
    const invBefore = await inventoryService.getShopInventory(demoShopId);
    const riceBefore = invBefore.inventory.find((i) => i.commodityCode === 'RICE')!.quantityAvailable;
    const sugarBefore = invBefore.inventory.find((i) => i.commodityCode === 'SUGAR')!.quantityAvailable;

    // 4. Distribute 15kg RICE and 1kg SUGAR
    const dispenseResult = await inventoryService.distributeEntitlement({
      tokenId: token.id,
      shopId: demoShopId,
      actorUserId: operatorUserId,
      items: [
        { commodityCode: 'RICE', quantity: 15 },
        { commodityCode: 'SUGAR', quantity: 1 },
      ],
      note: 'Normal monthly ration dispensation',
    });

    expect(dispenseResult.status).toBe('COMPLETED');
    expect(dispenseResult.tokenNumber).toBe(token.tokenNumber);
    expect(dispenseResult.items.length).toBe(2);

    // 5. Verify token status in database
    const tokenCheck = await query(`SELECT status FROM queue_tokens WHERE id = $1`, [token.id]);
    expect(tokenCheck.rows[0].status).toBe('COMPLETED');

    // 6. Verify inventory balance deduction
    const invAfter = await inventoryService.getShopInventory(demoShopId);
    const riceAfter = invAfter.inventory.find((i) => i.commodityCode === 'RICE')!.quantityAvailable;
    const sugarAfter = invAfter.inventory.find((i) => i.commodityCode === 'SUGAR')!.quantityAvailable;

    expect(riceAfter).toBe(riceBefore - 15);
    expect(sugarAfter).toBe(sugarBefore - 1);

    // 7. Verify distribution_transactions & items in database
    const distTxRes = await query(`SELECT * FROM distribution_transactions WHERE id = $1`, [dispenseResult.distributionId]);
    expect(distTxRes.rows.length).toBe(1);

    const distItemsRes = await query(
      `SELECT * FROM distribution_items WHERE distribution_id = $1`,
      [dispenseResult.distributionId]
    );
    expect(distItemsRes.rows.length).toBe(2);
  });

  // 7. Non-SERVING token dispensation rejection
  it('TC-IN7: distributeEntitlement rejects dispensation if token is not in SERVING status', async () => {
    // Issue token in WAITING status
    const testCardRes = await query(
      `
      INSERT INTO ration_cards (card_number, category, head_name, family_members, shop_id, locality, is_demo)
      VALUES ('DEMO-TN-IN07', 'PHH', 'Test Dispense Beneficiary 7', 3, $1, 'Anna Nagar East', TRUE)
      ON CONFLICT (card_number) DO UPDATE SET shop_id = EXCLUDED.shop_id
      RETURNING id
      `,
      [demoShopId]
    );
    const cardId = testCardRes.rows[0].id;
    await query(`DELETE FROM stock_transactions WHERE distribution_item_id IN (SELECT di.id FROM distribution_items di JOIN distribution_transactions dt ON dt.id = di.distribution_id WHERE dt.ration_card_id = $1)`, [cardId]);
    await query(`DELETE FROM distribution_items WHERE distribution_id IN (SELECT id FROM distribution_transactions WHERE ration_card_id = $1)`, [cardId]);
    await query(`DELETE FROM distribution_transactions WHERE ration_card_id = $1`, [cardId]);
    await query(`DELETE FROM queue_tokens WHERE ration_card_id = $1`, [cardId]);

    const waitingTokenGen = await queueService.generateToken({ shopId: demoShopId, rationCardId: cardId });
    const waitingToken = waitingTokenGen.token;

    await expect(
      inventoryService.distributeEntitlement({
        tokenId: waitingToken.id,
        shopId: demoShopId,
        actorUserId: operatorUserId,
        items: [{ commodityCode: 'RICE', quantity: 5 }],
      })
    ).rejects.toThrowError(AppError);
  });
});
