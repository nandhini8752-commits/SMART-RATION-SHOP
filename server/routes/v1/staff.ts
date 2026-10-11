import { Router, Response, NextFunction } from 'express';
import { staffService } from '../../services/staffService';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error';

export const staffRouter = Router();

// Protect all staff routes with auth & staff roles
staffRouter.use(requireAuth);
staffRouter.use(requireRoles(['SHOP_OPERATOR', 'SHOP_SUPERVISOR', 'SYSTEM_ADMIN']));

// 1. Fetch assigned shop live queue state
staffRouter.get('/queue', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.query.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const queueData = await staffService.getQueue(shopId, {
      serviceDate: req.query.serviceDate as string,
      counterNo: req.query.counterNo ? parseInt(req.query.counterNo as string, 10) : undefined,
      status: req.query.status as string,
    });

    res.json(queueData);
  } catch (err) {
    next(err);
  }
});

// 2. Call next FIFO token to counter
staffRouter.post('/queue/call-next', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.body?.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const counterNo = parseInt(String(req.body?.counterNo || 1), 10);
    const actorUserId = req.user!.id;

    const result = await staffService.callNext(shopId, counterNo, actorUserId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3. Mark token as NO_SHOW
staffRouter.post('/queue-tokens/:tokenId/no-show', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.body?.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const { reason } = req.body;
    if (!reason?.trim()) {
      throw new AppError('Reason is required when marking token as no-show.', 400, 'VALIDATION_ERROR');
    }

    const result = await staffService.markNoShow(req.params.tokenId, shopId, req.user!.id, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 4. Cancel token by staff
staffRouter.post('/queue-tokens/:tokenId/cancel', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.body?.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const { reason } = req.body;
    if (!reason?.trim()) {
      throw new AppError('Reason is required when cancelling a token by staff.', 400, 'VALIDATION_ERROR');
    }

    const result = await staffService.cancelTokenByStaff(req.params.tokenId, shopId, req.user!.id, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 5. Complete service for token
staffRouter.post('/queue-tokens/:tokenId/complete', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.body?.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const { note } = req.body || {};
    const result = await staffService.completeToken(req.params.tokenId, shopId, req.user!.id, note);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 6. Beneficiaries directory for assigned shop
staffRouter.get('/beneficiaries', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.query.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const result = await staffService.getBeneficiaries(shopId, req.query.q as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 7. Shift Reports & KPI Summary
staffRouter.get('/reports/summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = (req.query.shopId as string) || req.user?.shopId;
    if (!shopId) {
      throw new AppError('No assigned shop found for staff actor.', 400, 'SHOP_REQUIRED');
    }

    const result = await staffService.getReportsSummary(
      shopId,
      req.query.startDate as string,
      req.query.endDate as string
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});
