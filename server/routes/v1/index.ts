import { Router } from 'express';
import { healthRouter } from './health';
import { publicRouter } from './public';
import { citizenRouter } from './citizen';
import { authRouter } from './auth';
import { staffRouter } from './staff';
import { inventoryRouter } from './inventory';
import { adminRouter } from './admin';

export const v1Router = Router();

// Liveness & readiness endpoints (/api/v1/health, /api/v1/ready)
v1Router.use('/', healthRouter);

// Authentication & Profile (/api/v1/auth/*)
v1Router.use('/auth', authRouter);

// Public discovery, shop directory, commodities & policies (/api/v1/public/*)
v1Router.use('/public', publicRouter);
// Direct alias for shops convenience (/api/v1/shops/* -> publicRouter)
v1Router.use('/', publicRouter);

// Staff queue dispatch, multi-counter, and beneficiaries (/api/v1/staff/*)
v1Router.use('/staff', staffRouter);

// Staff inventory balances, stock movements, and ledger (/api/v1/staff/inventory/*)
v1Router.use('/staff/inventory', inventoryRouter);

// Administrator portal & governance controls (/api/v1/admin/*)
v1Router.use('/admin', adminRouter);

// Citizen self-service, queue tokens, card entitlements, complaints (/api/v1/*)
v1Router.use('/', citizenRouter);


