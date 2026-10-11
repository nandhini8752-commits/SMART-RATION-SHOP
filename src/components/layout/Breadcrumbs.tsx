import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, { en: string; ta: string }> = {
  'shops': { en: 'Ration Shops', ta: 'நியாயவிலைக் கடைகள்' },
  'card': { en: 'Card Services', ta: 'குடும்ப அட்டை சேவைகள்' },
  'verify': { en: 'Verification', ta: 'சரிபார்ப்பு' },
  'entitlements': { en: 'Entitlement Details', ta: 'உரிம விவரங்கள்' },
  'queue': { en: 'Queue Token', ta: 'வரிசை டோக்கன்' },
  'create': { en: 'Generate Token', ta: 'டோக்கன் பெறுதல்' },
  'notices': { en: 'Department Notices', ta: 'அரசு அறிவிப்புகள்' },
  'complaints': { en: 'Grievance Redressal', ta: 'குறைதீர்ப்பு மையம்' },
  'new': { en: 'New Complaint', ta: 'புதிய புகார்' },
  'help': { en: 'Help & FAQ', ta: 'உதவி மையம் & அடிக்கடி கேட்கப்படும் கேள்விகள்' },
  'accessibility': { en: 'Accessibility', ta: 'அணுகல்தன்மை' },
  'privacy': { en: 'Privacy & Demo Scope', ta: 'தனியுரிமை மற்றும் மாதிரி நோக்கம்' },
  'staff': { en: 'Staff Operations', ta: 'பணியாளர் தளம்' },
  'dashboard': { en: 'Dashboard', ta: 'கண்காணிப்பு பலகை' },
  'inventory': { en: 'Inventory Ledger', ta: 'இருப்பு விவரங்கள்' },
  'beneficiaries': { en: 'Beneficiary Directory', ta: 'பயனாளிகள் பட்டியல்' },
  'reports': { en: 'Operational Reports', ta: 'செயல்பாட்டு அறிக்கைகள்' },
  'admin': { en: 'System Administration', ta: 'கணினி நிர்வாகம்' },
  'policies': { en: 'Policy Rules', ta: 'கொள்கை விதிகள்' },
  'audit': { en: 'Audit Logs', ta: 'தணிக்கை பதிவுகள்' }
};

const SEGMENT_REDIRECTS: Record<string, string> = {
  '/admin': '/admin/dashboard',
  '/staff': '/staff/dashboard',
  '/card': '/card/verify',
  '/queue': '/queue/create',
  '/complaints': '/complaints/new'
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { language } = useLanguage();

  if (location.pathname === '/') {
    return null;
  }

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="bg-[#FAF8F4] border-b border-[#EBE8E1] py-2 px-4 sm:px-6 text-xs text-[#555555]">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
        <Link 
          to="/" 
          className="flex items-center gap-1 text-[#7B2638] hover:underline font-semibold"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
        </Link>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const labelConfig = ROUTE_LABELS[value];
          const label = labelConfig 
            ? (language === 'ta' ? labelConfig.ta : labelConfig.en)
            : decodeURIComponent(value);

          return (
            <React.Fragment key={to}>
              <ChevronRight className="w-3 h-3 text-[#A0A0A0] shrink-0" />
              {isLast ? (
                <span className="font-semibold text-[#222222]" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={SEGMENT_REDIRECTS[to] || to} className="text-[#7B2638] hover:underline font-medium">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
