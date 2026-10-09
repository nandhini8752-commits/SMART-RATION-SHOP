/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { EmployeePortal } from './components/EmployeePortal';
import { AiAssistant } from './components/AiAssistant';
import { ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

function AppContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'customer' | 'employee' | 'ai'>('customer');
  const [waitingCount, setWaitingCount] = useState(0);

  // Poll general shop status to keep header count in sync
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setWaitingCount(data.waitingCount || 0);
        }
      } catch (err) {
        // Dev server or background
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      {/* Header containing all 4 core features: Customer Portal, Employee Portal, AI Assistant, Language Selector */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        waitingCount={waitingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'customer' && <CustomerPortal />}
        {activeTab === 'employee' && <EmployeePortal />}
        {activeTab === 'ai' && <AiAssistant />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 sm:px-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">{t.appName}</span>
            <span>• Department of Food, Civil Supplies & Consumer Protection</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              Toll-Free Helpline: 1967 / 1800-425-5901
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <HeartHandshake className="w-3.5 h-3.5" />
              National Food Security Act (NFSA)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
