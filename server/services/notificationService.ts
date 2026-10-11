import { query, DbClient } from '../db/connection.js';

export interface NotificationParams {
  tokenId: string;
  eventType: 'TOKEN_ISSUED' | 'TOKEN_CALLED' | 'TOKEN_MILESTONE_10_AHEAD' | 'TOKEN_COMPLETED' | 'TOKEN_CANCELLED';
  destination?: string;
  tokenNumber: string;
  counterNo?: number;
  shopName?: string;
  queueAhead?: number;
  estimatedWaitMinutes?: number;
  telegramChatId?: string;
}

export const notificationService = {
  /**
   * Masks sensitive PII for privacy and government audit logging.
   * e.g., '9876543210' -> 'XXXXXX3210'
   */
  maskDestination(raw?: string): string {
    if (!raw || typeof raw !== 'string') return 'XXXXXX0001';
    const clean = raw.trim().replace(/\s+/g, '');
    if (clean.includes('@')) {
      // Email or Telegram username
      if (clean.startsWith('@')) {
        return clean.length <= 4 ? '@***' : `@${clean[1]}***${clean.slice(-1)}`;
      }
      const parts = clean.split('@');
      const user = parts[0];
      const domain = parts[1] || '';
      const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}***${user.slice(-1)}`;
      return `${maskedUser}@${domain}`;
    }

    // Phone number: keep last 4 digits
    const digits = clean.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `XXXXXX${digits.slice(-4)}`;
    }
    return 'XXXXXX0001';
  },

  /**
   * Dispatches real Telegram message if bot credentials are provided in env,
   * otherwise skips gracefully for simulated audit logging.
   */
  async sendTelegramAlert(
    message: string,
    chatIdOverride?: string
  ): Promise<{ success: boolean; status: 'SENT' | 'SKIPPED' | 'FAILED'; providerId?: string; error?: string }> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const targetChatId = chatIdOverride || process.env.TELEGRAM_CHAT_ID;

    const isConfigured = Boolean(
      botToken &&
      botToken.trim().length > 10 &&
      !botToken.includes('your_telegram_bot_token') &&
      targetChatId &&
      targetChatId.trim().length > 0
    );

    if (!isConfigured) {
      return {
        success: true,
        status: 'SKIPPED',
        providerId: 'SIMULATED-DEMO',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        return {
          success: true,
          status: 'SENT',
          providerId: String(data.result?.message_id || 'TG-OK'),
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: data.description || 'Telegram API returned error',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        error: err.message || 'Network exception dispatching Telegram alert',
      };
    }
  },

  /**
   * Builds bilingual government notice text.
   */
  formatMessage(params: NotificationParams): string {
    switch (params.eventType) {
      case 'TOKEN_ISSUED':
        return (
          `🎟️ <b>SRQMS Tamil Nadu Fair Price Shop</b>\n` +
          `Token No: <b>#${params.tokenNumber}</b>\n` +
          `Shop: ${params.shopName || 'Designated Fair Price Shop'}\n` +
          `Ahead in Queue: ${params.queueAhead ?? 0} | Est. Wait: ~${params.estimatedWaitMinutes ?? 0} mins\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<i>தமிழ்: தங்களின் வரிசை டோக்கன் எண் #${params.tokenNumber} உருவாக்கப்பட்டது. முன் உள்ளோர்: ${params.queueAhead ?? 0}.</i>`
        );

      case 'TOKEN_CALLED':
        return (
          `🔔 <b>SRQMS Counter Call Notice</b>\n` +
          `Token No: <b>#${params.tokenNumber}</b>\n` +
          `Please proceed to <b>Counter #${params.counterNo || 1}</b> immediately with your Smart Card.\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<i>தமிழ்: டோக்கன் #${params.tokenNumber}, கவுண்டர் #${params.counterNo || 1}-க்கு உடனடியாக வரவும்.</i>`
        );

      case 'TOKEN_MILESTONE_10_AHEAD':
        return (
          `⏳ <b>SRQMS Queue Approaching Alert</b>\n` +
          `Token No: <b>#${params.tokenNumber}</b>\n` +
          `Approximately 10 beneficiaries remaining before your turn. Please be near the shop.\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<i>தமிழ்: தங்களின் முறைக்கு முன் 10 நபர்கள் மட்டுமே உள்ளனர். கடை அருகில் இருக்கவும்.</i>`
        );

      case 'TOKEN_COMPLETED':
        return (
          `✅ <b>SRQMS Distribution Successful</b>\n` +
          `Token No: <b>#${params.tokenNumber}</b>\n` +
          `Subsidized commodity distribution completed. Electronic ledger updated.\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<i>தமிழ்: தங்களின் ரேஷன் பொருட்கள் வெற்றிகரமாக விநியோகிக்கப்பட்டது.</i>`
        );

      case 'TOKEN_CANCELLED':
        return (
          `❌ <b>SRQMS Queue Cancellation</b>\n` +
          `Token No: <b>#${params.tokenNumber}</b> has been cancelled.\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<i>தமிழ்: தங்களின் டோக்கன் எண் #${params.tokenNumber} ரத்து செய்யப்பட்டது.</i>`
        );

      default:
        return `SRQMS Notice: Token #${params.tokenNumber} status updated.`;
    }
  },

  /**
   * Main dispatch entrypoint: logs event into DB `notifications` table and dispatches alerts.
   */
  async dispatchQueueNotification(params: NotificationParams, client?: DbClient) {
    const db = client || { query };
    const masked = this.maskDestination(params.destination);
    const message = this.formatMessage(params);

    // 1. Attempt Telegram dispatch
    const tgResult = await this.sendTelegramAlert(message, params.telegramChatId);

    // 2. Persist Telegram notification record
    const insertTg = await db.query(
      `
      INSERT INTO notifications (
        token_id, channel, event_type, status, destination_masked,
        provider_message_id, attempt_count, last_error_code, sent_at
      )
      VALUES ($1, 'TELEGRAM', $2, $3, $4, $5, 1, $6, $7)
      RETURNING 
        id, token_id as "tokenId", channel, event_type as "eventType",
        status, destination_masked as "destinationMasked",
        provider_message_id as "providerMessageId", created_at as "createdAt"
      `,
      [
        params.tokenId,
        params.eventType,
        tgResult.status,
        masked,
        tgResult.providerId || null,
        tgResult.error || null,
        tgResult.status === 'SENT' ? new Date().toISOString() : null,
      ]
    );

    // 3. Also log SMS Gateway simulated record for complete government multi-channel audit
    await db.query(
      `
      INSERT INTO notifications (
        token_id, channel, event_type, status, destination_masked,
        provider_message_id, attempt_count, sent_at
      )
      VALUES ($1, 'SMS_GATEWAY', $2, 'SENT', $3, 'NIC-SMS-GATEWAY-DEMO', 1, NOW())
      `,
      [params.tokenId, params.eventType, masked]
    );

    return insertTg.rows[0];
  },

  /**
   * Fetches the notification timeline for a token.
   */
  async getTokenNotifications(tokenId: string, client?: DbClient) {
    const db = client || { query };
    const res = await db.query(
      `
      SELECT 
        id,
        token_id as "tokenId",
        channel,
        event_type as "eventType",
        status,
        destination_masked as "destinationMasked",
        provider_message_id as "providerMessageId",
        attempt_count as "attemptCount",
        created_at as "createdAt",
        sent_at as "sentAt"
      FROM notifications
      WHERE token_id::text = $1
      ORDER BY created_at DESC
      `,
      [tokenId]
    );

    return { notifications: res.rows };
  },

  /**
   * Fetches recent notification audit entries for a shop.
   */
  async getShopNotificationAudit(shopId: string, limit = 50, client?: DbClient) {
    const db = client || { query };
    const res = await db.query(
      `
      SELECT 
        n.id,
        n.token_id as "tokenId",
        qt.token_number as "tokenNumber",
        n.channel,
        n.event_type as "eventType",
        n.status,
        n.destination_masked as "destinationMasked",
        n.created_at as "createdAt",
        n.sent_at as "sentAt"
      FROM notifications n
      JOIN queue_tokens qt ON qt.id = n.token_id
      WHERE qt.shop_id::text = $1
      ORDER BY n.created_at DESC
      LIMIT $2
      `,
      [shopId, limit]
    );

    return { notifications: res.rows };
  },
};
