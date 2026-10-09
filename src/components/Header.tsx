import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Store, User, ShieldCheck, Bot, Globe, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: 'customer' | 'employee' | 'ai';
  setActiveTab: (tab: 'customer' | 'employee' | 'ai') => void;
  waitingCount: number;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, waitingCount }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Government / Department Ribbon */}
      <div className="bg-emerald-800 px-4 py-1 text-xs font-medium text-emerald-100 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t.shopName} • {t.shopLocation}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-200">
            <Radio className="w-3.5 h-3.5 text-emerald-300" />
            {t.liveStatus}
          </span>
          <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-white font-mono font-semibold">
            {waitingCount} {t.statusWaiting}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-950/40 border border-emerald-400/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {t.appName}
            </h1>
            <p className="text-xs text-slate-400 font-medium">{t.appSubtitle}</p>
          </div>
        </div>

        {/* 4 Main Features: Tabs & Language Selector */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {/* Feature 1: Customer Portal */}
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'customer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.navCustomer}</span>
          </button>

          {/* Feature 2: Employee Portal */}
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'employee'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.navEmployee}</span>
          </button>

          {/* Feature 3: AI Assistant */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>{t.navAi}</span>
          </button>

          {/* Feature 4: Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                title={`${lang.label} (${lang.native})`}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  language === lang.code
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
