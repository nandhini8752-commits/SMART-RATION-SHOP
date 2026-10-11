import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, ArrowLeft, Plus, CheckCircle2, RefreshCw, X, FileText, Calendar, Tag } from 'lucide-react';

interface NoticeItem {
  id: string;
  titleI18n: { en: string; ta?: string };
  bodyI18n: { en: string; ta?: string };
  category: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

const FALLBACK_NOTICES: NoticeItem[] = [
  {
    id: '1',
    titleI18n: {
      en: 'Regular Fair Price Shop Distribution Timings',
      ta: 'நியாயவிலைக் கடை வழக்கமான விநியோக நேரங்கள்'
    },
    bodyI18n: {
      en: 'Morning session: 08:30 AM to 12:30 PM. Afternoon session: 03:00 PM to 07:00 PM. First Friday of every month is a maintenance holiday.',
      ta: 'காலை நேரம்: 08:30 முதல் 12:30 வரை. மாலை நேரம்: 03:00 முதல் 07:00 வரை. ஒவ்வொரு மாதத்தின் முதல் வெள்ளிக்கிழமை பராமரிப்பு விடுமுறை.'
    },
    category: 'TIMINGS',
    status: 'PUBLISHED',
    createdAt: '2026-10-01T08:30:00Z'
  },
  {
    id: '2',
    titleI18n: {
      en: 'Fortified Rice Quality & Nutritional Guidelines',
      ta: 'செறிவூட்டப்பட்ட அரிசி தரம் மற்றும் ஊட்டச்சத்து வழிகாட்டுதல்கள்'
    },
    bodyI18n: {
      en: 'Food Corporation of India fortified rice grains are enriched with Iron, Folic Acid, and Vitamin B12. Beneficiaries are advised not to wash grains excessively.',
      ta: 'இந்திய உணவுக் கழகத்தால் வழங்கப்படும் செறிவூட்டப்பட்ட அரிசியில் இரும்புச்சத்து, போலிக் அமிலம் மற்றும் வைட்டமின் பி12 சேர்க்கப்பட்டுள்ளது.'
    },
    category: 'QUALITY',
    status: 'PUBLISHED',
    createdAt: '2026-10-05T09:00:00Z'
  }
];

export const AdminNoticesPage: React.FC = () => {
  const { language } = useLanguage();
  const [notices, setNotices] = useState<NoticeItem[]>(FALLBACK_NOTICES);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [titleEn, setTitleEn] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyTa, setBodyTa] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [status, setStatus] = useState('PUBLISHED');

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/notices', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.notices && data.notices.length > 0) {
          setNotices(data.notices);
        }
      }
    } catch (err) {
      console.warn('Notices fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/notices', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          titleI18n: { en: titleEn.trim(), ta: titleTa.trim() || titleEn.trim() },
          bodyI18n: { en: bodyEn.trim(), ta: bodyTa.trim() || bodyEn.trim() },
          category,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to create notice');
      }

      await fetchNotices();
      setShowAddModal(false);
      setTitleEn('');
      setTitleTa('');
      setBodyEn('');
      setBodyTa('');
    } catch (err: any) {
      setFormError(err.message || 'Error creating notice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'நிர்வாக பலகைக்கு திரும்புக' : 'Back to Admin Console'}</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D9DC] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#222222]">
            {language === 'ta' ? 'அரசு அறிவிப்புகள் மேலாண்மை' : 'Department Notices & Announcements'}
          </h2>
          <p className="text-xs text-[#555555] mt-1">
            {language === 'ta' ? 'தமிழ் மற்றும் ஆங்கிலத்தில் பொது அறிவிப்புகளை வெளியிடுதல் மற்றும் அட்டவணைப்படுத்துதல்.' : 'Publish, schedule, and archive public circulars across English and Tamil.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchNotices}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-white border border-[#D6D9DC] text-[#222222] hover:bg-[#FAF8F4] text-xs font-semibold px-3 py-2 rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
            <span>{language === 'ta' ? 'புதுப்பி' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-3.5 py-2 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'புதிய அறிவிப்பு வெளியிட' : 'Publish New Notice'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg p-5 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-[#222222]">
            {language === 'ta' ? 'செயலில் உள்ள பொது சுற்றறிக்கைகள்' : 'Active Department Circulars'} ({notices.length})
          </div>
          <span className="text-[11px] text-[#555555]">
            Citizen portal view: <Link to="/notices" className="text-[#7B2638] underline font-semibold">/notices</Link>
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {notices.map((n) => {
            const title = (language === 'ta' && n.titleI18n.ta) ? n.titleI18n.ta : n.titleI18n.en;
            const body = (language === 'ta' && n.bodyI18n.ta) ? n.bodyI18n.ta : n.bodyI18n.en;

            return (
              <div 
                key={n.id} 
                className="p-4 rounded-md border border-[#D6D9DC] hover:border-[#7B2638] bg-[#FAF8F4]/40 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#EBE8E1] text-[#333333]">
                      {n.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      n.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {n.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-[#222222]">
                  {title}
                </h4>
                <p className="text-xs text-[#444444] leading-relaxed">
                  {body}
                </p>

                {language === 'en' && n.titleI18n.ta && (
                  <div className="pt-2 border-t border-[#EBE8E1] text-[11px] text-[#666666]">
                    <span className="font-semibold text-[#7B2638]">தமிழ் பதிப்பு: </span>
                    <span>{n.titleI18n.ta}</span>
                  </div>
                )}
                {language === 'ta' && n.titleI18n.en && (
                  <div className="pt-2 border-t border-[#EBE8E1] text-[11px] text-[#666666]">
                    <span className="font-semibold text-[#7B2638]">English Title: </span>
                    <span>{n.titleI18n.en}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#D6D9DC] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6D9DC] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#7B2638]" />
                <h3 className="font-bold text-base text-[#222222]">
                  {language === 'ta' ? 'புதிய சுற்றறிக்கை வெளியிடு' : 'Publish Official Circular'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#555555] hover:text-[#222222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded bg-white focus:outline-hidden focus:border-[#7B2638]"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="TIMINGS">TIMINGS</option>
                    <option value="QUALITY">QUALITY</option>
                    <option value="ALLOCATION">ALLOCATION</option>
                    <option value="SPECIAL">SPECIAL</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded bg-white focus:outline-hidden focus:border-[#7B2638]"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">
                  Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revised Shop Timings for Deepavali Season"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">
                  Title (தமிழ் / Tamil)
                </label>
                <input
                  type="text"
                  placeholder="உதா: தீபாவளி பண்டிகையை முன்னிட்டு மாற்றியமைக்கப்பட்ட கடை நேரங்கள்"
                  value={titleTa}
                  onChange={(e) => setTitleTa(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">
                  Body Content (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide comprehensive details for beneficiaries..."
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">
                  Body Content (தமிழ் / Tamil)
                </label>
                <textarea
                  rows={3}
                  placeholder="பயனாளிகளுக்கான விரிவான விநியோக வழிமுறைகள்..."
                  value={bodyTa}
                  onChange={(e) => setBodyTa(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              <div className="pt-3 border-t border-[#D6D9DC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D6D9DC] text-[#555555] rounded hover:bg-[#FAF8F4]"
                >
                  {language === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#7B2638] text-white font-bold rounded hover:bg-[#591A28] disabled:opacity-50"
                >
                  {submitting ? (language === 'ta' ? 'வெளியிடுகிறது...' : 'Publishing...') : (language === 'ta' ? 'அறிவிப்பை வெளியிடு' : 'Publish Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
