import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart3, ArrowLeft, Download, Calendar, Users, Package } from 'lucide-react';

export const StaffReportsPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link 
          to="/staff/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'பணியாளர் பலகைக்கு திரும்புக' : 'Back to Staff Dashboard'}</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D9DC] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#222222]">
            {language === 'ta' ? 'செயல்பாட்டு அறிக்கைகள் மற்றும் அளவீடுகள்' : 'Operational Performance Reports'}
          </h2>
          <p className="text-xs text-[#555555] mt-1">
            Fair Price Shop 001 (Anna Nagar East) • Queue Throughput & Daily Distribution Totals
          </p>
        </div>

        <button
          onClick={() => alert('Demo CSV export downloaded.')}
          className="inline-flex items-center gap-1.5 bg-[#FAF8F4] hover:bg-white text-[#7B2638] text-xs font-bold px-3.5 py-2 rounded border border-[#D6D9DC] transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'அறிக்கை பதிவிறக்குக (CSV)' : 'Export Demo Report (CSV)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div className="bg-white border border-[#D6D9DC] p-5 rounded-lg space-y-2">
          <div className="text-[#555555] font-semibold">Average Service Time / Beneficiary</div>
          <div className="text-2xl font-black font-mono text-[#7B2638]">3.4 min</div>
          <p className="text-[10px] text-[#777777]">Across Counter 1 and Counter 2</p>
        </div>

        <div className="bg-white border border-[#D6D9DC] p-5 rounded-lg space-y-2">
          <div className="text-[#555555] font-semibold">Total Rice Distributed Today</div>
          <div className="text-2xl font-black font-mono text-[#1F6B45]">360 kg</div>
          <p className="text-[10px] text-[#777777]">Free NFSA / State subsidized allocation</p>
        </div>

        <div className="bg-white border border-[#D6D9DC] p-5 rounded-lg space-y-2">
          <div className="text-[#555555] font-semibold">No-Show / Cancelled Rate</div>
          <div className="text-2xl font-black font-mono text-[#8A5300]">5.2%</div>
          <p className="text-[10px] text-[#777777]">1 cancelled token out of 19 issued</p>
        </div>
      </div>
    </div>
  );
};
