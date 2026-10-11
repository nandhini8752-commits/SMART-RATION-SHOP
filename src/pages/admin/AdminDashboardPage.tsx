import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldAlert, 
  Store, 
  Users, 
  Package, 
  FileText, 
  Bell, 
  MessageSquareWarning, 
  Activity, 
  ArrowRight, 
  LogOut,
  Sliders,
  History
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [adminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('srqms_admin_user');
      return saved ? JSON.parse(saved) : {
        username: 'admin_tn',
        fullName: 'TNPDS State System Administrator',
        role: 'SYSTEM_ADMIN'
      };
    } catch {
      return {
        username: 'admin_tn',
        fullName: 'TNPDS State System Administrator',
        role: 'SYSTEM_ADMIN'
      };
    }
  });

  const [stats, setStats] = useState({
    activeShops: 3,
    activeStaffUsers: 3,
    activeCommodities: 6,
    versionedPolicies: 5,
    publishedNotices: 3,
    pendingComplaints: 1,
    totalAuditEvents: 24
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const headers: Record<string, string> = {};
        if (adminUser?.token) {
          headers['Authorization'] = `Bearer ${adminUser.token}`;
        }
        const res = await fetch('/api/v1/admin/summary', { headers });
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Admin summary fetch error:', err);
      }
    };
    fetchSummary();
  }, [adminUser?.token]);

  const handleLogout = () => {
    localStorage.removeItem('srqms_admin_user');
    navigate('/admin/login');
  };

  const adminModules = [
    {
      to: '/admin/shops',
      titleEn: 'Fair Price Shops',
      titleTa: 'நியாயவிலைக் கடைகள்',
      descEn: 'Register, edit, and configure demonstration shops, locations, and working hours.',
      icon: Store,
      count: `${stats.activeShops} Shops`
    },
    {
      to: '/admin/staff',
      titleEn: 'Staff & Roles (RBAC)',
      titleTa: 'பணியாளர்கள் & அனுமதிகள்',
      descEn: 'Manage operator and supervisor accounts, shop assignments, and access roles.',
      icon: Users,
      count: `${stats.activeStaffUsers} Accounts`
    },
    {
      to: '/admin/commodities',
      titleEn: 'Commodity Catalogue',
      titleTa: 'பொருட்கள் அட்டவணை',
      descEn: 'Maintain essential commodities, measurement units, and multilingual labels.',
      icon: Package,
      count: `${stats.activeCommodities} Items`
    },
    {
      to: '/admin/policies',
      titleEn: 'Versioned Policy Rules',
      titleTa: 'கொள்கை அளவீட்டு விதிகள்',
      descEn: 'Configure entitlement scales, effective dates, and official source citations.',
      icon: Sliders,
      count: `${stats.versionedPolicies} Rules`
    },
    {
      to: '/admin/notices',
      titleEn: 'Department Notices',
      titleTa: 'அரசு அறிவிப்புகள்',
      descEn: 'Publish, schedule, and archive public circulars across English and Tamil.',
      icon: Bell,
      count: `${stats.publishedNotices} Published`
    },
    {
      to: '/admin/complaints',
      titleEn: 'Grievance Triage',
      titleTa: 'புகார்கள் மேலாண்மை',
      descEn: 'Review citizen complaints, assign status, and record official response notes.',
      icon: MessageSquareWarning,
      count: `${stats.pendingComplaints} Pending`
    },
    {
      to: '/admin/audit',
      titleEn: 'Security & Action Audit',
      titleTa: 'பாதுகாப்பு தணிக்கை ஏடு',
      descEn: 'Searchable, immutable ledger of all administrative and transactional events.',
      icon: History,
      count: `${stats.totalAuditEvents} Events`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white bg-[#591A28] px-2 py-0.5 rounded">
              SYSTEM_ADMIN
            </span>
            <span className="text-[11px] font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
              State Operations Scope
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#222222]">
            TNPDS State System Administration Console
          </h2>
          <div className="text-xs text-[#555555]">
            Logged in as <strong className="text-[#222222]">admin_tn (Civil Supplies IT Cell)</strong>
          </div>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#A12622] hover:bg-red-50 border border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'வெளியேறுக' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.to}
              to={mod.to}
              className="bg-white border border-[#D6D9DC] hover:border-[#7B2638] rounded-lg p-5 flex flex-col justify-between space-y-3 group transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded bg-[#591A28] text-[#E1BD67] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold font-mono text-[#555555] bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#E5E0D5]">
                    {mod.count}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#222222] group-hover:text-[#7B2638]">
                  {language === 'ta' ? mod.titleTa : mod.titleEn}
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  {mod.descEn}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold text-[#7B2638]">
                <span>{language === 'ta' ? 'நிர்வகிக்க' : 'Configure Module'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
