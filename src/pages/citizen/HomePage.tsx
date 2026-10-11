import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Store, 
  CreditCard, 
  Ticket, 
  FileText, 
  MessageSquareWarning, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  ExternalLink,
  AlertCircle,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language } = useLanguage();

  const serviceTiles = [
    {
      to: '/shops',
      titleEn: 'Find Fair Price Shop',
      titleTa: 'நியாயவிலைக் கடை தேடுதல்',
      descEn: 'Locate your assigned ration shop, view daily timings, queue volume, and demonstration stock availability.',
      descTa: 'உங்கள் நியாயவிலைக் கடையைக் கண்டறியவும், செயல்படும் நேரம், வரிசை எண்ணிக்கை மற்றும் இருப்பு விவரங்களைப் பார்க்கவும்.',
      icon: Store,
      badgeEn: 'Directory',
      badgeTa: 'வழிகாட்டி'
    },
    {
      to: '/card/verify',
      titleEn: 'Ration Card Verification',
      titleTa: 'குடும்ப அட்டை சரிபார்ப்பு',
      descEn: 'Check sample card entitlements (PHH, AAY, NPHH) against configured government distribution policy.',
      descTa: 'மாதிரி குடும்ப அட்டை உரிமங்கள் மற்றும் அரசு கொள்கை அளவீடுகளை சரிபார்க்கவும்.',
      icon: CreditCard,
      badgeEn: 'Entitlements',
      badgeTa: 'உரிமங்கள்'
    },
    {
      to: '/queue/create',
      titleEn: 'Smart Queue Token',
      titleTa: 'ஸ்மார்ட் வரிசை டோக்கன்',
      descEn: 'Obtain a real-time FIFO queue token, check live serving counters, and monitor estimated waiting times.',
      descTa: 'நிகழ்நேர வரிசை டோக்கன் பெறவும், சேவை கவுண்டர் மற்றும் காத்திருப்பு நேரத்தை அறியவும்.',
      icon: Ticket,
      badgeEn: 'Live FIFO',
      badgeTa: 'நிகழ்நேரம்'
    },
    {
      to: '/notices',
      titleEn: 'Department Notices',
      titleTa: 'அரசு அறிவிப்புகள்',
      descEn: 'Official circulars, festival allocation schedules, holiday calendar, and special distribution announcements.',
      descTa: 'பொது விநியோக அறிவிப்புகள், பண்டிகை சிறப்பு ஒதுக்கீடுகள் மற்றும் விடுமுறை விவரங்கள்.',
      icon: FileText,
      badgeEn: 'Circulars',
      badgeTa: 'அறிவிப்பு'
    },
    {
      to: '/complaints/new',
      titleEn: 'Grievance Redressal',
      titleTa: 'பொது மக்கள் குறைதீர்ப்பு',
      descEn: 'Submit public complaints regarding service or commodity quality and track resolution status.',
      descTa: 'நியாயவிலைக் கடை சேவைகள் அல்லது பொருட்கள் தொடர்பான புகார்களை பதிவு செய்து கண்காணிக்கவும்.',
      icon: MessageSquareWarning,
      badgeEn: 'Redressal',
      badgeTa: 'குறைதீர்ப்பு'
    },
    {
      to: '/help',
      titleEn: 'Help & AI Assistant',
      titleTa: 'உதவி மையம் & AI வழிகாட்டி',
      descEn: 'Frequently asked questions, official helpline directory, and smart multilingual virtual assistant.',
      descTa: 'அடிக்கடி கேட்கப்படும் கேள்விகள், உதவி எண்கள் மற்றும் பன்மொழி AI வழிகாட்டி.',
      icon: HelpCircle,
      badgeEn: 'Support',
      badgeTa: 'உதவி'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Formal Department Hero Banner */}
      <section className="bg-gradient-to-r from-[#7B2638] to-[#591A28] text-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#591A28]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#C49A3A]/20 border border-[#C49A3A]/40 text-[#E1BD67] px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'தமிழ்நாடு அரசு • பொது விநியோகத் திட்டம்' : 'Government of Tamil Nadu • PDS'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
            {language === 'ta'
              ? 'அனைவருக்கும் உணவுப் பாதுகாப்பு — வெளிப்படையான, நெரிசலற்ற நியாயவிலைக் கடை சேவைகள்'
              : 'Food Security for All — Transparent, Queue-Managed Fair Price Shop Services'}
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            {language === 'ta'
              ? 'ஸ்மார்ட் ரேஷன் வரிசை மேலாண்மை அமைப்பு (SRQMS) மூலம் உங்கள் நியாயவிலைக் கடையின் தற்போதைய வரிசை நிலவரம், டோக்கன் பெறுதல், இருப்பு விவரங்கள் மற்றும் உரிமங்களை எளிதாக அறியலாம்.'
              : 'SRQMS enables citizens to verify ration card entitlements, obtain real-time queue tokens with approximate wait estimates, and check commodity stock before visiting Fair Price Shops.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/queue/create"
              className="inline-flex items-center gap-2 bg-[#C49A3A] hover:bg-[#E1BD67] text-[#222222] font-bold px-4 py-2.5 rounded text-sm transition-colors shadow-xs"
            >
              <Ticket className="w-4 h-4" />
              <span>{language === 'ta' ? 'வரிசை டோக்கன் பெறுக' : 'Generate Queue Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shops"
              className="inline-flex items-center gap-2 bg-black/25 hover:bg-black/40 text-white font-semibold px-4 py-2.5 rounded text-sm border border-white/30 transition-colors"
            >
              <Store className="w-4 h-4 text-[#E1BD67]" />
              <span>{language === 'ta' ? 'கடைகளைக் கண்டறிக' : 'Find Your Shop'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Primary Public Service Tiles Grid */}
      <section aria-labelledby="services-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D6D9DC] pb-2">
          <h3 id="services-heading" className="text-lg font-bold text-[#222222] flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#7B2638] rounded-xs"></span>
            <span>{language === 'ta' ? 'பொது மக்கள் சேவைகள்' : 'Public Distribution Services'}</span>
          </h3>
          <span className="text-xs text-[#555555]">
            {language === 'ta' ? '6 முக்கிய சேவைகள்' : '6 Core Services'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {serviceTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className="group bg-white rounded-lg border border-[#D6D9DC] p-5 hover:border-[#7B2638] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded bg-[#F6F3EA] text-[#7B2638] flex items-center justify-center group-hover:bg-[#7B2638] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
                      {language === 'ta' ? tile.badgeTa : tile.badgeEn}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#222222] group-hover:text-[#7B2638] transition-colors">
                      {language === 'ta' ? tile.titleTa : tile.titleEn}
                    </h4>
                    <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">
                      {language === 'ta' ? tile.descTa : tile.descEn}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-semibold text-[#7B2638] group-hover:text-[#591A28]">
                  <span>{language === 'ta' ? 'சேவைக்கு செல்க' : 'Access Service'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Informational Panels: Timings & Official Guidelines */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operating Timings Card */}
        <div className="bg-[#FAF8F4] border border-[#E5E0D5] rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#7B2638] font-bold text-sm border-b border-[#E5E0D5] pb-2">
            <Clock className="w-4 h-4" />
            <span>{language === 'ta' ? 'நியாயவிலைக் கடை பணி நேரம்' : 'Shop Operating Hours'}</span>
          </div>
          <ul className="space-y-2 text-xs text-[#444444]">
            <li className="flex justify-between border-b border-[#F0ECE1] pb-1">
              <span className="font-medium">{language === 'ta' ? 'திங்கள் - வெள்ளி' : 'Monday - Friday'}</span>
              <span className="font-bold text-[#222222]">09:00 - 13:00, 14:00 - 17:00</span>
            </li>
            <li className="flex justify-between border-b border-[#F0ECE1] pb-1">
              <span className="font-medium">{language === 'ta' ? 'சனிக்கிழமை' : 'Saturday'}</span>
              <span className="font-bold text-[#222222]">09:00 - 13:00</span>
            </li>
            <li className="flex justify-between text-[#8A5300] font-semibold">
              <span>{language === 'ta' ? 'ஞாயிற்றுக்கிழமை' : 'Sunday'}</span>
              <span>{language === 'ta' ? 'வார விடுமுறை' : 'Weekly Holiday'}</span>
            </li>
          </ul>
          <p className="text-[11px] text-[#666666] pt-1">
            {language === 'ta'
              ? 'குறிப்பு: மாதத்தின் முதல் வெள்ளிக்கிழமை கடை கணக்கு சரிபார்ப்பு தினமாக அனுசரிக்கப்படலாம்.'
              : 'Note: Stock audit may take place on the first Friday of each calendar month.'}
          </p>
        </div>

        {/* Demo Cards Guide Card */}
        <div className="bg-[#FAF8F4] border border-[#E5E0D5] rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#7B2638] font-bold text-sm border-b border-[#E5E0D5] pb-2">
            <CreditCard className="w-4 h-4" />
            <span>{language === 'ta' ? 'மாதிரி குடும்ப அட்டை எண்கள்' : 'Synthetic Demo Cards'}</span>
          </div>
          <p className="text-xs text-[#555555]">
            {language === 'ta'
              ? 'இந்த மாதிரி அமைப்பில் பின்வரும் மாதிரி அட்டை எண்களைப் பயன்படுத்தி சோதனை செய்யலாம்:'
              : 'Use these pre-seeded synthetic cards to test token creation and entitlement verification:'}
          </p>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="bg-white px-2.5 py-1 rounded border border-[#D6D9DC] flex justify-between items-center">
              <span className="font-bold text-[#7B2638]">DEMO-TN-0001</span>
              <span className="text-[10px] font-sans bg-[#F6F3EA] px-1.5 py-0.5 rounded text-[#555555]">PHH (Priority)</span>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-[#D6D9DC] flex justify-between items-center">
              <span className="font-bold text-[#7B2638]">DEMO-TN-0002</span>
              <span className="text-[10px] font-sans bg-[#F6F3EA] px-1.5 py-0.5 rounded text-[#555555]">AAY (Antyodaya)</span>
            </div>
            <div className="bg-white px-2.5 py-1 rounded border border-[#D6D9DC] flex justify-between items-center">
              <span className="font-bold text-[#7B2638]">DEMO-TN-0003</span>
              <span className="text-[10px] font-sans bg-[#F6F3EA] px-1.5 py-0.5 rounded text-[#555555]">NPHH (Sugar)</span>
            </div>
          </div>
        </div>

        {/* Official Grievance Contacts */}
        <div className="bg-[#FAF8F4] border border-[#E5E0D5] rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#7B2638] font-bold text-sm border-b border-[#E5E0D5] pb-2">
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'ta' ? 'உதவி மைய எண்கள்' : 'Public Assistance'}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-white p-2.5 rounded border border-[#D6D9DC]">
              <div className="text-[11px] text-[#555555]">{language === 'ta' ? 'கட்டணமில்லா சேவை எண்:' : 'Toll-Free Helpline:'}</div>
              <div className="text-base font-bold text-[#7B2638]">1967 / 1800-425-5901</div>
              <div className="text-[10px] text-[#666666]">{language === 'ta' ? 'காலை 8:00 - இரவு 8:00 (அனைத்து நாட்களும்)' : '08:00 AM - 08:00 PM (Daily)'}</div>
            </div>
            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-[#555555]">{language === 'ta' ? 'அதிகாரப்பூர்வ தளம்:' : 'Official PDS Portal:'}</span>
              <a 
                href="https://www.tnpds.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#7B2638] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>tnpds.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
