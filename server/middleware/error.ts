import { Request, Response, NextFunction } from 'express';

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: ApiErrorDetail[];

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected server error occurred.';

  // Structured server log without exposing stack trace to client
  console.error(`[API Error] [${requestId}] ${req.method} ${req.url} -> ${statusCode} (${code}): ${message}`);
  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      requestId,
      ...(err.details && err.details.length > 0 ? { details: err.details } : {}),
    },
  });
}
