import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../../middleware/auth.js';
import { inventoryService } from '../../services/inventoryService.js';
import { AppError } from '../../middleware/error.js';

export const inventoryRouter = Router();

// Require staff or admin auth for all inventory operations
inventoryRouter.use(
  requireAuth,
  requireRoles(['SHOP_OPERATOR', 'SHOP_SUPERVISOR', 'SYSTEM_ADMIN'])
);

/**
 * GET /api/v1/staff/inventory
 * Live inventory balance for the operator's shop
 */
inventoryRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.query.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('Shop ID is required.', 400, 'SHOP_REQUIRED');
    }

    const data = await inventoryService.getShopInventory(shopId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/staff/inventory/transactions
 * Record stock adjustment (RESTOCK, ADJUSTMENT, REVERSAL) with audit ledger
 */
inventoryRouter.post('/transactions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = req.body.shopId || req.user?.shopId;
    if (!shopId) {
      throw new AppError('Shop ID is required.', 400, 'SHOP_REQUIRED');
    }

    const { commodityCode, transactionType, quantityDelta, reason, idempotencyKey } = req.body;

    if (!commodityCode || !transactionType || quantityDelta === undefined || !reason) {
      throw new AppError(
        'Missing required fields: commodityCode, transactionType, quantityDelta, reason.',
        400,
        'VALIDATION_ERROR'
      );
    }

    const result = await inventoryService.recordStockTransaction({
      shopId,
      commodityCode,
      transactionType,
      quantityDelta: parseFloat(quantityDelta),
      reason,
      actorUserId: req.user!.id,
      idempotencyKey,
      requestId: req.headers['x-request-id'] as string,
    });

    res.status(result.idempotentReplay ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/staff/inventory/ledger
 * Immutable stock transactions ledger
 */
inventoryRouter.get('/ledger', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.query.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('Shop ID is required.', 400, 'SHOP_REQUIRED');
    }

    const result = await inventoryService.getStockLedger(shopId, {
      type: req.query.type as string,
      commodityCode: req.query.commodityCode as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/staff/inventory/distribute
 * Dispense commodities for an active token in SERVING state
 */
inventoryRouter.post('/distribute', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = req.body.shopId || req.user?.shopId;
    if (!shopId) {
      throw new AppError('Shop ID is required.', 400, 'SHOP_REQUIRED');
    }

    const { tokenId, items, note } = req.body;
    if (!tokenId || !items || !Array.isArray(items)) {
      throw new AppError('Token ID and dispensation items list are required.', 400, 'VALIDATION_ERROR');
    }

    const result = await inventoryService.distributeEntitlement({
      tokenId,
      shopId,
      actorUserId: req.user!.id,
      items,
      note,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
