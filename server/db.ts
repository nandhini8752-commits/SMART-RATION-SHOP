import fs from 'fs';
import path from 'path';
import { RationCard, QueueToken, StockInventory, StockLog, TelegramAuditLog } from '../src/types';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'ration_db.json');

export interface DatabaseSchema {
  rationCards: RationCard[];
  queue: QueueToken[];
  stock: StockInventory;
  stockLogs: StockLog[];
  telegramLogs: TelegramAuditLog[];
  lastSequenceNumber: number;
}

// Initial realistic seed cards adhering to NFSA & State PDS entitlement standards
const INITIAL_RATION_CARDS: RationCard[] = [
  {
    cardNumber: "TN-02-PHH-8821",
    cardHolderName: "M. Senthilkumar",
    cardType: "PHH",
    familyMembers: 4,
    registeredMobile: "+91 98401 23456",
    maskedMobile: "+91 ******3456",
    telegramChatId: "demo_beneficiary_1",
    address: "Door 14, 2nd Main Rd, Anna Nagar West, Chennai 600040",
    fpsShopId: "FPS-42-ANNA",
    entitlements: {
      riceKg: 20, // 5kg per person x 4
      sugarKg: 1,
      pulsesKg: 1,
      oilPackets: 1,
    }
  },
  {
    cardNumber: "TN-04-AAY-1092",
    cardHolderName: "Lakshmi Devi Ammal",
    cardType: "AAY", // Antyodaya Anna Yojana (Poorest of the poor - flat 35kg foodgrains)
    familyMembers: 3,
    registeredMobile: "+91 94440 98712",
    maskedMobile: "+91 ******8712",
    telegramChatId: "demo_beneficiary_2",
    address: "Plot 8B, Thiruvalluvar St, Anna Nagar West, Chennai 600040",
    fpsShopId: "FPS-42-ANNA",
    entitlements: {
      riceKg: 30, // 35kg total grains (30kg rice, 5kg pulses/atta)
      sugarKg: 1,
      pulsesKg: 2,
      oilPackets: 1,
    }
  },
  {
    cardNumber: "TN-01-NPHH-5541",
    cardHolderName: "R. Rajesh Kumar",
    cardType: "NPHH", // Non-Priority Household (Sugar/Rice option)
    familyMembers: 3,
    registeredMobile: "+91 98845 67890",
    maskedMobile: "+91 ******7890",
    telegramChatId: "demo_beneficiary_3",
    address: "Flat 3A, Lotus Apts, Anna Nagar West, Chennai 600040",
    fpsShopId: "FPS-42-ANNA",
    entitlements: {
      riceKg: 15,
      sugarKg: 1.5,
      pulsesKg: 1,
      oilPackets: 1,
    }
  },
  {
    cardNumber: "TN-02-PHH-3319",
    cardHolderName: "Anitha Karthikeyan",
    cardType: "PHH",
    familyMembers: 5,
    registeredMobile: "+91 97910 11223",
    maskedMobile: "+91 ******1223",
    telegramChatId: "demo_beneficiary_4",
    address: "22/1, 5th Avenue, Anna Nagar West, Chennai 600040",
    fpsShopId: "FPS-42-ANNA",
    entitlements: {
      riceKg: 25, // 5kg x 5
      sugarKg: 1,
      pulsesKg: 1,
      oilPackets: 1,
    }
  },
  {
    cardNumber: "TN-03-AAY-7744",
    cardHolderName: "K. Murugesan",
    cardType: "AAY",
    familyMembers: 2,
    registeredMobile: "+91 98412 88990",
    maskedMobile: "+91 ******8990",
    telegramChatId: "demo_beneficiary_5",
    address: "4/9, Pillaiyar Koil St, Anna Nagar West, Chennai 600040",
    fpsShopId: "FPS-42-ANNA",
    entitlements: {
      riceKg: 30,
      sugarKg: 1,
      pulsesKg: 2,
      oilPackets: 1,
    }
  },
  {
    cardNumber: "TN-02-PHH-9012",
    cardHolderName: "B. Meenakshi",
    cardType: "PHH",
    familyMembers: 3,
    registeredMobile: "+91 91760 45678",
    maskedMobile: "+91 ******5678",
    telegramChatId: "demo_beneficiary_6",
    address: "17, 3rd Cross St, Anna Nagar West, Chennai 600040",
    fpsShopId: "FPS-42-ANNA",
    entitlements: {
      riceKg: 15,
      sugarKg: 1,
      pulsesKg: 1,
      oilPackets: 1,
    }
  }
];

// Initial pre-populated FIFO queue to give immediate live queue realism (approx 8-12 customers)
const INITIAL_QUEUE: QueueToken[] = [
  {
    id: "token-101",
    tokenNumber: "A-101",
    sequenceNumber: 101,
    cardNumber: "TN-02-PHH-9012",
    cardHolderName: "B. Meenakshi",
    cardType: "PHH",
    registeredMobile: "+91 91760 45678",
    maskedMobile: "+91 ******5678",
    telegramChatId: "demo_beneficiary_6",
    status: "SERVING",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    servingStartedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    counterNo: 1,
    telegramSent: { confirmation: true, reminder10: true, serving: true },
    entitlements: { riceKg: 15, sugarKg: 1, pulsesKg: 1, oilPackets: 1 }
  },
  {
    id: "token-102",
    tokenNumber: "A-102",
    sequenceNumber: 102,
    cardNumber: "TN-03-AAY-7744",
    cardHolderName: "K. Murugesan",
    cardType: "AAY",
    registeredMobile: "+91 98412 88990",
    maskedMobile: "+91 ******8990",
    telegramChatId: "demo_beneficiary_5",
    status: "WAITING",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    telegramSent: { confirmation: true, reminder10: true, serving: false },
    entitlements: { riceKg: 30, sugarKg: 1, pulsesKg: 2, oilPackets: 1 }
  },
  {
    id: "token-103",
    tokenNumber: "A-103",
    sequenceNumber: 103,
    cardNumber: "TN-02-PHH-3319",
    cardHolderName: "Anitha Karthikeyan",
    cardType: "PHH",
    registeredMobile: "+91 97910 11223",
    maskedMobile: "+91 ******1223",
    telegramChatId: "demo_beneficiary_4",
    status: "WAITING",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    telegramSent: { confirmation: true, reminder10: true, serving: false },
    entitlements: { riceKg: 25, sugarKg: 1, pulsesKg: 1, oilPackets: 1 }
  },
  {
    id: "token-104",
    tokenNumber: "A-104",
    sequenceNumber: 104,
    cardNumber: "TN-01-NPHH-5541",
    cardHolderName: "R. Rajesh Kumar",
    cardType: "NPHH",
    registeredMobile: "+91 98845 67890",
    maskedMobile: "+91 ******7890",
    telegramChatId: "demo_beneficiary_3",
    status: "WAITING",
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    telegramSent: { confirmation: true, reminder10: true, serving: false },
    entitlements: { riceKg: 15, sugarKg: 1.5, pulsesKg: 1, oilPackets: 1 }
  },
  {
    id: "token-105",
    tokenNumber: "A-105",
    sequenceNumber: 105,
    cardNumber: "TN-04-AAY-1092",
    cardHolderName: "Lakshmi Devi Ammal",
    cardType: "AAY",
    registeredMobile: "+91 94440 98712",
    maskedMobile: "+91 ******8712",
    telegramChatId: "demo_beneficiary_2",
    status: "WAITING",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    telegramSent: { confirmation: true, reminder10: true, serving: false },
    entitlements: { riceKg: 30, sugarKg: 1, pulsesKg: 2, oilPackets: 1 }
  }
];

const INITIAL_STOCK: StockInventory = {
  riceKg: 1850,       // 1850 kg rice available
  sugarKg: 420,       // 420 kg sugar available
  pulsesKg: 340,      // 340 kg pulses available
  oilPackets: 290,    // 290 packets of 1-litre sealed cooking oil
  lastUpdated: new Date().toISOString(),
  updatedBy: "EMP-101 (Store Keeper)"
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.error('[DB] Error loading database file, initializing defaults:', err);
    }

    const defaultData: DatabaseSchema = {
      rationCards: INITIAL_RATION_CARDS,
      queue: INITIAL_QUEUE,
      stock: INITIAL_STOCK,
      stockLogs: [
        {
          id: "log-init-1",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          updatedBy: "EMP-101",
          item: "rice",
          previousValue: 0,
          newValue: 1850,
          change: 1850,
          reason: "Civil Supplies Monthly Inward Allotment"
        },
        {
          id: "log-init-2",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          updatedBy: "EMP-101",
          item: "oil",
          previousValue: 0,
          newValue: 290,
          change: 290,
          reason: "Fortified Palm Oil Batch #TN-2026-C"
        }
      ],
      telegramLogs: [],
      lastSequenceNumber: 105,
    };

    this.saveDataDirect(defaultData);
    return defaultData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  private save() {
    this.saveDataDirect(this.data);
  }

  // --- Ration Card Operations ---
  public getRationCard(cardNumber: string): RationCard | undefined {
    const cleanNum = cardNumber.trim().toUpperCase();
    return this.data.rationCards.find(c => c.cardNumber.toUpperCase() === cleanNum);
  }

  public getAllRationCards(): RationCard[] {
    return this.data.rationCards;
  }

  public updateTelegramChatId(cardNumber: string, chatId: string): boolean {
    const card = this.getRationCard(cardNumber);
    if (!card) return false;
    card.telegramChatId = chatId.trim();
    // Also update any active tokens for this card
    for (const token of this.data.queue) {
      if (token.cardNumber.toUpperCase() === cardNumber.toUpperCase() && token.status === 'WAITING') {
        token.telegramChatId = chatId.trim();
      }
    }
    this.save();
    return true;
  }

  // Allow registration of new card if beneficiary enters valid format
  public registerOrGetCard(cardNumber: string): RationCard {
    const existing = this.getRationCard(cardNumber);
    if (existing) return existing;

    // Create a new valid card if not found, preserving valid government entitlement formulas
    const num = cardNumber.trim().toUpperCase();
    const isAAY = num.includes('AAY');
    const isNPHH = num.includes('NPHH');
    const cardType = isAAY ? 'AAY' : isNPHH ? 'NPHH' : 'PHH';
    const familyMembers = 4;
    const cleanPhone = `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`;
    const last4 = cleanPhone.slice(-4);

    const newCard: RationCard = {
      cardNumber: num,
      cardHolderName: "Verified Beneficiary",
      cardType,
      familyMembers,
      registeredMobile: cleanPhone,
      maskedMobile: `+91 ******${last4}`,
      address: "Anna Nagar West, Chennai 600040",
      fpsShopId: "FPS-42-ANNA",
      entitlements: {
        riceKg: isAAY ? 30 : isNPHH ? 15 : familyMembers * 5,
        sugarKg: isNPHH ? 1.5 : 1,
        pulsesKg: isAAY ? 2 : 1,
        oilPackets: 1,
      }
    };
    this.data.rationCards.push(newCard);
    this.save();
    return newCard;
  }

  // --- Queue Operations (Strict FIFO) ---
  public getActiveTokenForCard(cardNumber: string): QueueToken | undefined {
    const clean = cardNumber.trim().toUpperCase();
    return this.data.queue.find(
      t => t.cardNumber.toUpperCase() === clean && (t.status === 'WAITING' || t.status === 'SERVING')
    );
  }

  public getTokenById(tokenId: string): QueueToken | undefined {
    return this.data.queue.find(t => t.id === tokenId);
  }

  public getQueue(): QueueToken[] {
    return this.data.queue;
  }

  public getWaitingTokens(): QueueToken[] {
    return this.data.queue
      .filter(t => t.status === 'WAITING')
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  public getCurrentlyServingToken(): QueueToken | undefined {
    return this.data.queue.find(t => t.status === 'SERVING');
  }

  public createToken(card: RationCard): QueueToken {
    // Generate next sequential FIFO number
    this.data.lastSequenceNumber += 1;
    const seq = this.data.lastSequenceNumber;
    const tokenNumber = `A-${seq}`;
    const id = `token-${seq}`;

    const newToken: QueueToken = {
      id,
      tokenNumber,
      sequenceNumber: seq,
      cardNumber: card.cardNumber,
      cardHolderName: card.cardHolderName,
      cardType: card.cardType,
      registeredMobile: card.registeredMobile,
      maskedMobile: card.maskedMobile,
      telegramChatId: card.telegramChatId,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
      telegramSent: {
        confirmation: false,
        reminder10: false,
        serving: false
      },
      entitlements: { ...card.entitlements }
    };

    this.data.queue.push(newToken);
    this.save();
    return newToken;
  }

  public calculateQueuePosition(token: QueueToken): { position: number; customersAhead: number; estimatedWaitMinutes: number } {
    if (token.status !== 'WAITING') {
      return {
        position: token.status === 'SERVING' ? 1 : 0,
        customersAhead: 0,
        estimatedWaitMinutes: 0
      };
    }

    const waiting = this.getWaitingTokens();
    const index = waiting.findIndex(t => t.id === token.id);
    const serving = this.getCurrentlyServingToken();

    // Position: 1-indexed including any currently serving customer
    const customersAhead = index !== -1 ? index + (serving ? 1 : 0) : 0;
    const position = customersAhead + 1;
    // Standard estimated service time: ~3 minutes per beneficiary
    const estimatedWaitMinutes = Math.max(0, customersAhead * 3);

    return {
      position,
      customersAhead,
      estimatedWaitMinutes
    };
  }

  public callNextToken(): { previousServing?: QueueToken; nextServing?: QueueToken } {
    const currentServing = this.getCurrentlyServingToken();
    if (currentServing) {
      currentServing.status = 'COMPLETED';
      currentServing.completedAt = new Date().toISOString();
    }

    const waiting = this.getWaitingTokens();
    const nextToken = waiting[0];

    if (nextToken) {
      nextToken.status = 'SERVING';
      nextToken.servingStartedAt = new Date().toISOString();
      nextToken.counterNo = 1;
      this.save();
      return { previousServing: currentServing, nextServing: nextToken };
    }

    this.save();
    return { previousServing: currentServing, nextServing: undefined };
  }

  public cancelToken(tokenId: string): boolean {
    const token = this.getTokenById(tokenId);
    if (!token || token.status !== 'WAITING') return false;
    token.status = 'CANCELLED';
    this.save();
    return true;
  }

  public markTelegramSent(tokenId: string, type: 'confirmation' | 'reminder10' | 'serving') {
    const token = this.getTokenById(tokenId);
    if (!token) return;
    token.telegramSent[type] = true;
    this.save();
  }

  // --- Stock Operations ---
  public getStock(): StockInventory {
    return this.data.stock;
  }

  public getStockLogs(): StockLog[] {
    return this.data.stockLogs;
  }

  public updateStock(updates: { riceKg?: number; sugarKg?: number; pulsesKg?: number; oilPackets?: number }, updatedBy: string, reason: string): StockInventory {
    const prev = { ...this.data.stock };
    const now = new Date().toISOString();

    const items: Array<'rice' | 'sugar' | 'pulses' | 'oil'> = ['rice', 'sugar', 'pulses', 'oil'];
    for (const item of items) {
      let key: keyof StockInventory | undefined;
      let updateVal: number | undefined;

      if (item === 'rice' && updates.riceKg !== undefined) {
        key = 'riceKg';
        updateVal = Math.max(0, updates.riceKg);
      } else if (item === 'sugar' && updates.sugarKg !== undefined) {
        key = 'sugarKg';
        updateVal = Math.max(0, updates.sugarKg);
      } else if (item === 'pulses' && updates.pulsesKg !== undefined) {
        key = 'pulsesKg';
        updateVal = Math.max(0, updates.pulsesKg);
      } else if (item === 'oil' && updates.oilPackets !== undefined) {
        key = 'oilPackets';
        updateVal = Math.max(0, updates.oilPackets);
      }

      if (key && updateVal !== undefined && updateVal !== prev[key]) {
        const previousValue = prev[key] as number;
        (this.data.stock as any)[key] = updateVal;

        this.data.stockLogs.unshift({
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          updatedBy,
          item,
          previousValue,
          newValue: updateVal,
          change: updateVal - previousValue,
          reason: reason || "Manual stock inventory adjustment"
        });
      }
    }

    this.data.stock.lastUpdated = now;
    this.data.stock.updatedBy = updatedBy;
    this.save();
    return this.data.stock;
  }

  public dispenseStockForToken(token: QueueToken): { success: boolean; message: string; remainingStock?: StockInventory } {
    const { riceKg, sugarKg, pulsesKg, oilPackets } = token.entitlements;
    const stock = this.data.stock;

    // Actual stock safety checks - prevent negative balances
    if (stock.riceKg < riceKg) {
      return { success: false, message: `Insufficient Rice! Required: ${riceKg} kg, Available: ${stock.riceKg} kg` };
    }
    if (stock.sugarKg < sugarKg) {
      return { success: false, message: `Insufficient Sugar! Required: ${sugarKg} kg, Available: ${stock.sugarKg} kg` };
    }
    if (stock.pulsesKg < pulsesKg) {
      return { success: false, message: `Insufficient Pulses! Required: ${pulsesKg} kg, Available: ${stock.pulsesKg} kg` };
    }
    if (stock.oilPackets < oilPackets) {
      return { success: false, message: `Insufficient Cooking Oil! Required: ${oilPackets} packets, Available: ${stock.oilPackets} packets` };
    }

    // Safely deduct commodities from inventory
    const prevStock = { ...stock };
    stock.riceKg -= riceKg;
    stock.sugarKg -= sugarKg;
    stock.pulsesKg -= pulsesKg;
    stock.oilPackets -= oilPackets;
    stock.lastUpdated = new Date().toISOString();
    stock.updatedBy = "Counter 1 Dispenser";

    // Mark token as completed
    token.status = 'COMPLETED';
    token.completedAt = new Date().toISOString();

    // Log the transaction
    this.data.stockLogs.unshift({
      id: `dispense-${token.tokenNumber}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      updatedBy: "Counter 1",
      item: 'rice',
      previousValue: prevStock.riceKg,
      newValue: stock.riceKg,
      change: -riceKg,
      reason: `Dispensed to Token #${token.tokenNumber} (${token.cardHolderName})`
    });

    this.save();
    return { success: true, message: "Commodities dispensed safely and inventory updated.", remainingStock: stock };
  }

  // --- Telegram Audit Log ---
  public addTelegramAudit(audit: Omit<TelegramAuditLog, 'id' | 'timestamp'>) {
    const entry: TelegramAuditLog = {
      id: `tg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...audit
    };
    this.data.telegramLogs.unshift(entry);
    // Keep last 100 entries
    if (this.data.telegramLogs.length > 100) {
      this.data.telegramLogs = this.data.telegramLogs.slice(0, 100);
    }
    this.save();
  }

  public getTelegramAuditLogs(): TelegramAuditLog[] {
    return this.data.telegramLogs;
  }
}

export const db = new Database();
