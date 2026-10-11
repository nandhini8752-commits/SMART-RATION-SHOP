import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../../middleware/auth.js';
import { adminService } from '../../services/adminService.js';
import { AppError } from '../../middleware/error.js';

export const adminRouter = Router();

// Enforce SYSTEM_ADMIN role on all admin routes
adminRouter.use(requireAuth, requireRoles(['SYSTEM_ADMIN']));

/**
 * 1. Dashboard summary counters
 * GET /api/v1/admin/summary
 */
adminRouter.get('/summary', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await adminService.getDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Shops Management
 * GET /api/v1/admin/shops
 * POST /api/v1/admin/shops
 */
adminRouter.get('/shops', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getShops();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/shops', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shop = await adminService.createShop(req.body, req.user!.id);
    res.status(201).json({ shop });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. Staff Users & RBAC
 * GET /api/v1/admin/users
 * POST /api/v1/admin/users
 * PATCH /api/v1/admin/users/:id/status
 */
adminRouter.get('/users', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getUsers();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/users', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.createUser(req.body, req.user!.id);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive boolean is required.', 400, 'VALIDATION_ERROR');
    }
    const user = await adminService.updateUserStatus(req.params.id, isActive, req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

/**
 * 4. Commodities Catalogue
 * GET /api/v1/admin/commodities
 * POST /api/v1/admin/commodities
 */
adminRouter.get('/commodities', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getCommodities();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/commodities', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const commodity = await adminService.createCommodity(req.body, req.user!.id);
    res.status(201).json({ commodity });
  } catch (err) {
    next(err);
  }
});

/**
 * 5. Versioned Policy Rules
 * GET /api/v1/admin/policies
 * POST /api/v1/admin/policies
 */
adminRouter.get('/policies', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getPolicies();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/policies', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const policy = await adminService.createPolicyRule(req.body, req.user!.id);
    res.status(201).json({ policy });
  } catch (err) {
    next(err);
  }
});

/**
 * 6. Department Notices
 * GET /api/v1/admin/notices
 * POST /api/v1/admin/notices
 */
adminRouter.get('/notices', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getNotices();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/notices', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notice = await adminService.createNotice(req.body, req.user!.id);
    res.status(201).json({ notice });
  } catch (err) {
    next(err);
  }
});

/**
 * 7. Grievance Complaints Triage
 * GET /api/v1/admin/complaints
 * PATCH /api/v1/admin/complaints/:id
 */
adminRouter.get('/complaints', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getComplaints(req.query.status as string);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/complaints/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, responseNote } = req.body;
    if (!status) {
      throw new AppError('status is required.', 400, 'VALIDATION_ERROR');
    }
    const complaint = await adminService.updateComplaint(
      req.params.id,
      status,
      responseNote,
      req.user!.id
    );
    res.json({ complaint });
  } catch (err) {
    next(err);
  }
});

/**
 * 8. Audit Logs Stream
 * GET /api/v1/admin/audit-logs
 */
adminRouter.get('/audit-logs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const data = await adminService.getAuditLogs(limit, offset);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * 9. Cross-Shop Inventory Governance
 * GET /api/v1/admin/inventory
 */
adminRouter.get('/inventory', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const shopId = req.query.shopId as string;
    const data = await adminService.getInventoryOverview(shopId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * 10. System Settings & Feature Flags
 * GET /api/v1/admin/settings
 */
adminRouter.get('/settings', async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await adminService.getSystemSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

