import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Home, 
  Store, 
  CreditCard, 
  Ticket, 
  Bell, 
  MessageSquareWarning, 
  HelpCircle, 
  UserCheck, 
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

export const PrimaryNav: React.FC = () => {
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      labelEn: 'Home',
      labelTa: 'முகப்பு',
      icon: Home,
      exact: true
    },
    {
      to: '/shops',
      labelEn: 'Ration Shops',
      labelTa: 'நியாயவிலைக் கடைகள்',
      icon: Store
    },
    {
      to: '/card/verify',
      labelEn: 'Card Verification',
      labelTa: 'குடும்ப அட்டை சரிபார்ப்பு',
      icon: CreditCard
    },
    {
      to: '/queue/create',
      labelEn: 'Queue Token',
      labelTa: 'வரிசை டோக்கன்',
      icon: Ticket
    },
    {
      to: '/notices',
      labelEn: 'Notices',
      labelTa: 'அறிவிப்புகள்',
      icon: Bell
    },
    {
      to: '/complaints/new',
      labelEn: 'Grievances',
      labelTa: 'புகார்கள்',
      icon: MessageSquareWarning
    },
    {
      to: '/help',
      labelEn: 'Help & FAQ',
      labelTa: 'உதவி மையம்',
      icon: HelpCircle
    }
  ];

  const isStaffLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('srqms_staff_user');
  const isAdminLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('srqms_admin_user');

  const portalLinks = [
    {
      to: isStaffLoggedIn ? '/staff/dashboard' : '/staff/login',
      labelEn: isStaffLoggedIn ? 'Staff Console' : 'Staff Portal',
      labelTa: isStaffLoggedIn ? 'பணியாளர் பலகை' : 'பணியாளர் தளம்',
      icon: UserCheck
    },
    {
      to: isAdminLoggedIn ? '/admin/dashboard' : '/admin/login',
      labelEn: isAdminLoggedIn ? 'Admin Console' : 'Admin Portal',
      labelTa: isAdminLoggedIn ? 'நிர்வாக பலகை' : 'நிர்வாக தளம்',
      icon: ShieldAlert
    }
  ];

  return (
    <nav className="bg-[#7B2638] text-white shadow-md relative z-40" aria-label="Primary Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-1 h-full overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 h-full text-xs font-semibold tracking-wide transition-colors whitespace-nowrap border-b-3 ${
                    isActive
                      ? 'border-[#C49A3A] text-white bg-[#591A28]'
                      : 'border-transparent text-white/90 hover:text-white hover:bg-[#591A28]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#E1BD67]" />
                  <span>{language === 'ta' ? item.labelTa : item.labelEn}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Portal Links (Staff & Admin) */}
          <div className="hidden md:flex items-center space-x-2">
            {portalLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to.replace('/login', ''));

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'bg-[#C49A3A] text-[#222222]'
                      : 'bg-black/25 text-white/90 hover:bg-black/40 hover:text-white border border-white/20'
                  }`}
                >
                  <Icon className="w-3 h-3 text-[#E1BD67]" />
                  <span>{language === 'ta' ? item.labelTa : item.labelEn}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center justify-between w-full">
            <span className="text-xs font-bold text-[#E1BD67] tracking-wider uppercase">
              {language === 'ta' ? 'முதன்மை மெனு' : 'Navigation Menu'}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-white hover:bg-[#591A28] focus:outline-hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#591A28] border-t border-[#7B2638] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#7B2638] text-white border-l-4 border-[#C49A3A]'
                    : 'text-white/80 hover:bg-[#7B2638]/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-[#E1BD67]" />
                <span>{language === 'ta' ? item.labelTa : item.labelEn}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-white/10 mt-2 space-y-1.5">
            {portalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider bg-black/20 text-white hover:bg-black/40"
                >
                  <Icon className="w-3.5 h-3.5 text-[#E1BD67]" />
                  <span>{language === 'ta' ? item.labelTa : item.labelEn}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
