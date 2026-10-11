import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Citizen Pages
import { HomePage } from './pages/citizen/HomePage';
import { ShopFinderPage } from './pages/citizen/ShopFinderPage';
import { ShopDetailPage } from './pages/citizen/ShopDetailPage';
import { RationServicesPage } from './pages/citizen/RationServicesPage';
import { CardVerificationPage } from './pages/citizen/CardVerificationPage';
import { EntitlementViewPage } from './pages/citizen/EntitlementViewPage';
import { TokenGeneratePage } from './pages/citizen/TokenGeneratePage';
import { ComplaintsNewPage } from './pages/citizen/ComplaintsNewPage';
import { ComplaintTrackPage } from './pages/citizen/ComplaintTrackPage';
import { NoticesPage } from './pages/citizen/NoticesPage';
import { HelpPage } from './pages/citizen/HelpPage';
import { AccessibilityPage } from './pages/citizen/AccessibilityPage';
import { PrivacyPage } from './pages/citizen/PrivacyPage';

// Auth Pages
import { StaffLoginPage } from './pages/auth/StaffLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { ForbiddenPage } from './pages/auth/ForbiddenPage';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffLiveQueuePage } from './pages/staff/StaffLiveQueuePage';
import { StaffInventoryPage } from './pages/staff/StaffInventoryPage';
import { StaffStockLedgerPage } from './pages/staff/StaffStockLedgerPage';
import { StaffBeneficiariesPage } from './pages/staff/StaffBeneficiariesPage';
import { StaffReportsPage } from './pages/staff/StaffReportsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminShopsPage } from './pages/admin/AdminShopsPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminCommoditiesPage } from './pages/admin/AdminCommoditiesPage';
import { AdminPoliciesPage } from './pages/admin/AdminPoliciesPage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';

// 404 Page
import { NotFoundPage } from './pages/NotFoundPage';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shops', element: <ShopFinderPage /> },
      { path: 'shops/:shopId', element: <ShopDetailPage /> },
      { path: 'ration-services', element: <RationServicesPage /> },
      { path: 'card/verify', element: <CardVerificationPage /> },
      { path: 'card/entitlements', element: <EntitlementViewPage /> },
      { path: 'queue/create', element: <TokenGeneratePage /> },
      { path: 'queue/:tokenId', element: <TokenGeneratePage /> },
      { path: 'complaints/new', element: <ComplaintsNewPage /> },
      { path: 'complaints/:reference', element: <ComplaintTrackPage /> },
      { path: 'notices', element: <NoticesPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: 'privacy', element: <PrivacyPage /> },

      // Auth Routes
      { path: 'staff/login', element: <StaffLoginPage /> },
      { path: 'admin/login', element: <AdminLoginPage /> },
      { path: 'forbidden', element: <ForbiddenPage /> },

      // Staff Portal Routes
      { path: 'staff/dashboard', element: <StaffDashboardPage /> },
      { path: 'staff/queue', element: <StaffLiveQueuePage /> },
      { path: 'staff/queue/:tokenId', element: <StaffLiveQueuePage /> },
      { path: 'staff/inventory', element: <StaffInventoryPage /> },
      { path: 'staff/inventory/ledger', element: <StaffStockLedgerPage /> },
      { path: 'staff/beneficiaries', element: <StaffBeneficiariesPage /> },
      { path: 'staff/reports', element: <StaffReportsPage /> },

      // Administrator Portal Routes
      { path: 'admin/dashboard', element: <AdminDashboardPage /> },
      { path: 'admin/shops', element: <AdminShopsPage /> },
      { path: 'admin/staff', element: <AdminStaffPage /> },
      { path: 'admin/commodities', element: <AdminCommoditiesPage /> },
      { path: 'admin/policies', element: <AdminPoliciesPage /> },
      { path: 'admin/notices', element: <AdminNoticesPage /> },
      { path: 'admin/complaints', element: <AdminComplaintsPage /> },
      { path: 'admin/audit', element: <AdminAuditPage /> },

      // Fallback
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = typeof document !== 'undefined' ? createBrowserRouter(appRoutes) : (null as any);
