import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Calendar, Tag, FileText, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface NoticeItem {
  id: string;
  titleEn: string;
  titleTa: string;
  bodyEn: string;
  bodyTa: string;
  category: string;
  date: string;
}

const DEMO_NOTICES: NoticeItem[] = [
  {
    id: 'not-01',
    titleEn: 'Monthly PDS Entitlement Distribution Timelines (October 2026)',
    titleTa: 'மாதாந்திர பொது விநியோகப் பொருட்கள் விநியோக கால அட்டவணை (அக்டோபர் 2026)',
    bodyEn: 'Beneficiaries are requested to visit Fair Price Shops strictly during working hours (08:30 - 12:30 and 15:00 - 19:00). Priority households (PHH) can collect free rice quota throughout the calendar month.',
    bodyTa: 'பயனாளிகள் நியாயவிலைக் கடை பணி நேரத்தில் (காலை 08:30 - 12:30 மற்றும் மாலை 15:00 - 19:00) வருகை தந்து தங்களின் மாதாந்திர பங்கீட்டுப் பொருட்களைப் பெற்றுக் கொள்ளுமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.',
    category: 'ALLOCATION',
    date: '2026-10-01'
  },
  {
    id: 'not-02',
    titleEn: 'Special Festival Palm Oil & Sugar Allocation Announcement',
    titleTa: 'பண்டிகை கால சிறப்பு பாமாயில் மற்றும் சர்க்கரை கூடுதல் ஒதுக்கீடு',
    bodyEn: 'Additional quota of 1 kg sugar and 1 litre palmolein oil is available for all eligible priority and non-priority smart card holders at government subsidized rates.',
    bodyTa: 'அனைத்து தகுதிவாய்ந்த குடும்ப அட்டைதாரர்களுக்கும் சிறப்பு சலுகையாக கூடுதல் சர்க்கரை மற்றும் பாமாயில் மானிய விலையில் வழங்கப்படுகிறது.',
    category: 'SPECIAL',
    date: '2026-10-05'
  },
  {
    id: 'not-03',
    titleEn: 'Notice on First Friday Monthly Stock Audit Closure',
    titleTa: 'மாதத்தின் முதல் வெள்ளிக்கிழமை கடை கணக்கு சரிபார்ப்பு தின அறிவிப்பு',
    bodyEn: 'Fair Price Shops observe internal stock verification on the first Friday of each month. Afternoon counter operations will resume at 14:30.',
    bodyTa: 'மாதத்தின் முதல் வெள்ளிக்கிழமை நியாயவிலைக் கடைகளில் இருப்பு சரிபார்ப்பு பணி நடைபெறும். பிற்பகல் கவுண்டர் சேவைகள் 14:30 மணிக்கு துவங்கும்.',
    category: 'HOLIDAY',
    date: '2026-10-08'
  }
];

export const NoticesPage: React.FC = () => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<string>('ALL');
  const [notices, setNotices] = useState<NoticeItem[]>(DEMO_NOTICES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/public/notices');
        if (res.ok) {
          const data = await res.json();
          if (data.notices && data.notices.length > 0) {
            const mapped: NoticeItem[] = data.notices.map((n: any) => ({
              id: n.id,
              titleEn: n.titleI18n?.en || n.titleEn || 'Department Circular',
              titleTa: n.titleI18n?.ta || n.titleTa || n.titleI18n?.en || '',
              bodyEn: n.bodyI18n?.en || n.bodyEn || '',
              bodyTa: n.bodyI18n?.ta || n.bodyTa || n.bodyI18n?.en || '',
              category: n.category || 'GENERAL',
              date: n.createdAt ? n.createdAt.split('T')[0] : '2026-10-01'
            }));
            setNotices(mapped);
          }
        }
      } catch (err) {
        console.warn('Error fetching public notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(
    (n) => filter === 'ALL' || n.category === filter
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <Bell className="w-4 h-4" />
          <span>{language === 'ta' ? 'அரசு அறிவிப்புகள்' : 'Department Circulars'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'பொது விநியோகத் திட்ட அறிவிப்புகள்' : 'Public Distribution System Notices'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'அரசு சுற்றறிக்கைகள், மாதாந்திர ஒதுக்கீடுகள் மற்றும் விடுமுறை தொடர்பான அறிவிப்புகள்.'
            : 'Official department circulars, festive allocations, and operational announcements.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'ALLOCATION', 'SPECIAL', 'HOLIDAY', 'TIMINGS', 'QUALITY', 'GENERAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              filter === cat
                ? 'bg-[#7B2638] text-white shadow-xs'
                : 'bg-[#FAF8F4] text-[#555555] hover:bg-white border border-[#D6D9DC]'
            }`}
          >
            {cat === 'ALL' ? (language === 'ta' ? 'அனைத்தும்' : 'All Notices') : cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white border border-[#D6D9DC] rounded-lg p-5 space-y-3 hover:border-[#7B2638] transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBE8E1] pb-2.5">
              <span className="text-[11px] font-bold text-[#7B2638] bg-[#F6F3EA] px-2.5 py-0.5 rounded border border-[#EBE8E1]">
                {notice.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#666666] font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#7B2638]" />
                <span>{notice.date}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#222222]">
                {language === 'ta' && notice.titleTa ? notice.titleTa : notice.titleEn}
              </h3>
              <p className="text-xs text-[#444444] mt-2 leading-relaxed">
                {language === 'ta' && notice.bodyTa ? notice.bodyTa : notice.bodyEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
