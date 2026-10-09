import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { telegramService } from './server/telegram';
import { askRationAi } from './server/ai';
import { Language } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. General Shop & Queue Status
app.get('/api/status', (_req: Request, res: Response) => {
  const waitingTokens = db.getWaitingTokens();
  const currentlyServing = db.getCurrentlyServingToken();
  const stock = db.getStock();
  const tgStatus = telegramService.getBotTokenStatus();

  res.json({
    shopId: "FPS-42-ANNA",
    shopName: "Fair Price Shop #42",
    location: "Anna Nagar West, Chennai",
    status: "OPEN",
    waitingCount: waitingTokens.length,
    currentlyServing: currentlyServing ? {
      tokenNumber: currentlyServing.tokenNumber,
      cardNumber: currentlyServing.cardNumber,
      cardHolderName: currentlyServing.cardHolderName,
      servingStartedAt: currentlyServing.servingStartedAt,
      counterNo: currentlyServing.counterNo || 1
    } : null,
    stock,
    telegramConfigured: tgStatus.configured
  });
});

// 2. Customer: Verify Ration Card
app.post('/api/customer/verify', (req: Request, res: Response) => {
  const { cardNumber } = req.body;
  if (!cardNumber || typeof cardNumber !== 'string') {
    return res.status(400).json({ error: "Ration card number is required." });
  }

  const cleanNumber = cardNumber.trim().toUpperCase();
  let card = db.getRationCard(cleanNumber);

  // If card doesn't exist, register it with valid NFSA entitlement rules
  if (!card) {
    // Check if valid format (at least 6 characters)
    if (cleanNumber.length < 5) {
      return res.status(404).json({ error: "Invalid card number format. Minimum 5 characters required." });
    }
    card = db.registerOrGetCard(cleanNumber);
  }

  // Check if customer already has an active token (FIFO)
  const activeToken = db.getActiveTokenForCard(card.cardNumber);
  let queueDetails = null;

  if (activeToken) {
    const { position, customersAhead, estimatedWaitMinutes } = db.calculateQueuePosition(activeToken);
    queueDetails = {
      token: activeToken,
      position,
      customersAhead,
      estimatedWaitMinutes
    };
  }

  return res.json({
    card,
    activeToken: queueDetails
  });
});

// 3. Customer: Update Telegram Account / Chat ID
app.post('/api/customer/update-telegram', (req: Request, res: Response) => {
  const { cardNumber, telegramChatId } = req.body;
  if (!cardNumber) {
    return res.status(400).json({ error: "Ration card number required." });
  }

  const success = db.updateTelegramChatId(cardNumber, telegramChatId || '');
  return res.json({ success, telegramChatId });
});

// 4. Customer: Generate Token (Real FIFO)
app.post('/api/tokens/generate', async (req: Request, res: Response) => {
  const { cardNumber, telegramChatId } = req.body;
  if (!cardNumber) {
    return res.status(400).json({ error: "Ration card number required." });
  }

  const card = db.getRationCard(cardNumber) || db.registerOrGetCard(cardNumber);
  
  if (telegramChatId) {
    const trimmed = typeof telegramChatId === 'string' ? telegramChatId.trim() : String(telegramChatId);
    card.telegramChatId = trimmed;
    db.updateTelegramChatId(cardNumber, trimmed);
  }

  // Check if active token already exists
  const existingActive = db.getActiveTokenForCard(card.cardNumber);
  if (existingActive) {
    const { position, customersAhead, estimatedWaitMinutes } = db.calculateQueuePosition(existingActive);
    return res.json({
      token: existingActive,
      position,
      customersAhead,
      estimatedWaitMinutes,
      alreadyActive: true
    });
  }

  // Create FIFO Token
  const token = db.createToken(card);
  const { position, customersAhead, estimatedWaitMinutes } = db.calculateQueuePosition(token);

  // Automatically send token confirmation to linked Telegram account
  if (token.telegramChatId) {
    telegramService.sendTokenConfirmation(token, position, customersAhead, estimatedWaitMinutes).catch(err => {
      console.error("[Telegram] Auto confirmation failed:", err);
    });
  }

  return res.json({
    token,
    position,
    customersAhead,
    estimatedWaitMinutes,
    alreadyActive: false
  });
});

// 5. Customer: Get Live Token Status
app.get('/api/tokens/status/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = db.getTokenById(id);
  if (!token) {
    return res.status(404).json({ error: "Token not found" });
  }

  const { position, customersAhead, estimatedWaitMinutes } = db.calculateQueuePosition(token);
  return res.json({
    token,
    position,
    customersAhead,
    estimatedWaitMinutes
  });
});

// 6. Customer: Cancel Active Token
app.post('/api/tokens/cancel/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.cancelToken(id);
  return res.json({ success });
});

// 7. Employee: Authentication
app.post('/api/employee/login', (req: Request, res: Response) => {
  const { staffId, password } = req.body;
  
  // Accept standard credentials: EMP-101 / 1234 or ADMIN / ration2026
  const cleanId = (staffId || '').trim().toUpperCase();
  const cleanPass = (password || '').trim();

  if (
    (cleanId === 'EMP-101' && cleanPass === '1234') ||
    (cleanId === 'ADMIN' && cleanPass === 'ration2026') ||
    (cleanId === 'STAFF' && cleanPass === '1234')
  ) {
    return res.json({
      success: true,
      user: {
        staffId: cleanId,
        name: cleanId === 'ADMIN' ? "Branch In-Charge Officer" : "Senior Store Keeper",
        role: "COUNTER_OPERATOR",
        shopId: "FPS-42-ANNA"
      }
    });
  }

  return res.status(401).json({ success: false, error: "Invalid Employee credentials." });
});

// 8. Employee: Stock Management
app.get('/api/employee/stock', (_req: Request, res: Response) => {
  res.json({
    stock: db.getStock(),
    logs: db.getStockLogs()
  });
});

app.post('/api/employee/stock/update', (req: Request, res: Response) => {
  const { riceKg, sugarKg, pulsesKg, oilPackets, updatedBy, reason } = req.body;

  const updatedStock = db.updateStock(
    {
      riceKg: riceKg !== undefined ? Number(riceKg) : undefined,
      sugarKg: sugarKg !== undefined ? Number(sugarKg) : undefined,
      pulsesKg: pulsesKg !== undefined ? Number(pulsesKg) : undefined,
      oilPackets: oilPackets !== undefined ? Number(oilPackets) : undefined,
    },
    updatedBy || "Employee Staff",
    reason || "Commodity stock inward receipt / adjustment"
  );

  return res.json({
    success: true,
    stock: updatedStock,
    logs: db.getStockLogs()
  });
});

// 9. Employee: Queue Management
app.get('/api/employee/queue', (_req: Request, res: Response) => {
  const allTokens = db.getQueue();
  const waiting = db.getWaitingTokens();
  const serving = db.getCurrentlyServingToken();
  const completedToday = allTokens.filter(t => t.status === 'COMPLETED');

  return res.json({
    serving: serving || null,
    waiting,
    waitingCount: waiting.length,
    completedCount: completedToday.length,
    completedToday: completedToday.slice(0, 10)
  });
});

// Call Next Token (FIFO) & Trigger Reminders for ~10 customers ahead
app.post('/api/employee/queue/call-next', async (_req: Request, res: Response) => {
  const { previousServing, nextServing } = db.callNextToken();

  if (nextServing) {
    // Send serving alert to customer
    telegramService.sendServingAlert(nextServing, 1).catch(err => {
      console.error("[Telegram] Serving alert error:", err);
    });

    // Automatically check and dispatch reminders to customers who now have approx 10 ahead
    telegramService.checkAndDispatchQueueReminders().catch(err => {
      console.error("[Telegram] Reminder check error:", err);
    });
  }

  return res.json({
    success: true,
    previousServing,
    nextServing,
    waitingCount: db.getWaitingTokens().length
  });
});

// Dispense Commodities with stock safety checks
app.post('/api/employee/queue/dispense', (_req: Request, res: Response) => {
  const serving = db.getCurrentlyServingToken();
  if (!serving) {
    return res.status(400).json({ success: false, error: "No customer currently serving." });
  }

  const result = db.dispenseStockForToken(serving);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json({
    success: true,
    message: result.message,
    stock: result.remainingStock,
    token: serving
  });
});

// 10. AI Assistant: Multilingual PDS Q&A
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  const { query, language } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: "Query is required" });
  }

  const lang: Language = (language && ['en', 'ta', 'te', 'hi'].includes(language)) ? language : 'en';
  try {
    const answer = await askRationAi(query, lang);
    return res.json({ answer });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to process query", details: err.message });
  }
});

// 11. Backend Telegram Audit Log for Demonstration Verification
app.get('/api/telegram/audit', (_req: Request, res: Response) => {
  res.json({
    logs: db.getTelegramAuditLogs(),
    isBotTokenConfigured: telegramService.getBotTokenStatus().configured
  });
});

// ----------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Ration] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
