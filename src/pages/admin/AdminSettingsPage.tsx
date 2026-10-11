import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Settings, 
  ArrowLeft, 
  ShieldAlert, 
  Globe, 
  Clock, 
  BellRing, 
  PhoneCall, 
  Database, 
  CheckCircle2, 
  Save,
  Lock
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { language } = useLanguage();

  const [demoMode, setDemoMode] = useState(true);
  const [defaultLocale, setDefaultLocale] = useState('ta');
  const [queuePollingSeconds, setQueuePollingSeconds] = useState(4);
  const [serviceMinutesPerToken, setServiceMinutesPerToken] = useState(3.5);
  const [telegramStatus] = useState('SIMULATED_DEMO_ADAPTER');
  const [smsGateway] = useState('NIC_TAMILNADU_SMS_SIMULATION');
  const [tollFreeHelpline, setTollFreeHelpline] = useState('1967');
  const [stateHelpline, setStateHelpline] = useState('1800-425-5901');
  const [auditRetentionDays, setAuditRetentionDays] = useState(180);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('srqms_system_settings', JSON.stringify({
      demoMode,
      defaultLocale,
      queuePollingSeconds,
      serviceMinutesPerToken,
      tollFreeHelpline,
      stateHelpline,
      auditRetentionDays,
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
          to="/admin/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'நிர்வாக முகப்பிற்கு திரும்புக' : 'Back to Admin Dashboard'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <Settings className="w-4 h-4" />
          <span>{language === 'ta' ? 'துறை அமைப்புகள் & நெறிமுறைகள்' : 'System Governance & Parameters'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'பொது விநியோகத் திட்ட கணினி அமைப்புகள்' : 'SRQMS Portal Governance Settings'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'மெய்நிகர் மாதிரி முறை, மொழி விருப்பங்கள், வரிசை புதுப்பிப்பு கால அளவு மற்றும் அறிவிப்பு அமைப்புகள்.'
            : 'Configure prototype boundaries, default localization, polling frequencies, and notification channel parameters.'}
        </p>
      </div>

      {/* Demo Guard Banner */}
      <div className="bg-[#FAF8F4] border-2 border-[#C49A3A] p-4 rounded-lg flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-[#7B2638] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#7B2638] uppercase tracking-wider">
            {language === 'ta' ? 'செயல்முறை மாதிரி பாதுகாப்பு நிலை (DEMO MODE)' : 'Demonstration Safeguard Active'}
          </div>
          <p className="text-[#555555] leading-relaxed">
            {language === 'ta'
              ? 'இந்த தளம் மாதிரி குடும்ப அட்டைகளுக்காக மட்டுமே உருவாக்கப்பட்டுள்ளது. உண்மையான ஆதார் எண்கள் அல்லது தனிநபர் அடையாளங்கள் எங்கும் சேமிக்கப்படாது (பாதுகாப்பு விதி AC-28).'
              : 'This portal operates exclusively on synthetic demonstration records. Real Aadhaar numbers and live citizen identities are strictly prohibited from entry or persistence (Rule AC-28).'}
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#1F6B45] p-4 rounded-lg flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'ta' ? 'நிர்வாக அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!' : 'Governance configuration updated and logged!'}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-6">
        {/* Localization & Language */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <Globe className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'மொழி & வட்டார அமைப்புகள்' : 'Localization & Default Locale'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="default-locale" className="block font-bold text-[#222222]">
                {language === 'ta' ? 'முதன்மையான போர்டல் மொழி' : 'Default Public Portal Language'}
              </label>
              <select
                id="default-locale"
                value={defaultLocale}
                onChange={(e) => setDefaultLocale(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded bg-white"
              >
                <option value="ta">தமிழ் (Tamil - Official State Language)</option>
                <option value="en">English (Official Secondary)</option>
                <option value="te">తెలుగు (Telugu - Linguistic Minority)</option>
                <option value="hi">हिन्दी (Hindi - National PDS)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-[#222222]">
                {language === 'ta' ? 'ஆதரிக்கப்படும் மொழிகள்' : 'Active Multilingual Engines'}
              </label>
              <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded text-gray-700 font-mono">
                Tamil (ta), English (en), Telugu (te), Hindi (hi)
              </div>
            </div>
          </div>
        </div>

        {/* Queue Polling & Estimation Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <Clock className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'வரிசை நேர இடைவெளி & மதிப்பீடு' : 'Queue Synchronization & Wait Estimation'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="poll-interval" className="block font-bold text-[#222222]">
                {language === 'ta' ? 'நிகழ்நேர புதுப்பிப்பு இடைவெளி (விநாடிகள்)' : 'Live Polling Frequency (seconds)'}
              </label>
              <input
                id="poll-interval"
                type="number"
                min="2"
                max="30"
                value={queuePollingSeconds}
                onChange={(e) => setQueuePollingSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded font-mono"
              />
              <p className="text-[11px] text-gray-500">
                {language === 'ta' ? 'குடிமக்கள் மற்றும் டிவி திரைகளுக்கான நிகழ்நேர புதுப்பிப்பு.' : 'Rapid polling cadence for citizen token monitors and waiting hall TV screens.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="service-minutes" className="block font-bold text-[#222222]">
                {language === 'ta' ? 'ஒரு டோக்கனுக்கான சராசரி விநியோக நேரம் (நிமிடங்கள்)' : 'Average Service Time Per Token (minutes)'}
              </label>
              <input
                id="service-minutes"
                type="number"
                step="0.5"
                min="1"
                max="15"
                value={serviceMinutesPerToken}
                onChange={(e) => setServiceMinutesPerToken(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded font-mono"
              />
              <p className="text-[11px] text-gray-500">
                {language === 'ta' ? 'காத்திருப்பு நேரத்தை கணக்கிடப் பயன்படும் காரணி.' : 'Factor used to estimate remaining wait for beneficiaries in queue.'}
              </p>
            </div>
          </div>
        </div>

        {/* Notification Providers Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <BellRing className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'அறிவிப்பு வழங்கல் இணைப்புகள்' : 'Multi-Channel Notification Adapters'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#FAF8F4] border border-[#EBE8E1] p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#222222]">Telegram Dispatcher Bot</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {telegramStatus}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Target Bot: <span className="font-mono text-[#7B2638]">@tn_srqms_bot</span> (secrets hidden)
              </p>
            </div>

            <div className="bg-[#FAF8F4] border border-[#EBE8E1] p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#222222]">SMS Gateway</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {smsGateway}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Masked PII Destination Format: <span className="font-mono">XXXXXX3210</span>
              </p>
            </div>
          </div>
        </div>

        {/* Helplines and Audit Retention */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2 border-b border-[#EBE8E1] pb-2">
            <PhoneCall className="w-4 h-4 text-[#7B2638]" />
            <span>{language === 'ta' ? 'உதவி எண்கள் & தணிக்கைப் பதிவு' : 'Helplines & Audit Retention Policy'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="toll-free" className="block font-bold text-[#222222]">
                Toll-Free Helpline
              </label>
              <input
                id="toll-free"
                type="text"
                value={tollFreeHelpline}
                onChange={(e) => setTollFreeHelpline(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="state-line" className="block font-bold text-[#222222]">
                State Consumer Line
              </label>
              <input
                id="state-line"
                type="text"
                value={stateHelpline}
                onChange={(e) => setStateHelpline(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="retention" className="block font-bold text-[#222222]">
                Audit Retention (Days)
              </label>
              <input
                id="retention"
                type="number"
                value={auditRetentionDays}
                onChange={(e) => setAuditRetentionDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-3 border-t border-[#EBE8E1] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold rounded transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'அமைப்புகளைப் புதுப்பிக்கவும்' : 'Save Governance Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
