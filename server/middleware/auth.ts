import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';

const JWT_SECRET = process.env.SESSION_SECRET || 'srqms-demo-secret-key-32chars-min-change-in-prod';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: 'SHOP_OPERATOR' | 'SHOP_SUPERVISOR' | 'SYSTEM_ADMIN';
  shopId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      shopId: user.shopId,
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication session.', 401, 'INVALID_TOKEN'));
  }
}

export function requireRoles(roles: Array<'SHOP_OPERATOR' | 'SHOP_SUPERVISOR' | 'SYSTEM_ADMIN'>) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access forbidden: insufficient permissions.', 403, 'FORBIDDEN'));
    }

    next();
  };
}

export function enforceShopScope(req: AuthenticatedRequest, targetShopId: string): boolean {
  if (!req.user) return false;
  if (req.user.role === 'SYSTEM_ADMIN') return true;
  return req.user.shopId === targetShopId;
}
