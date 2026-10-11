import { query, transaction, DbClient } from '../db/connection';
import { AppError } from '../middleware/error';
import { notificationService } from './notificationService.js';

export const staffService = {
  /**
   * Fetches active queue state, counters, and summaries for a shop.
   */
  async getQueue(shopId: string, options: { serviceDate?: string; counterNo?: number; status?: string } = {}) {
    const today = options.serviceDate || new Date().toISOString().split('T')[0];

    // 1. Fetch counters for this shop
    const countersRes = await query(
      `
      SELECT 
        counter_no as "counterNo",
        display_name as "displayName",
        is_open as "isOpen"
      FROM queue_counters
      WHERE shop_id::text = $1
      ORDER BY counter_no ASC
      `,
      [shopId]
    );

    // 2. Fetch summary metrics
    const summaryRes = await query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'WAITING') as "waitingCount",
        COUNT(*) FILTER (WHERE status = 'SERVING') as "servingCount",
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as "completedCount",
        COUNT(*) FILTER (WHERE status = 'CANCELLED') as "cancelledCount",
        COUNT(*) FILTER (WHERE status = 'NO_SHOW') as "noShowCount"
      FROM queue_tokens
      WHERE shop_id::text = $1 AND service_date::text = $2
      `,
      [shopId, today]
    );

    const counts = summaryRes.rows[0] || {};
    const summary = {
      waitingCount: parseInt(counts.waitingCount || '0', 10),
      servingCount: parseInt(counts.servingCount || '0', 10),
      completedCount: parseInt(counts.completedCount || '0', 10),
      cancelledCount: parseInt(counts.cancelledCount || '0', 10),
      noShowCount: parseInt(counts.noShowCount || '0', 10),
      totalIssued: parseInt(counts.waitingCount || '0', 10) +
                   parseInt(counts.servingCount || '0', 10) +
                   parseInt(counts.completedCount || '0', 10) +
                   parseInt(counts.cancelledCount || '0', 10) +
                   parseInt(counts.noShowCount || '0', 10),
    };

    // 3. Fetch currently SERVING tokens
    const servingRes = await query(
      `
      SELECT 
        qt.id,
        qt.token_number as "tokenNumber",
        qt.sequence_no as "sequenceNo",
        qt.counter_no as "counterNo",
        qt.status,
        qt.serving_started_at as "servingStartedAt",
        rc.card_number as "cardNumber",
        rc.head_name as "headName",
        rc.category as "category",
        rc.family_members as "familyMembers",
        rc.demo_mobile_masked as "demoMobileMasked"
      FROM queue_tokens qt
      JOIN ration_cards rc ON rc.id = qt.ration_card_id
      WHERE qt.shop_id::text = $1 
        AND qt.service_date::text = $2 
        AND qt.status = 'SERVING'
      ORDER BY qt.counter_no ASC
      `,
      [shopId, today]
    );

    // 4. Fetch WAITING tokens (strict FIFO order)
    const waitingRes = await query(
      `
      SELECT 
        qt.id,
        qt.token_number as "tokenNumber",
        qt.sequence_no as "sequenceNo",
        qt.status,
        qt.created_at as "createdAt",
        rc.card_number as "cardNumber",
        rc.head_name as "headName",
        rc.category as "category",
        rc.family_members as "familyMembers",
        rc.demo_mobile_masked as "demoMobileMasked"
      FROM queue_tokens qt
      JOIN ration_cards rc ON rc.id = qt.ration_card_id
      WHERE qt.shop_id::text = $1 
        AND qt.service_date::text = $2 
        AND qt.status = 'WAITING'
      ORDER BY qt.sequence_no ASC
      LIMIT 100
      `,
      [shopId, today]
    );

    // 5. Fetch recently completed tokens today
    const completedRes = await query(
      `
      SELECT 
        qt.id,
        qt.token_number as "tokenNumber",
        qt.sequence_no as "sequenceNo",
        qt.counter_no as "counterNo",
        qt.status,
        qt.completed_at as "completedAt",
        rc.card_number as "cardNumber",
        rc.head_name as "headName",
        rc.category as "category"
      FROM queue_tokens qt
      JOIN ration_cards rc ON rc.id = qt.ration_card_id
      WHERE qt.shop_id::text = $1 
        AND qt.service_date::text = $2 
        AND qt.status IN ('COMPLETED', 'NO_SHOW', 'CANCELLED')
      ORDER BY COALESCE(qt.completed_at, qt.cancelled_at, qt.no_show_at) DESC
      LIMIT 15
      `,
      [shopId, today]
    );

    return {
      serviceDate: today,
      counters: countersRes.rows,
      summary,
      serving: servingRes.rows,
      waiting: waitingRes.rows,
      history: completedRes.rows,
    };
  },

  /**
   * Atomic FIFO token dispatch to a counter.
   */
  async callNext(shopId: string, counterNo: number, actorUserId: string) {
    const today = new Date().toISOString().split('T')[0];

    return await transaction(async (tx: DbClient) => {
      // 1. Check if this counter is already serving an unfinished token
      const existingRes = await tx.query(
        `
        SELECT id, token_number as "tokenNumber"
        FROM queue_tokens
        WHERE shop_id::text = $1 
          AND service_date::text = $2 
          AND counter_no = $3 
          AND status = 'SERVING'
        LIMIT 1
        `,
        [shopId, today, counterNo]
      );

      if (existingRes.rows.length > 0) {
        const existing = existingRes.rows[0];
        throw new AppError(
          `Counter ${counterNo} is already serving token ${existing.tokenNumber}. Complete or mark it as no-show before calling next.`,
          409,
          'COUNTER_BUSY'
        );
      }

      // 2. Select oldest WAITING token in FIFO sequence
      const nextRes = await tx.query(
        `
        SELECT 
          qt.id,
          qt.token_number as "tokenNumber",
          qt.sequence_no as "sequenceNo",
          qt.ration_card_id as "rationCardId",
          rc.card_number as "cardNumber",
          rc.head_name as "headName",
          rc.category,
          rc.family_members as "familyMembers"
        FROM queue_tokens qt
        JOIN ration_cards rc ON rc.id = qt.ration_card_id
        WHERE qt.shop_id::text = $1 
          AND qt.service_date::text = $2 
          AND qt.status = 'WAITING'
        ORDER BY qt.sequence_no ASC
        LIMIT 1
        `,
        [shopId, today]
      );

      if (nextRes.rows.length === 0) {
        return {
          nextServing: null,
          message: 'No waiting tokens in queue for this shop today.',
        };
      }

      const nextToken = nextRes.rows[0];

      // 3. Atomically transition token to SERVING on counter
      const updateRes = await tx.query(
        `
        UPDATE queue_tokens
        SET status = 'SERVING',
            counter_no = $2,
            serving_started_at = NOW(),
            version = version + 1
        WHERE id::text = $1
        RETURNING 
          id,
          token_number as "tokenNumber",
          sequence_no as "sequenceNo",
          counter_no as "counterNo",
          status,
          service_date as "serviceDate",
          serving_started_at as "servingStartedAt"
        `,
        [nextToken.id, counterNo]
      );

      const dispatched = {
        ...updateRes.rows[0],
        cardNumber: nextToken.cardNumber,
        headName: nextToken.headName,
        category: nextToken.category,
        familyMembers: nextToken.familyMembers,
      };

      // 4. Record audit event
      await tx.query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
        VALUES ($1, 'TOKEN_CALLED', 'queue_tokens', $2::text, $3)
        `,
        [
          actorUserId,
          dispatched.id,
          JSON.stringify({ counterNo, tokenNumber: dispatched.tokenNumber, sequenceNo: dispatched.sequenceNo }),
        ]
      );

      // 5. Multi-channel notification dispatch
      try {
        const cardMobRes = await tx.query(
          `SELECT demo_mobile_masked FROM ration_cards WHERE id::text = $1`,
          [nextToken.rationCardId]
        );
        await notificationService.dispatchQueueNotification({
          tokenId: dispatched.id,
          eventType: 'TOKEN_CALLED',
          destination: cardMobRes.rows[0]?.demo_mobile_masked || 'XXXXXX8910',
          tokenNumber: dispatched.tokenNumber,
          counterNo,
        }, tx);
      } catch (err) {
        console.warn('[Staff] CallNext notification error (non-blocking):', err);
      }

      return {
        nextServing: dispatched,
        counterNo,
      };
    });
  },

  /**
   * Completes distribution for a token in SERVING status.
   */
  async completeToken(tokenId: string, shopId: string, actorUserId: string, note?: string) {
    return await transaction(async (tx: DbClient) => {
      const tokenRes = await tx.query(
        `SELECT id, status, shop_id as "shopId", token_number as "tokenNumber" FROM queue_tokens WHERE id::text = $1`,
        [tokenId]
      );

      if (tokenRes.rows.length === 0) {
        throw new AppError('Queue token not found.', 404, 'NOT_FOUND');
      }

      const token = tokenRes.rows[0];
      if (token.shopId !== shopId) {
        throw new AppError('Token does not belong to your assigned shop.', 403, 'FORBIDDEN');
      }

      if (token.status !== 'SERVING') {
        throw new AppError(
          `Cannot complete token in status ${token.status}. Only tokens in SERVING status can be completed.`,
          409,
          'INVALID_STATUS_TRANSITION'
        );
      }

      const updateRes = await tx.query(
        `
        UPDATE queue_tokens
        SET status = 'COMPLETED',
            completed_at = NOW(),
            status_reason = $2,
            version = version + 1
        WHERE id::text = $1
        RETURNING 
          id,
          token_number as "tokenNumber",
          status,
          completed_at as "completedAt",
          counter_no as "counterNo"
        `,
        [tokenId, note || 'Distribution completed successfully']
      );

      // Audit log
      await tx.query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, reason, new_values)
        VALUES ($1, 'TOKEN_COMPLETED', 'queue_tokens', $2::text, $3, $4)
        `,
        [actorUserId, tokenId, note || null, JSON.stringify({ tokenNumber: token.tokenNumber })]
      );

      // Multi-channel notification dispatch
      try {
        const cardMobRes = await tx.query(
          `SELECT demo_mobile_masked FROM ration_cards WHERE id::text = (SELECT ration_card_id::text FROM queue_tokens WHERE id::text = $1)`,
          [tokenId]
        );
        await notificationService.dispatchQueueNotification({
          tokenId,
          eventType: 'TOKEN_COMPLETED',
          destination: cardMobRes.rows[0]?.demo_mobile_masked || 'XXXXXX8910',
          tokenNumber: token.tokenNumber,
        }, tx);
      } catch (err) {
        console.warn('[Staff] Complete notification error (non-blocking):', err);
      }

      return updateRes.rows[0];
    });
  },

  /**
   * Marks a token as NO_SHOW with mandatory reason.
   */
  async markNoShow(tokenId: string, shopId: string, actorUserId: string, reason: string) {
    if (!reason?.trim()) {
      throw new AppError('A valid reason is required when marking a token as no-show.', 400, 'VALIDATION_ERROR');
    }

    return await transaction(async (tx: DbClient) => {
      const tokenRes = await tx.query(
        `SELECT id, status, shop_id as "shopId", token_number as "tokenNumber" FROM queue_tokens WHERE id::text = $1`,
        [tokenId]
      );

      if (tokenRes.rows.length === 0) {
        throw new AppError('Queue token not found.', 404, 'NOT_FOUND');
      }

      const token = tokenRes.rows[0];
      if (token.shopId !== shopId) {
        throw new AppError('Token does not belong to your assigned shop.', 403, 'FORBIDDEN');
      }

      if (!['WAITING', 'SERVING'].includes(token.status)) {
        throw new AppError(
          `Cannot mark token in status ${token.status} as no-show. Only WAITING or SERVING tokens may be marked no-show.`,
          409,
          'INVALID_STATUS_TRANSITION'
        );
      }

      const updateRes = await tx.query(
        `
        UPDATE queue_tokens
        SET status = 'NO_SHOW',
            no_show_at = NOW(),
            status_reason = $2,
            version = version + 1
        WHERE id::text = $1
        RETURNING 
          id,
          token_number as "tokenNumber",
          status,
          no_show_at as "noShowAt",
          status_reason as "statusReason"
        `,
        [tokenId, reason.trim()]
      );

      // Audit log
      await tx.query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, reason, new_values)
        VALUES ($1, 'TOKEN_NO_SHOW', 'queue_tokens', $2::text, $3, $4)
        `,
        [actorUserId, tokenId, reason.trim(), JSON.stringify({ tokenNumber: token.tokenNumber })]
      );

      return updateRes.rows[0];
    });
  },

  /**
   * Cancels a token by operator or supervisor with mandatory reason.
   */
  async cancelTokenByStaff(tokenId: string, shopId: string, actorUserId: string, reason: string) {
    if (!reason?.trim()) {
      throw new AppError('A valid reason is required when staff cancels a queue token.', 400, 'VALIDATION_ERROR');
    }

    return await transaction(async (tx: DbClient) => {
      const tokenRes = await tx.query(
        `SELECT id, status, shop_id as "shopId", token_number as "tokenNumber" FROM queue_tokens WHERE id::text = $1`,
        [tokenId]
      );

      if (tokenRes.rows.length === 0) {
        throw new AppError('Queue token not found.', 404, 'NOT_FOUND');
      }

      const token = tokenRes.rows[0];
      if (token.shopId !== shopId) {
        throw new AppError('Token does not belong to your assigned shop.', 403, 'FORBIDDEN');
      }

      if (!['WAITING', 'SERVING'].includes(token.status)) {
        throw new AppError(
          `Cannot cancel token in status ${token.status}. Only WAITING or SERVING tokens may be cancelled.`,
          409,
          'INVALID_STATUS_TRANSITION'
        );
      }

      const updateRes = await tx.query(
        `
        UPDATE queue_tokens
        SET status = 'CANCELLED',
            cancelled_at = NOW(),
            status_reason = $2,
            version = version + 1
        WHERE id::text = $1
        RETURNING 
          id,
          token_number as "tokenNumber",
          status,
          cancelled_at as "cancelledAt",
          status_reason as "statusReason"
        `,
        [tokenId, reason.trim()]
      );

      // Audit log
      await tx.query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, reason, new_values)
        VALUES ($1, 'TOKEN_CANCELLED_STAFF', 'queue_tokens', $2::text, $3, $4)
        `,
        [actorUserId, tokenId, reason.trim(), JSON.stringify({ tokenNumber: token.tokenNumber })]
      );

      // Multi-channel notification dispatch
      try {
        const cardMobRes = await tx.query(
          `SELECT demo_mobile_masked FROM ration_cards WHERE id::text = (SELECT ration_card_id::text FROM queue_tokens WHERE id::text = $1)`,
          [tokenId]
        );
        await notificationService.dispatchQueueNotification({
          tokenId,
          eventType: 'TOKEN_CANCELLED',
          destination: cardMobRes.rows[0]?.demo_mobile_masked || 'XXXXXX8910',
          tokenNumber: token.tokenNumber,
        }, tx);
      } catch (err) {
        console.warn('[Staff] Cancel notification error (non-blocking):', err);
      }

      return updateRes.rows[0];
    });
  },

  /**
   * Search demo beneficiaries assigned to this shop.
   */
  async getBeneficiaries(shopId: string, q?: string) {
    const conditions = ['rc.shop_id::text = $1'];
    const values: any[] = [shopId];

    if (q?.trim()) {
      values.push(`%${q.trim()}%`);
      const idx = values.length;
      conditions.push(`(rc.card_number ILIKE $${idx} OR rc.head_name ILIKE $${idx} OR rc.locality ILIKE $${idx})`);
    }

    const res = await query(
      `
      SELECT 
        rc.id,
        rc.card_number as "cardNumber",
        rc.category,
        rc.head_name as "headName",
        rc.family_members as "familyMembers",
        rc.locality,
        rc.demo_mobile_masked as "demoMobileMasked",
        rc.created_at as "createdAt"
      FROM ration_cards rc
      WHERE ${conditions.join(' AND ')}
      ORDER BY rc.card_number ASC
      LIMIT 50
      `,
      values
    );

    return { beneficiaries: res.rows };
  },

  /**
   * Shift summary KPIs for reports.
   */
  async getReportsSummary(shopId: string, startDate?: string, endDate?: string) {
    const today = new Date().toISOString().split('T')[0];
    const start = startDate || today;
    const end = endDate || today;

    const summaryRes = await query(
      `
      SELECT 
        COUNT(*) as "totalTokens",
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as "completedCount",
        COUNT(*) FILTER (WHERE status = 'NO_SHOW') as "noShowCount",
        COUNT(*) FILTER (WHERE status = 'CANCELLED') as "cancelledCount",
        COALESCE(
          AVG(EXTRACT(EPOCH FROM (completed_at - serving_started_at)) / 60) 
          FILTER (WHERE status = 'COMPLETED' AND serving_started_at IS NOT NULL),
          3.5
        ) as "avgServingMinutes"
      FROM queue_tokens
      WHERE shop_id::text = $1 
        AND service_date::text >= $2 
        AND service_date::text <= $3
      `,
      [shopId, start, end]
    );

    const s = summaryRes.rows[0] || {};
    return {
      period: { start, end },
      shopId,
      totalTokens: parseInt(s.totalTokens || '0', 10),
      completedCount: parseInt(s.completedCount || '0', 10),
      noShowCount: parseInt(s.noShowCount || '0', 10),
      cancelledCount: parseInt(s.cancelledCount || '0', 10),
      avgServingMinutes: parseFloat(Number(s.avgServingMinutes || 3.5).toFixed(1)),
      isDemo: true,
    };
  },
};
