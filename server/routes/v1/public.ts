import { Router, Request, Response, NextFunction } from 'express';
import { shopService } from '../../services/shopService';
import { AppError } from '../../middleware/error';

export const publicRouter = Router();

// 1. System & Public Configuration
publicRouter.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await shopService.getPublicConfig();
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// 2. Search & List Fair Price Shops
publicRouter.get('/shops', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await shopService.getShops({
      q: req.query.q as string,
      district: req.query.district as string,
      taluk: req.query.taluk as string,
      pincode: req.query.pincode as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3. Single Shop Profile
publicRouter.get('/shops/:shopId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shop = await shopService.getShopById(req.params.shopId);
    if (!shop) {
      throw new AppError('Ration shop not found', 404, 'NOT_FOUND');
    }
    res.json({ shop });
  } catch (err) {
    next(err);
  }
});

// 4. Shop Availability & Queue Snapshot
publicRouter.get('/shops/:shopId/availability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const availability = await shopService.getShopAvailability(req.params.shopId);
    if (!availability) {
      throw new AppError('Ration shop not found', 404, 'NOT_FOUND');
    }
    res.json(availability);
  } catch (err) {
    next(err);
  }
});

// 5. Commodities Catalogue
publicRouter.get('/commodities', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const commodities = await shopService.getCommodities();
    res.json({ commodities });
  } catch (err) {
    next(err);
  }
});

// 6. Current Entitlement Policies
publicRouter.get('/policies/current', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const policies = await shopService.getCurrentPolicies();
    res.json({
      policyVersion: 'TN-PDS-2026-V1',
      isDemo: true,
      policies,
    });
  } catch (err) {
    next(err);
  }
});

// 7. Department Notices
publicRouter.get('/notices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notices = await shopService.getPublishedNotices(req.query.category as string);
    res.json({ notices });
  } catch (err) {
    next(err);
  }
});
