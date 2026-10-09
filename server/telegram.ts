import { QueueToken } from '../src/types';
import { db } from './db';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export class TelegramService {
  private botToken: string;

  constructor() {
    this.botToken = TELEGRAM_BOT_TOKEN;
    if (this.botToken) {
      console.log('[Telegram] Bot token detected in environment.');
    } else {
      console.log('[Telegram] No TELEGRAM_BOT_TOKEN provided. Operating in audit/simulation mode.');
    }
  }

  public getBotTokenStatus(): { configured: boolean; botUsername?: string } {
    return {
      configured: Boolean(this.botToken && this.botToken.trim().length > 10 && !this.botToken.includes('your_telegram_bot_token'))
    };
  }

  private async sendRawMessage(chatId: string, text: string): Promise<{ success: boolean; status: 'sent' | 'simulated_no_bot_token' | 'failed'; error?: string }> {
    if (!chatId) {
      return { success: false, status: 'failed', error: 'Missing Chat ID' };
    }

    const isTokenConfigured = Boolean(
      this.botToken && 
      this.botToken.trim().length > 10 && 
      !this.botToken.includes('your_telegram_bot_token')
    );

    if (!isTokenConfigured) {
      console.log(`[Telegram:SIMULATED] To: ${chatId}\n${text}`);
      return { success: true, status: 'simulated_no_bot_token' };
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });

      const resData = await response.json();
      if (response.ok && resData.ok) {
        console.log(`[Telegram:SENT] Successfully sent message to ${chatId}`);
        return { success: true, status: 'sent' };
      } else {
        const errMsg = resData.description || 'Telegram API returned error';
        console.warn(`[Telegram:ERROR] Failed to send message to ${chatId}: ${errMsg}`);
        return { success: false, status: 'failed', error: errMsg };
      }
    } catch (err: any) {
      console.error(`[Telegram:EXCEPTION] Failed to dispatch to ${chatId}:`, err);
      return { success: false, status: 'failed', error: err.message || 'Network error' };
    }
  }

  // 1. Token Confirmation Message
  public async sendTokenConfirmation(token: QueueToken, position: number, customersAhead: number, waitMinutes: number): Promise<boolean> {
    if (token.telegramSent.confirmation) {
      console.log(`[Telegram] Confirmation already sent for token ${token.tokenNumber}. Skipping.`);
      return false;
    }

    const chatId = token.telegramChatId;
    if (!chatId) {
      console.log(`[Telegram] No telegramChatId linked for token ${token.tokenNumber}. Skipping.`);
      return false;
    }

    const message = `🎟️ <b>RATION QUEUE TOKEN CONFIRMED</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Token Number:</b> <code>#${token.tokenNumber}</code>\n` +
      `<b>Beneficiary:</b> ${token.cardHolderName}\n` +
      `<b>Ration Card:</b> ${token.cardNumber} (${token.cardType})\n` +
      `<b>Queue Position:</b> #${position}\n` +
      `<b>Customers Ahead:</b> ${customersAhead}\n` +
      `<b>Est. Wait Time:</b> ~${waitMinutes} minutes\n` +
      `<b>Shop:</b> Fair Price Shop #42 (Anna Nagar West)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>ℹ️ You will receive an automated alert when approx 10 customers are ahead. Please bring your biometric/OTP enabled mobile phone.</i>`;

    const result = await this.sendRawMessage(chatId, message);

    // Save to audit log
    db.addTelegramAudit({
      tokenNumber: token.tokenNumber,
      chatId,
      messageType: 'confirmation',
      messageText: message,
      status: result.status,
      errorDetails: result.error
    });

    db.markTelegramSent(token.id, 'confirmation');
    return result.success;
  }

  // 2. Reminder when ~10 customers ahead
  public async sendQueueReminder(token: QueueToken, customersAhead: number): Promise<boolean> {
    if (token.telegramSent.reminder10) {
      return false; // Prevent duplicate reminder
    }

    const chatId = token.telegramChatId;
    if (!chatId) return false;

    const estMinutes = Math.max(2, customersAhead * 3);

    const message = `🔔 <b>RATION QUEUE ALERT (APPROX 10 AHEAD)</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Token Number:</b> <code>#${token.tokenNumber}</code>\n` +
      `<b>Beneficiary:</b> ${token.cardHolderName}\n\n` +
      `⚠️ <b>Only ${customersAhead} customers are ahead of you in the queue!</b>\n` +
      `Estimated waiting time: <b>~${estMinutes} minutes</b>\n\n` +
      `📍 <i>Please proceed to Fair Price Shop #42 now to avoid missing your turn.</i>`;

    const result = await this.sendRawMessage(chatId, message);

    db.addTelegramAudit({
      tokenNumber: token.tokenNumber,
      chatId,
      messageType: 'reminder_10',
      messageText: message,
      status: result.status,
      errorDetails: result.error
    });

    db.markTelegramSent(token.id, 'reminder10');
    return result.success;
  }

  // 3. Counter Calling Alert
  public async sendServingAlert(token: QueueToken, counterNo: number = 1): Promise<boolean> {
    if (token.telegramSent.serving) return false;

    const chatId = token.telegramChatId;
    if (!chatId) return false;

    const message = `📢 <b>NOW SERVING: YOUR TURN!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Token Number:</b> <code>#${token.tokenNumber}</code>\n` +
      `<b>Beneficiary:</b> ${token.cardHolderName}\n` +
      `<b>Counter:</b> Counter ${counterNo}\n\n` +
      `👉 <b>Please present your ration card at Counter ${counterNo} now.</b>`;

    const result = await this.sendRawMessage(chatId, message);

    db.addTelegramAudit({
      tokenNumber: token.tokenNumber,
      chatId,
      messageType: 'serving',
      messageText: message,
      status: result.status,
      errorDetails: result.error
    });

    db.markTelegramSent(token.id, 'serving');
    return result.success;
  }

  // Process all waiting tokens to check if any reached ~10 customers ahead
  public async checkAndDispatchQueueReminders(): Promise<number> {
    const waitingTokens = db.getWaitingTokens();
    let remindersSent = 0;

    for (const token of waitingTokens) {
      if (token.telegramSent.reminder10) continue;

      const { customersAhead } = db.calculateQueuePosition(token);
      // When approx 10 customers are ahead (between 1 and 10)
      if (customersAhead <= 10 && customersAhead > 0) {
        const sent = await this.sendQueueReminder(token, customersAhead);
        if (sent) remindersSent++;
      }
    }

    return remindersSent;
  }
}

export const telegramService = new TelegramService();
