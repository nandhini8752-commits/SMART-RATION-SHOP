import { describe, it, expect } from 'vitest';
import { appRoutes } from '../../src/router';
import { translations } from '../../src/translations';

describe('Milestone 2 — Government-Style UI Foundation & Layout Shell', () => {
  it('TC-UI1: Router defines all required routes from 03_PAGE_MAP.md', () => {
    const rootRoute = appRoutes[0];
    expect(rootRoute.path).toBe('/');
    
    const childPaths = rootRoute.children?.map((c) => c.path || '') || [];

    // Core Citizen Routes
    expect(childPaths).toContain('shops');
    expect(childPaths).toContain('shops/:shopId');
    expect(childPaths).toContain('card/verify');
    expect(childPaths).toContain('card/entitlements');
    expect(childPaths).toContain('queue/create');
    expect(childPaths).toContain('complaints/new');
    expect(childPaths).toContain('complaints/:reference');
    expect(childPaths).toContain('notices');
    expect(childPaths).toContain('help');
    expect(childPaths).toContain('accessibility');
    expect(childPaths).toContain('privacy');

    // Auth Routes
    expect(childPaths).toContain('staff/login');
    expect(childPaths).toContain('admin/login');
    expect(childPaths).toContain('forbidden');

    // Staff Operator Routes
    expect(childPaths).toContain('staff/dashboard');
    expect(childPaths).toContain('staff/queue');
    expect(childPaths).toContain('staff/inventory');
    expect(childPaths).toContain('staff/inventory/ledger');
    expect(childPaths).toContain('staff/beneficiaries');
    expect(childPaths).toContain('staff/reports');
    expect(childPaths).toContain('staff/settings');

    // Admin Portal Routes
    expect(childPaths).toContain('admin/dashboard');
    expect(childPaths).toContain('admin/shops');
    expect(childPaths).toContain('admin/staff');
    expect(childPaths).toContain('admin/commodities');
    expect(childPaths).toContain('admin/policies');
    expect(childPaths).toContain('admin/inventory');
    expect(childPaths).toContain('admin/notices');
    expect(childPaths).toContain('admin/complaints');
    expect(childPaths).toContain('admin/audit');
    expect(childPaths).toContain('admin/settings');

    // Digital TV Display
    expect(childPaths).toContain('display/:shopId');

    // 404 Fallback
    expect(childPaths).toContain('*');
  });

  it('TC-UI2: Translation dictionary has all four supported locales', () => {
    expect(translations).toHaveProperty('en');
    expect(translations).toHaveProperty('ta');
    expect(translations).toHaveProperty('te');
    expect(translations).toHaveProperty('hi');
  });

  it('TC-UI3: English and Tamil dictionaries provide essential app labels', () => {
    const en = translations.en;
    const ta = translations.ta;

    expect(en.appName).toBeTruthy();
    expect(ta.appName).toBeTruthy();

    expect(en.statusWaiting).toBeTruthy();
    expect(ta.statusWaiting).toBeTruthy();

    expect(en.rice).toBeTruthy();
    expect(ta.rice).toBeTruthy();
    expect(en.sugar).toBeTruthy();
    expect(ta.sugar).toBeTruthy();
  });
});
