import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import { PhoneCall, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
];

export const Masthead: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-[#F6F3EA] border-b border-[#D6D9DC]">
      {/* Top Accessibility & Official Helpline Bar */}
      <div className="bg-[#591A28] text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide text-[#E1BD67]">
              {language === 'ta' ? 'தமிழ்நாடு அரசு' : 'GOVERNMENT OF TAMIL NADU'}
            </span>
            <span className="text-white/60">|</span>
            <span className="text-white/90 hidden sm:inline">
              {language === 'ta' 
                ? 'உணவுப் பொருள் வழங்கல் மற்றும் நுகர்வோர் பாதுகாப்புத் துறை'
                : 'Civil Supplies & Consumer Protection Department'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a 
              href="tel:1967" 
              className="flex items-center gap-1 text-[#E1BD67] hover:underline"
              title="Toll-free customer care"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{language === 'ta' ? 'கட்டணமில்லா உதவி எண்: 1967' : 'Toll-Free: 1967 / 1800-425-5901'}</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-black/20 rounded px-1.5 py-0.5">
              <Globe className="w-3 h-3 text-[#E1BD67]" />
              <div className="flex items-center gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      language === lang.code
                        ? 'bg-[#C49A3A] text-[#222222] font-bold'
                        : 'text-white/80 hover:text-white'
                    }`}
                    aria-label={`Switch language to ${lang.label}`}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Department Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Department Identity & Mark */}
        <Link to="/" className="flex items-center gap-3.5 text-decoration-none group">
          <img 
            src="/assets/logos/srqms-mark.svg" 
            alt="SRQMS Project Mark" 
            className="w-12 h-12 shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <div className="text-xs font-semibold text-[#7B2638] tracking-wider uppercase">
              {language === 'ta' ? 'பொது விநியோகத் திட்டம் • தமிழ்நாடு' : 'Public Distribution System • Tamil Nadu'}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#222222] tracking-tight leading-tight">
              {language === 'ta' 
                ? 'ஸ்மார்ட் ரேஷன் வரிசை மேலாண்மை முறைமை' 
                : 'Smart Ration Queue Management System (SRQMS)'}
            </h1>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'நியாயவிலைக் கடை நிகழ்நேர வரிசை மற்றும் இருப்பு சரிபார்ப்பு (மாதிரி முன்மாதிரி)'
                : 'Fair Price Shop Real-Time Queue & Inventory Verification (Validation Prototype)'}
            </p>
          </div>
        </Link>

        {/* Prototype Validation Status Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-white border border-[#D6D9DC] px-3.5 py-2 rounded shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#1F6B45] animate-pulse"></div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'மாதிரி இயக்கம் செயலில் உள்ளது' : 'Prototype Active (Demo Mode)'}
            </div>
            <div className="text-[11px] text-[#555555]">
              {language === 'ta' ? 'சேவை நேரம்: காலை 9:00 - மாலை 5:00' : 'FPS Standard Hours: 09:00 - 17:00'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
