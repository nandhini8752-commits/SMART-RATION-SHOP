import { Router, Request, Response, NextFunction } from 'express';
import { citizenService } from '../../services/citizenService';
import { queueService } from '../../services/queueService';
import { notificationService } from '../../services/notificationService.js';
import { AppError } from '../../middleware/error';

export const citizenRouter = Router();

// 1. Synthetic Ration Card Verification
citizenRouter.post('/citizen/demo-card-verifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardNumber } = req.body;
    if (!cardNumber || typeof cardNumber !== 'string') {
      throw new AppError('Valid synthetic ration card number is required', 400, 'VALIDATION_ERROR');
    }
    const result = await citizenService.verifyDemoCard(cardNumber);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 2. Fetch Card Entitlements
citizenRouter.get('/citizen/demo-card-verifications/:id/entitlements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await citizenService.getCardEntitlements(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3. Generate FIFO Queue Token
citizenRouter.post('/queue-tokens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rationCardId, shopId, verificationId } = req.body;
    if (!rationCardId || !shopId) {
      throw new AppError('rationCardId and shopId are required to generate queue token', 400, 'VALIDATION_ERROR');
    }

    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

    const result = await queueService.generateToken({
      rationCardId,
      shopId,
      idempotencyKey,
      verificationId,
    });

    res.status(result.alreadyActive ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
});

// 4. Get Queue Token Status
citizenRouter.get('/queue-tokens/:tokenId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await queueService.getTokenDetails(req.params.tokenId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 5. Cancel Queue Token
citizenRouter.post('/queue-tokens/:tokenId/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reason = req.body?.reason || 'Cancelled by citizen';
    const result = await queueService.cancelToken(req.params.tokenId, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 6. Register Citizen Demonstration Complaint
citizenRouter.post('/complaints', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, subject, message, shopId, demoContactHint } = req.body;
    const result = await citizenService.createComplaint({
      category,
      subject,
      message,
      shopId,
      demoContactHint,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// 7. Track Complaint
citizenRouter.get('/complaints/:referenceCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await citizenService.getComplaintByReference(req.params.referenceCode);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 8. AI/Rule Assistant for PDS Guidance
citizenRouter.post('/assistant/query', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query: queryText, language = 'en' } = req.body;
    if (!queryText || typeof queryText !== 'string') {
      throw new AppError('Question query is required', 400, 'VALIDATION_ERROR');
    }

    const q = queryText.toLowerCase();
    let replyEn = 'In Tamil Nadu, PDS rice is distributed free of cost to eligible PHH and NPHH ration card holders. Tokens can be generated online through SRQMS before visiting the shop.';
    let replyTa = 'தமிழ்நாட்டில் தகுதியான குடும்ப அட்டைதாரர்களுக்கு பொது விநியோகத் திட்ட அரிசி இலவசமாக வழங்கப்படுகிறது. கடைக்குச் செல்வதற்கு முன் SRQMS மூலம் வரிசை டோக்கன் பெற்றுக்கொள்ளலாம்.';

    if (q.includes('sugar') || q.includes('சர்க்கரை')) {
      replyEn = 'Sugar is distributed at ₹25/kg as per card entitlement scales (0.5 kg per head, up to card limits).';
      replyTa = 'சர்க்கரை குடும்ப அட்டை விதிகளின்படி நபருக்கு 0.5 கிலோ வீதம் ₹25/கிலோ விலையில் வழங்கப்படுகிறது.';
    } else if (q.includes('wheat') || q.includes('கோதுமை')) {
      replyEn = 'Wheat is provided free of cost up to 10 kg per eligible card in district municipal areas.';
      replyTa = 'தகுதியான அட்டைதாரர்களுக்கு 10 கிலோ வரை கோதுமை இலவசமாக வழங்கப்படுகிறது.';
    } else if (q.includes('token') || q.includes('டோக்கன்') || q.includes('queue') || q.includes('வரிசை')) {
      replyEn = 'You can generate a queue token for today with your synthetic ration card number. Each card is permitted one active waiting token per day.';
      replyTa = 'இன்றைய நாளுக்கான வரிசை டோக்கனை உங்கள் குடும்ப அட்டை எண்ணைக் கொண்டு பெறலாம். ஒரு நாளுக்கு ஒரு டோக்கன் மட்டுமே அனுமதிக்கப்படும்.';
    } else if (q.includes('timing') || q.includes('hour') || q.includes('நேரம்')) {
      replyEn = 'Fair Price Shops generally operate from 09:00 AM to 01:00 PM and 02:00 PM to 06:00 PM on all working days.';
      replyTa = 'நியாயவிலைக் கடைகள் அனைத்து வேலை நாட்களிலும் காலை 09:00 முதல் மதியம் 01:00 வரையிலும், மதியம் 02:00 முதல் மாலை 06:00 வரையிலும் செயல்படுகின்றன.';
    }

    res.json({
      query: queryText,
      language,
      response: language === 'ta' ? replyTa : replyEn,
      disclaimer: 'Prototype automated guidance based on Tamil Nadu Civil Supplies Department policies.',
    });
  } catch (err) {
    next(err);
  }
});

// 9. Token Notifications Feed
citizenRouter.get('/queue/:tokenId/notifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await notificationService.getTokenNotifications(req.params.tokenId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

