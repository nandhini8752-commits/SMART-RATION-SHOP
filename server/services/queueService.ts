import { query, transaction, DbClient } from '../db/connection';
import { AppError } from '../middleware/error';
import { notificationService } from './notificationService.js';

export interface CreateTokenParams {
  rationCardId: string;
  shopId: string;
  idempotencyKey?: string;
  verificationId?: string;
}

export const queueService = {
  /**
   * Generates a new FIFO queue token inside a transaction.
   * Prevents duplicate active tokens per card/shop/day.
   */
  async generateToken(params: CreateTokenParams) {
    const today = new Date().toISOString().split('T')[0];

    return await transaction(async (tx: DbClient) => {
      // 1. Check if card already has an active WAITING or SERVING token today
      const activeCheck = await tx.query(
        `
        SELECT 
          qt.id,
          qt.token_number as "tokenNumber",
          qt.sequence_no as "sequenceNo",
          qt.status,
          qt.counter_no as "counterNo",
          qt.service_date as "serviceDate",
          qt.created_at as "createdAt",
          s.shop_code as "shopCode",
          s.name as "shopName"
        FROM queue_tokens qt
        JOIN shops s ON s.id = qt.shop_id
        WHERE qt.ration_card_id::text = $1 
          AND qt.service_date::text = $2 
          AND qt.status IN ('WAITING', 'SERVING')
        LIMIT 1
        `,
        [params.rationCardId, today]
      );

      if (activeCheck.rows.length > 0) {
        const existing = activeCheck.rows[0];
        const posInfo = await this.calculatePosition(existing.id, tx);
        return {
          token: existing,
          alreadyActive: true,
          ...posInfo,
        };
      }

      // 2. Fetch monotonic next sequence number for this shop & date
      const seqRes = await tx.query(
        `
        SELECT COALESCE(MAX(sequence_no), 0) + 1 as "nextSeq"
        FROM queue_tokens
        WHERE shop_id::text = $1 AND service_date::text = $2
        `,
        [params.shopId, today]
      );
      const nextSeq = parseInt(seqRes.rows[0].nextSeq, 10);
      const tokenNumber = `TK-${String(nextSeq).padStart(3, '0')}`;

      // 3. Insert new queue token
      const insertRes = await tx.query(
        `
        INSERT INTO queue_tokens (
          shop_id,
          ration_card_id,
          service_date,
          sequence_no,
          token_number,
          status,
          created_by_verification
        )
        VALUES ($1, $2, $3, $4, $5, 'WAITING', $6)
        RETURNING 
          id,
          shop_id as "shopId",
          ration_card_id as "rationCardId",
          service_date as "serviceDate",
          sequence_no as "sequenceNo",
          token_number as "tokenNumber",
          status,
          created_at as "createdAt"
        `,
        [
          params.shopId,
          params.rationCardId,
          today,
          nextSeq,
          tokenNumber,
          params.verificationId || null,
        ]
      );

      const newToken = insertRes.rows[0];
      const posInfo = await this.calculatePosition(newToken.id, tx);

      // Multi-channel notification dispatch
      try {
        const cardRes = await tx.query(
          `SELECT demo_mobile_masked FROM ration_cards WHERE id::text = $1`,
          [params.rationCardId]
        );
        const shopRes = await tx.query(
          `SELECT name FROM shops WHERE id::text = $1`,
          [params.shopId]
        );
        const dest = cardRes.rows[0]?.demo_mobile_masked || 'XXXXXX8910';
        const shopName = shopRes.rows[0]?.name || 'Fair Price Shop';

        await notificationService.dispatchQueueNotification({
          tokenId: newToken.id,
          eventType: 'TOKEN_ISSUED',
          destination: dest,
          tokenNumber: newToken.tokenNumber,
          shopName,
          queueAhead: posInfo.customersAhead,
          estimatedWaitMinutes: posInfo.estimatedWaitMinutes,
        }, tx);
      } catch (err) {
        console.warn('[Queue] Notification dispatch error (non-blocking):', err);
      }

      return {
        token: newToken,
        alreadyActive: false,
        ...posInfo,
      };
    });
  },

  /**
   * Calculates the current position and approximate wait time for a token.
   */
  async calculatePosition(tokenId: string, client?: DbClient) {
    const db = client || { query };

    const tokenRes = await db.query(
      `
      SELECT id, shop_id, service_date, sequence_no, status, counter_no
      FROM queue_tokens
      WHERE id::text = $1
      `,
      [tokenId]
    );

    if (tokenRes.rows.length === 0) {
      throw new AppError('Queue token not found', 404, 'TOKEN_NOT_FOUND');
    }

    const token = tokenRes.rows[0];

    if (token.status === 'SERVING') {
      return {
        status: 'SERVING',
        position: 0,
        customersAhead: 0,
        estimatedWaitMinutes: 0,
        estimateMethod: 'at_counter',
        counterNo: token.counter_no,
      };
    }

    if (token.status !== 'WAITING') {
      return {
        status: token.status,
        position: 0,
        customersAhead: 0,
        estimatedWaitMinutes: 0,
        estimateMethod: 'none',
      };
    }

    // Count waiting tokens with earlier sequence number
    const countRes = await db.query(
      `
      SELECT COUNT(*) as "ahead"
      FROM queue_tokens
      WHERE shop_id::text = $1 
        AND service_date::text = $2 
        AND status = 'WAITING' 
        AND sequence_no < $3
      `,
      [token.shop_id, token.service_date, token.sequence_no]
    );

    const customersAhead = parseInt(countRes.rows[0]?.ahead || '0', 10);
    const position = customersAhead + 1;
    const estimatedWaitMinutes = Math.max(1, Math.round(customersAhead * 3.5));

    return {
      status: 'WAITING',
      position,
      customersAhead,
      estimatedWaitMinutes,
      estimateMethod: 'demo_average_service_minutes',
    };
  },

  /**
   * Retrieves token status details safe for citizen display.
   */
  async getTokenDetails(tokenId: string) {
    const res = await query(
      `
      SELECT 
        qt.id,
        qt.token_number as "tokenNumber",
        qt.sequence_no as "sequenceNo",
        qt.service_date as "serviceDate",
        qt.status,
        qt.counter_no as "counterNo",
        qt.created_at as "createdAt",
        qt.serving_started_at as "servingStartedAt",
        qt.completed_at as "completedAt",
        qt.cancelled_at as "cancelledAt",
        s.shop_code as "shopCode",
        s.name as "shopName",
        rc.card_number as "cardNumber",
        rc.category as "cardCategory",
        rc.head_name as "headName",
        rc.demo_mobile_masked as "demoMobileMasked"
      FROM queue_tokens qt
      JOIN shops s ON s.id = qt.shop_id
      JOIN ration_cards rc ON rc.id = qt.ration_card_id
      WHERE qt.id::text = $1 OR qt.token_number = $1
      LIMIT 1
      `,
      [tokenId]
    );

    if (res.rows.length === 0) {
      throw new AppError('Queue token not found', 404, 'NOT_FOUND');
    }

    const token = res.rows[0];
    const posInfo = await this.calculatePosition(token.id);

    return {
      ...token,
      ...posInfo,
    };
  },

  /**
   * Cancels a token if it is currently in WAITING status.
   */
  async cancelToken(tokenId: string, reason = 'Cancelled by beneficiary') {
    return await transaction(async (tx: DbClient) => {
      const tokenRes = await tx.query(
        `SELECT id, status FROM queue_tokens WHERE id::text = $1`,
        [tokenId]
      );

      if (tokenRes.rows.length === 0) {
        throw new AppError('Queue token not found', 404, 'NOT_FOUND');
      }

      const currentStatus = tokenRes.rows[0].status;
      if (currentStatus !== 'WAITING') {
        throw new AppError(
          `Cannot cancel token in status ${currentStatus}. Only WAITING tokens may be cancelled.`,
          409,
          'INVALID_STATUS_TRANSITION'
        );
      }

      await tx.query(
        `
        UPDATE queue_tokens 
        SET status = 'CANCELLED',
            cancelled_at = NOW(),
            status_reason = $2
        WHERE id = $1
        `,
        [tokenId, reason]
      );

      return {
        id: tokenId,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        reason,
      };
    });
  },
};
