export type Language = 'en' | 'ta' | 'te' | 'hi';

export type CardType = 'PHH' | 'AAY' | 'NPHH';

export interface RationCard {
  cardNumber: string;
  cardHolderName: string;
  cardType: CardType;
  familyMembers: number;
  registeredMobile: string; // Real stored number, e.g. "+91 9876543210"
  maskedMobile: string;     // Masked for secure UI display, e.g. "+91 ******3210"
  telegramChatId?: string;  // Customer's Telegram Chat ID or username
  address: string;
  fpsShopId: string;
  entitlements: {
    riceKg: number;
    sugarKg: number;
    pulsesKg: number;
    oilPackets: number;
  };
  lastDrawnDate?: string;
}

export type TokenStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

export interface QueueToken {
  id: string;
  tokenNumber: string; // e.g., "A-101"
  sequenceNumber: number;
  cardNumber: string;
  cardHolderName: string;
  cardType: CardType;
  registeredMobile: string;
  maskedMobile: string;
  telegramChatId?: string;
  status: TokenStatus;
  createdAt: string;
  servingStartedAt?: string;
  completedAt?: string;
  counterNo?: number;
  telegramSent: {
    confirmation: boolean;
    reminder10: boolean;
    serving: boolean;
  };
  entitlements: {
    riceKg: number;
    sugarKg: number;
    pulsesKg: number;
    oilPackets: number;
  };
}

export interface StockInventory {
  riceKg: number;
  sugarKg: number;
  pulsesKg: number;
  oilPackets: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface StockLog {
  id: string;
  timestamp: string;
  updatedBy: string;
  item: 'rice' | 'sugar' | 'pulses' | 'oil';
  previousValue: number;
  newValue: number;
  change: number;
  reason: string;
}

export interface TelegramAuditLog {
  id: string;
  timestamp: string;
  tokenNumber: string;
  chatId: string;
  messageType: 'confirmation' | 'reminder_10' | 'serving';
  messageText: string;
  status: 'sent' | 'simulated_no_bot_token' | 'failed';
  errorDetails?: string;
}

export interface QueueStatusResponse {
  token: QueueToken;
  position: number;
  customersAhead: number;
  estimatedWaitMinutes: number;
}
