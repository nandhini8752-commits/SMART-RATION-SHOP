import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Settings, 
  ArrowLeft, 
  Store, 
  Volume2, 
  Printer, 
  PhoneCall, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Sliders
} from 'lucide-react';

export const StaffSettingsPage: React.FC = () => {
  const { language } = useLanguage();

  const [staffUser] = useState(() => {
    try {
      const saved = localStorage.getItem('srqms_staff_user');
      return saved ? JSON.parse(saved) : {
        username: 'operator_anna',
        fullName: 'K. Rajavel (FPS Operator)',
        role: 'SHOP_OPERATOR',
        shopCode: 'DEMO-CHN-001',
        shopName: 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)',
        shopDistrict: 'Chennai'
      };
    } catch {
      return {
        username: 'operator_anna',
        fullName: 'K. Rajavel (FPS Operator)',
        role: 'SHOP_OPERATOR',
        shopCode: 'DEMO-CHN-001',
        shopName: 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)',
        shopDistrict: 'Chennai'
      };
    }
  });

  const [activeCounters, setActiveCounters] = useState(2);
  const [audioChimeEnabled, setAudioChimeEnabled] = useState(true);
  const [phoneDisplay, setPhoneDisplay] = useState('044-26210001');
  const [receiptFooterNote, setReceiptFooterNote] = useState(
    'Please bring your own clean cloth bag • பிளாஸ்டிக் பை தவிர்ப்போம்'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio test using Web Audio API
  const testChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };

      playTone(523.25, 0, 0.4);
      playTone(659.25, 0.25, 0.4);
      playTone(783.99, 0.5, 0.7);
    } catch (_) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('srqms_operator_settings', JSON.stringify({
      activeCounters,
      audioChimeEnabled,
      phoneDisplay,
      receiptFooterNote,
      updatedAt: new Date().toISOString()
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/staff/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'பணியாளர் முகப்பிற்கு திரும்புக' : 'Back to Staff Dashboard'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <Settings className="w-4 h-4" />
          <span>{language === 'ta' ? 'கடை அமைப்புகள்' : 'Operator Shop Settings'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'நியாயவிலைக் கடை செயல்பாட்டு அமைப்புகள்' : 'Shop Operations & Counter Configuration'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'உங்கள் கடைக்கான கவுண்டர் எண்ணிக்கை, ஒலி எச்சரிக்கைகள் மற்றும் ரசீது அமைப்புகளை உள்ளமைக்கவும்.'
            : 'Configure active dispensing counters, auditory alert preferences, and printable receipt parameters.'}
        </p>
      </div>

      {/* Security boundary alert */}
      <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-[#7B2638] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#222222]">
            {language === 'ta' ? 'கடை ஒதுக்கீட்டு வரம்பு (பாதுகாப்பு விதி AC-18)' : 'Assigned Shop Scope Boundary (Security Rule AC-18)'}
          </div>
          <p className="text-[#555555]">
            {language === 'ta'
              ? `நீங்கள் ${staffUser.shopName} (${staffUser.shopCode}) கடைக்கு மட்டுமே அமைப்புகளை மாற்ற முடியும். பிற கடைகளுக்கு மாற்ற முடியாது.`
              : `Your login is strictly bound to ${staffUser.shopName} (${staffUser.shopCode}). Cross-shop alterations are blocked by department governance rules.`}
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#1F6B45] p-4 rounded-lg flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'ta' ? 'கடை அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!' : 'Shop operational settings saved successfully!'}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-6">
        {/* Shop Info Readonly */}
        <div className="bg-[#FAF8F4] border border-[#EBE8E1] p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638]">
            <Store className="w-4 h-4" />
            <span>{language === 'ta' ? 'கடை தகவல் (மாற்ற முடியாது)' : 'Fair Price Shop Profile (Read-Only)'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-500">{language === 'ta' ? 'கடை எண்:' : 'FPS Code:'}</span>
              <div className="font-mono font-bold text-[#222222]">{staffUser.shopCode}</div>
            </div>
            <div>
              <span className="text-gray-500">{language === 'ta' ? 'பொறுப்பாளர் பெயர்:' : 'Operator Name:'}</span>
              <div className="font-bold text-[#222222]">{staffUser.fullName}</div>
            </div>
            <div>
              <span className="text-gray-500">{language === 'ta' ? 'மாவட்டம்:' : 'District:'}</span>
              <div className="font-bold text-[#222222]">{staffUser.shopDistrict || 'Chennai'}</div>
            </div>
          </div>
        </div>

        {/* Counter Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <Sliders className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'வரிசை கவுண்டர்கள் மேலாண்மை' : 'Active Counter Management'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="active-counters" className="block text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'இன்றைய செயல்பாட்டு கவுண்டர்கள்' : 'Active Counters Today'}
              </label>
              <select
                id="active-counters"
                value={activeCounters}
                onChange={(e) => setActiveCounters(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs bg-white focus:outline-hidden focus:border-[#7B2638]"
              >
                <option value={1}>1 Counter (Single Operator Mode)</option>
                <option value={2}>2 Counters (Standard Dual Service)</option>
                <option value={3}>3 Counters (Peak Days Fast Track)</option>
              </select>
              <p className="text-[11px] text-gray-500">
                {language === 'ta' ? 'காத்திருக்கும் டோக்கன்கள் இந்த கவுண்டர்களுக்கு பகிர்ந்தளிக்கப்படும்.' : 'Tokens will be dispatched across this number of counters.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone-display" className="block text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'கடை தொடர்பு எண்' : 'Public Display Phone'}
              </label>
              <input
                id="phone-display"
                type="text"
                value={phoneDisplay}
                onChange={(e) => setPhoneDisplay(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
                placeholder="044-26210001"
              />
              <p className="text-[11px] text-gray-500">
                {language === 'ta' ? 'பொதுமக்கள் கடை விவர பக்கத்தில் இந்த எண் தெரியும்.' : 'Displayed on the public shop directory for beneficiary inquiries.'}
              </p>
            </div>
          </div>
        </div>

        {/* Audio & Visual Alerts */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <Volume2 className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'அறிவிப்பு ஒலி அமைப்புகள்' : 'Audio Call Bell Preferences'}</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-[#FAF8F4] border border-[#E5E0D5] rounded-lg">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'டோக்கன் அழைக்கும் போது அரசு மணி ஒலி (Ding-Dong Chime)' : 'Electronic Chime upon Token Call'}
              </div>
              <div className="text-[11px] text-gray-500">
                {language === 'ta' ? 'கவுண்டர் ஊழியர் "அடுத்தவரை அழை" கிளிக் செய்யும்போது ஒலிக்கும்.' : 'Plays government electronic notification bell in waiting hall.'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={testChime}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-[11px] font-semibold text-gray-700 rounded transition-colors shadow-2xs"
              >
                {language === 'ta' ? 'ஒலி சோதனை' : 'Test Sound'}
              </button>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={audioChimeEnabled}
                  onChange={(e) => setAudioChimeEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1F6B45]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Receipt Slip Customization */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <Printer className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'ரசீது அச்சு அமைப்புகள்' : 'Printable Receipt Slip Notes'}</span>
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="receipt-note" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'ரசீது அடிக்குறிப்பு செய்தி' : 'Receipt Footer Custom Notice'}
            </label>
            <textarea
              id="receipt-note"
              rows={2}
              value={receiptFooterNote}
              onChange={(e) => setReceiptFooterNote(e.target.value)}
              className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
              placeholder="Notice printed at bottom of physical paper receipt slips..."
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#EBE8E1] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold rounded transition-colors shadow-xs"
          >
            {language === 'ta' ? 'அமைப்புகளை சேமிக்கவும்' : 'Save Shop Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
