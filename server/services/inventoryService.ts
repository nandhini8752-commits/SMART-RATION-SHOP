import { query, transaction, DbClient } from '../db/connection.js';
import { AppError } from '../middleware/error.js';

export interface StockTransactionInput {
  shopId: string;
  commodityCode: string;
  transactionType: 'RESTOCK' | 'DISTRIBUTION' | 'ADJUSTMENT' | 'REVERSAL';
  quantityDelta: number;
  reason: string;
  actorUserId: string;
  idempotencyKey?: string;
  requestId?: string;
}

export interface DistributeItemInput {
  commodityCode: string;
  quantity: number;
}

export interface DistributeEntitlementInput {
  tokenId: string;
  shopId: string;
  actorUserId: string;
  items: DistributeItemInput[];
  note?: string;
}

export const inventoryService = {
  /**
   * Fetch current inventory items with live balances and reorder thresholds.
   */
  async getShopInventory(shopId: string) {
    const res = await query(
      `
      SELECT 
        si.id,
        si.shop_id as "shopId",
        si.commodity_id as "commodityId",
        c.code as "commodityCode",
        c.name_i18n as "nameI18n",
        c.unit,
        si.quantity_available::numeric as "quantityAvailable",
        si.reorder_level::numeric as "reorderLevel",
        CASE 
          WHEN si.quantity_available = 0 THEN 'OUT_OF_STOCK'
          WHEN si.quantity_available <= si.reorder_level THEN 'LOW_STOCK'
          ELSE 'ADEQUATE'
        END as "status",
        si.updated_at as "updatedAt"
      FROM shop_inventory si
      JOIN commodities c ON c.id = si.commodity_id
      WHERE si.shop_id::text = $1 AND c.is_active = TRUE
      ORDER BY c.code ASC
      `,
      [shopId]
    );

    return {
      shopId,
      inventory: res.rows.map((row: any) => ({
        ...row,
        quantityAvailable: parseFloat(row.quantityAvailable),
        reorderLevel: parseFloat(row.reorderLevel),
      })),
    };
  },

  /**
   * Atomically records a stock adjustment (RESTOCK, ADJUSTMENT, REVERSAL)
   * with immutable audit ledger entry and idempotency protection.
   */
  async recordStockTransaction(input: StockTransactionInput) {
    const {
      shopId,
      commodityCode,
      transactionType,
      quantityDelta,
      reason,
      actorUserId,
      idempotencyKey,
      requestId,
    } = input;

    if (!quantityDelta || isNaN(quantityDelta) || quantityDelta === 0) {
      throw new AppError('Quantity delta must be a non-zero number.', 400, 'INVALID_QUANTITY');
    }

    if (!reason || !reason.trim()) {
      throw new AppError('A valid operational reason is required for stock changes.', 400, 'REASON_REQUIRED');
    }

    return await transaction(async (tx: DbClient) => {
      // 1. Idempotency check if key provided
      if (idempotencyKey) {
        const idempRes = await tx.query(
          `
          SELECT 
            st.id,
            st.transaction_type as "transactionType",
            st.quantity_delta::numeric as "quantityDelta",
            st.quantity_before::numeric as "quantityBefore",
            st.quantity_after::numeric as "quantityAfter",
            st.created_at as "createdAt",
            c.code as "commodityCode"
          FROM stock_transactions st
          JOIN commodities c ON c.id = st.commodity_id
          WHERE st.actor_id::text = $1 AND st.idempotency_key = $2
          `,
          [actorUserId, idempotencyKey]
        );

        if (idempRes.rows.length > 0) {
          const row = idempRes.rows[0];
          return {
            transaction: {
              ...row,
              quantityDelta: parseFloat(row.quantityDelta),
              quantityBefore: parseFloat(row.quantityBefore),
              quantityAfter: parseFloat(row.quantityAfter),
            },
            idempotentReplay: true,
          };
        }
      }

      // 2. Fetch commodity
      const comRes = await tx.query(
        `SELECT id, code, name_i18n as "nameI18n", unit FROM commodities WHERE code = $1 AND is_active = TRUE`,
        [commodityCode]
      );

      if (comRes.rows.length === 0) {
        throw new AppError(`Commodity code '${commodityCode}' not recognized or inactive.`, 404, 'NOT_FOUND');
      }
      const commodity = comRes.rows[0];

      // 3. Lock/fetch current shop inventory
      const invRes = await tx.query(
        `
        SELECT id, quantity_available::numeric as "quantityAvailable"
        FROM shop_inventory
        WHERE shop_id::text = $1 AND commodity_id::text = $2
        `,
        [shopId, commodity.id]
      );

      let currentQty = 0;
      let inventoryId = null;

      if (invRes.rows.length === 0) {
        // If row doesn't exist yet, insert baseline
        const initRes = await tx.query(
          `
          INSERT INTO shop_inventory (shop_id, commodity_id, quantity_available, reorder_level, updated_by)
          VALUES ($1::uuid, $2::uuid, 0, 10, $3::uuid)
          RETURNING id, quantity_available::numeric as "quantityAvailable"
          `,
          [shopId, commodity.id, actorUserId]
        );
        inventoryId = initRes.rows[0].id;
        currentQty = 0;
      } else {
        inventoryId = invRes.rows[0].id;
        currentQty = parseFloat(invRes.rows[0].quantityAvailable);
      }

      const quantityBefore = currentQty;
      const quantityAfter = parseFloat((quantityBefore + quantityDelta).toFixed(3));

      if (quantityAfter < 0) {
        throw new AppError(
          `Insufficient stock. Available: ${quantityBefore} ${commodity.unit}, Requested deduction: ${Math.abs(quantityDelta)} ${commodity.unit}`,
          409,
          'INSUFFICIENT_STOCK'
        );
      }

      // 4. Update shop inventory
      await tx.query(
        `
        UPDATE shop_inventory
        SET quantity_available = $1,
            updated_by = $2::uuid,
            updated_at = NOW()
        WHERE id = $3
        `,
        [quantityAfter, actorUserId, inventoryId]
      );

      // 5. Append immutable stock transaction
      const txRes = await tx.query(
        `
        INSERT INTO stock_transactions (
          shop_id,
          commodity_id,
          transaction_type,
          quantity_delta,
          quantity_before,
          quantity_after,
          reason,
          actor_id,
          idempotency_key,
          request_id
        ) VALUES (
          $1::uuid,
          $2::uuid,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8::uuid,
          $9,
          $10
        )
        RETURNING 
          id,
          transaction_type as "transactionType",
          quantity_delta::numeric as "quantityDelta",
          quantity_before::numeric as "quantityBefore",
          quantity_after::numeric as "quantityAfter",
          reason,
          created_at as "createdAt"
        `,
        [
          shopId,
          commodity.id,
          transactionType,
          quantityDelta,
          quantityBefore,
          quantityAfter,
          reason.trim(),
          actorUserId,
          idempotencyKey || null,
          requestId || null,
        ]
      );

      // 6. Audit log
      await tx.query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, reason, new_values)
        VALUES ($1::uuid, 'STOCK_' || $2, 'shop_inventory', $3::text, $4, $5)
        `,
        [
          actorUserId,
          transactionType,
          commodity.id,
          reason.trim(),
          JSON.stringify({
            commodityCode,
            quantityBefore,
            quantityDelta,
            quantityAfter,
            transactionId: txRes.rows[0].id,
          }),
        ]
      );

      const created = txRes.rows[0];
      return {
        transaction: {
          ...created,
          commodityCode,
          unit: commodity.unit,
          quantityDelta: parseFloat(created.quantityDelta),
          quantityBefore: parseFloat(created.quantityBefore),
          quantityAfter: parseFloat(created.quantityAfter),
        },
        idempotentReplay: false,
      };
    });
  },

  /**
   * Fetches the immutable stock ledger for audit and verification.
   */
  async getStockLedger(
    shopId: string,
    options: {
      type?: string;
      commodityCode?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const conditions = ['st.shop_id::text = $1'];
    const values: any[] = [shopId];

    if (options.type && options.type !== 'ALL') {
      values.push(options.type);
      conditions.push(`st.transaction_type = $${values.length}`);
    }

    if (options.commodityCode) {
      values.push(options.commodityCode);
      conditions.push(`c.code = $${values.length}`);
    }

    const limit = Math.min(Math.max(options.limit || 50, 1), 200);
    const offset = Math.max(options.offset || 0, 0);

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const res = await query(
      `
      SELECT 
        st.id,
        st.created_at as "timestamp",
        c.code as "commodityCode",
        c.name_i18n as "commodityNameI18n",
        c.unit,
        st.transaction_type as "type",
        st.quantity_delta::numeric as "delta",
        st.quantity_before::numeric as "before",
        st.quantity_after::numeric as "after",
        u.username as "actorUsername",
        u.full_name as "actorFullName",
        st.reason,
        st.idempotency_key as "idempotencyKey"
      FROM stock_transactions st
      JOIN commodities c ON c.id = st.commodity_id
      JOIN app_users u ON u.id = st.actor_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY st.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      values
    );

    return {
      shopId,
      ledger: res.rows.map((row: any) => ({
        ...row,
        delta: parseFloat(row.delta),
        before: parseFloat(row.before),
        after: parseFloat(row.after),
      })),
      limit,
      offset,
    };
  },

  /**
   * Atomic distribution dispensation:
   * 1. Validates queue token is in SERVING state
   * 2. Inserts distribution_transactions record
   * 3. For each item: deducts stock in shop_inventory, writes distribution_items, logs to stock_transactions
   * 4. Updates queue token to COMPLETED
   * 5. Emits audit log
   */
  async distributeEntitlement(input: DistributeEntitlementInput) {
    const { tokenId, shopId, actorUserId, items, note } = input;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('At least one commodity item must be dispensed.', 400, 'NO_ITEMS');
    }

    return await transaction(async (tx: DbClient) => {
      // 1. Verify token
      const tokenRes = await tx.query(
        `
        SELECT 
          qt.id,
          qt.status,
          qt.token_number as "tokenNumber",
          qt.shop_id as "shopId",
          qt.ration_card_id as "rationCardId"
        FROM queue_tokens qt
        WHERE qt.id::text = $1
        `,
        [tokenId]
      );

      if (tokenRes.rows.length === 0) {
        throw new AppError('Queue token not found.', 404, 'NOT_FOUND');
      }

      const token = tokenRes.rows[0];
      if (token.shopId !== shopId) {
        throw new AppError('Token does not belong to your shop.', 403, 'FORBIDDEN');
      }

      if (token.status !== 'SERVING') {
        throw new AppError(
          `Cannot dispense to token in status ${token.status}. Token must be in SERVING status.`,
          409,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // 2. Create distribution_transactions
      const distTxRes = await tx.query(
        `
        INSERT INTO distribution_transactions (
          token_id, shop_id, ration_card_id, operator_id, note
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5
        )
        RETURNING id, completed_at as "completedAt", note
        `,
        [tokenId, shopId, token.rationCardId, actorUserId, note || 'Distribution completed at counter']
      );
      const distTx = distTxRes.rows[0];

      const dispensedItems = [];

      // 3. Process each commodity item atomically
      for (const it of items) {
        const qty = parseFloat(it.quantity as any);
        if (isNaN(qty) || qty <= 0) {
          throw new AppError(`Invalid dispensation quantity for commodity '${it.commodityCode}'.`, 400, 'INVALID_QUANTITY');
        }

        const comRes = await tx.query(
          `SELECT id, code, unit FROM commodities WHERE code = $1 AND is_active = TRUE`,
          [it.commodityCode]
        );
        if (comRes.rows.length === 0) {
          throw new AppError(`Commodity '${it.commodityCode}' not recognized or inactive.`, 404, 'NOT_FOUND');
        }
        const commodity = comRes.rows[0];

        // Fetch current stock
        const invRes = await tx.query(
          `
          SELECT id, quantity_available::numeric as "quantityAvailable"
          FROM shop_inventory
          WHERE shop_id::text = $1 AND commodity_id::text = $2
          `,
          [shopId, commodity.id]
        );

        if (invRes.rows.length === 0) {
          throw new AppError(`No inventory record found for commodity ${commodity.code}.`, 409, 'INSUFFICIENT_STOCK');
        }

        const inv = invRes.rows[0];
        const currentQty = parseFloat(inv.quantityAvailable);
        if (currentQty < qty) {
          throw new AppError(
            `Insufficient stock for ${commodity.code}. Available: ${currentQty} ${commodity.unit}, required: ${qty} ${commodity.unit}.`,
            409,
            'INSUFFICIENT_STOCK'
          );
        }

        const newQty = parseFloat((currentQty - qty).toFixed(3));

        // Deduct inventory
        await tx.query(
          `
          UPDATE shop_inventory
          SET quantity_available = $1,
              updated_by = $2::uuid,
              updated_at = NOW()
          WHERE id = $3
          `,
          [newQty, actorUserId, inv.id]
        );

        // Record distribution_items
        const distItemRes = await tx.query(
          `
          INSERT INTO distribution_items (distribution_id, commodity_id, quantity, unit)
          VALUES ($1::uuid, $2::uuid, $3, $4)
          RETURNING id, quantity::numeric as "quantity", unit
          `,
          [distTx.id, commodity.id, qty, commodity.unit]
        );
        const distItem = distItemRes.rows[0];

        // Record stock_transactions
        await tx.query(
          `
          INSERT INTO stock_transactions (
            shop_id, commodity_id, transaction_type, quantity_delta, quantity_before, quantity_after,
            reason, actor_id, distribution_item_id
          ) VALUES (
            $1::uuid, $2::uuid, 'DISTRIBUTION', $3, $4, $5, $6, $7::uuid, $8::uuid
          )
          `,
          [
            shopId,
            commodity.id,
            -qty,
            currentQty,
            newQty,
            `Dispensed for token ${token.tokenNumber}`,
            actorUserId,
            distItem.id,
          ]
        );

        dispensedItems.push({
          commodityCode: commodity.code,
          quantity: qty,
          unit: commodity.unit,
        });
      }

      // 4. Complete queue token
      await tx.query(
        `
        UPDATE queue_tokens
        SET status = 'COMPLETED',
            completed_at = NOW(),
            status_reason = $2,
            version = version + 1
        WHERE id::text = $1
        `,
        [tokenId, note || 'Distribution completed successfully']
      );

      // 5. Audit log
      await tx.query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, reason, new_values)
        VALUES ($1::uuid, 'DISTRIBUTION_COMPLETED', 'queue_tokens', $2::text, $3, $4)
        `,
        [
          actorUserId,
          tokenId,
          note || 'Entitlement distributed at counter',
          JSON.stringify({
            tokenNumber: token.tokenNumber,
            distributionId: distTx.id,
            items: dispensedItems,
          }),
        ]
      );

      return {
        distributionId: distTx.id,
        tokenId,
        tokenNumber: token.tokenNumber,
        status: 'COMPLETED',
        completedAt: distTx.completedAt,
        items: dispensedItems,
      };
    });
  },
};
