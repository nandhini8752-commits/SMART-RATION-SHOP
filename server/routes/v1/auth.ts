import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../db/connection';
import { generateToken, requireAuth, AuthenticatedRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error';

export const authRouter = Router();

// 1. Staff / Administrator Login
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new AppError('Username and password are required.', 400, 'VALIDATION_ERROR');
    }

    const cleanUsername = String(username).trim();

    const userRes = await query(
      `
      SELECT 
        u.id,
        u.username,
        u.password_hash as "passwordHash",
        u.full_name as "fullName",
        u.role,
        u.shop_id as "shopId",
        u.is_active as "isActive",
        s.shop_code as "shopCode",
        s.name as "shopName"
      FROM app_users u
      LEFT JOIN shops s ON s.id = u.shop_id
      WHERE u.username = $1
      LIMIT 1
      `,
      [cleanUsername]
    );

    if (userRes.rows.length === 0) {
      throw new AppError('Invalid username or password.', 401, 'INVALID_CREDENTIALS');
    }

    const user = userRes.rows[0];

    if (!user.isActive) {
      throw new AppError('Account is inactive. Please contact system administrator.', 403, 'ACCOUNT_INACTIVE');
    }

    const isMatch = await bcrypt.compare(String(password).trim(), user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid username or password.', 401, 'INVALID_CREDENTIALS');
    }

    const authUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      shopId: user.shopId,
    };

    const token = generateToken(authUser);

    // Optional audit log for login
    try {
      await query(
        `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
         VALUES ($1, 'LOGIN_SUCCESS', 'app_users', $1::text, $2)`,
        [user.id, JSON.stringify({ role: user.role, username: user.username })]
      );
    } catch (auditErr) {
      console.warn('Audit log write error on login', auditErr);
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        shopId: user.shopId,
        shopCode: user.shopCode,
        shopName: user.shopName,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Staff Logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Session terminated successfully.' });
});

// 3. Current Authenticated Profile
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRes = await query(
      `
      SELECT 
        u.id,
        u.username,
        u.full_name as "fullName",
        u.role,
        u.shop_id as "shopId",
        u.is_active as "isActive",
        s.shop_code as "shopCode",
        s.name as "shopName",
        s.district,
        s.locality
      FROM app_users u
      LEFT JOIN shops s ON s.id = u.shop_id
      WHERE u.id::text = $1
      LIMIT 1
      `,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new AppError('User profile not found.', 404, 'NOT_FOUND');
    }

    res.json({ user: userRes.rows[0] });
  } catch (err) {
    next(err);
  }
});
