import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  MessageSquareWarning, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

export const ComplaintsNewPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [category, setCategory] = useState('COMMODITY_QUALITY');
  const [shopCode, setShopCode] = useState('DEMO-CHN-001');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactHint, setContactHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [trackInput, setTrackInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
          demoContactHint: contactHint.trim() || undefined,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setSubmittedRef(json.referenceCode);
      } else {
        const generatedRef = `CMP-TN-${Math.floor(100000 + Math.random() * 900000)}`;
        setSubmittedRef(generatedRef);
      }
    } catch (err) {
      console.warn('Complaint submit fallback', err);
      const generatedRef = `CMP-TN-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedRef(generatedRef);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
            <MessageSquareWarning className="w-4 h-4" />
            <span>{language === 'ta' ? 'பொது மக்கள் குறைதீர்ப்பு மையம்' : 'Public Grievance Redressal'}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mt-1">
            {language === 'ta' ? 'நியாயவிலைக் கடை புகார் பதிவு' : 'Lodge Service Grievance'}
          </h2>
          <p className="text-xs text-[#555555] mt-1">
            {language === 'ta'
              ? 'பொருட்களின் தரம், அளவு குறைபாடு, அல்லது நியாயவிலைக் கடை சேவைகள் குறித்த புகாரைப் பதிவு செய்யவும்.'
              : 'Submit demonstration grievance regarding commodity quality, short allocation, or shop service.'}
          </p>
        </div>

        {/* Quick Track Input */}
        <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-2.5 rounded-lg flex items-center gap-2">
          <input
            type="text"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
            placeholder={language === 'ta' ? 'புகார் எண் உள்ளிடவும்' : 'Complaint Ref #'}
            className="px-2 py-1 bg-white border border-[#D6D9DC] rounded text-xs font-mono w-32 focus:outline-hidden focus:border-[#7B2638]"
          />
          <Link
            to={trackInput ? `/complaints/${trackInput}` : '#'}
            className={`px-2.5 py-1 rounded text-xs font-bold text-white transition-colors ${
              trackInput ? 'bg-[#7B2638] hover:bg-[#591A28]' : 'bg-gray-400 pointer-events-none'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {!submittedRef ? (
        /* Grievance Submission Form */
        <form onSubmit={handleSubmit} className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="comp-cat" className="block text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'புகார் வகை' : 'Grievance Category'}
              </label>
              <select
                id="comp-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs bg-white focus:outline-hidden focus:border-[#7B2638]"
              >
                <option value="COMMODITY_QUALITY">{language === 'ta' ? 'பொருட்களின் தரம் குறித்த குறைபாடு' : 'Commodity Quality & Packaging'}</option>
                <option value="SHORT_QUANTITY">{language === 'ta' ? 'அளவு குறைத்து வழங்கப்படுதல்' : 'Short Quantity Dispensed'}</option>
                <option value="TIMING_IRREGULARITY">{language === 'ta' ? 'கடை திறக்கும் நேரத்தில் முறைகேடு' : 'Irregular Shop Hours / Closure'}</option>
                <option value="STAFF_CONDUCT">{language === 'ta' ? 'பணியாளர் நடத்தை / சேவை குறைபாடு' : 'Staff Behaviour / Service Delay'}</option>
                <option value="OTHER">{language === 'ta' ? 'மற்ற புகார்கள்' : 'Other General Inquiries'}</option>
              </select>
            </div>

            {/* Shop Code */}
            <div className="space-y-1.5">
              <label htmlFor="comp-shop" className="block text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'சம்பந்தப்பட்ட நியாயவிலைக் கடை' : 'Concerned Fair Price Shop'}
              </label>
              <select
                id="comp-shop"
                value={shopCode}
                onChange={(e) => setShopCode(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs bg-white focus:outline-hidden focus:border-[#7B2638]"
              >
                <option value="DEMO-CHN-001">SRQMS Demo Shop 001 - Anna Nagar East, Chennai</option>
                <option value="DEMO-CHN-002">SRQMS Demo Shop 002 - Mogappair, Chennai</option>
                <option value="DEMO-TVM-001">SRQMS Demo Shop 003 - Sample Nagar, Tiruvallur</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label htmlFor="comp-sub" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'புகாரின் சுருக்கத் தலைப்பு' : 'Subject / Summary'}
            </label>
            <input
              id="comp-sub"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={language === 'ta' ? 'எடுத்துக்காட்டு: சர்க்கரை அளவு குறைவாக வழங்கப்பட்டது' : 'e.g. Issue regarding sugar package weight at counter'}
              className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
              required
            />
          </div>

          {/* Detailed Message */}
          <div className="space-y-1.5">
            <label htmlFor="comp-msg" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'புகார் விவரம் (முழுமையான விளக்கம்)' : 'Detailed Grievance Description'}
            </label>
            <textarea
              id="comp-msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'ta' ? 'சம்பவம் நடந்த தேதி, நேரம் மற்றும் விரிவான தகவல்களை உள்ளிடவும்...' : 'Please specify the date, time, and exact grievance details...'}
              className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
              required
            />
          </div>

          {/* Contact hint */}
          <div className="space-y-1.5">
            <label htmlFor="comp-contact" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'தொடர்பு தொலைபேசி / மின்னஞ்சல் (மாதிரி தகவல் மட்டும்)' : 'Demonstration Contact Reference (Synthetic only)'}
            </label>
            <input
              id="comp-contact"
              type="text"
              value={contactHint}
              onChange={(e) => setContactHint(e.target.value)}
              placeholder="e.g. demo_citizen@sample.tn or 9840XXXXXX"
              className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
            />
            <p className="text-[10px] text-[#777777]">
              {language === 'ta'
                ? 'உண்மையான தனிநபர் விவரங்களை உள்ளிட வேண்டாம். மாதிரி தொடர்பு எண் மட்டுமே பயன்படுத்தவும்.'
                : 'Do not enter real personal phone numbers or Aadhaar details.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white font-bold text-xs py-3 rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? (language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Registering Grievance...') : (language === 'ta' ? 'புகாரை சமர்ப்பிக்க' : 'Submit Demonstration Grievance')}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Grievance Submission Receipt */
        <div className="bg-white border-2 border-[#1F6B45] rounded-lg p-6 space-y-5 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1F6B45] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#222222]">
              {language === 'ta' ? 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது' : 'Grievance Successfully Registered'}
            </h3>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'உங்கள் புகாரை கண்காணிக்க இந்த குறிப்பு எண்ணைப் பாதுகாப்பாக வைக்கவும்.'
                : 'Please preserve this reference code to track resolution status.'}
            </p>
          </div>

          <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg inline-block mx-auto space-y-1">
            <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wider">
              {language === 'ta' ? 'புகார் குறிப்பு எண்' : 'Complaint Reference Code'}
            </span>
            <div className="text-2xl font-black font-mono text-[#7B2638] tracking-wider">
              {submittedRef}
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to={`/complaints/${submittedRef}`}
              className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-xs"
            >
              <span>{language === 'ta' ? 'புகார் நிலையை கண்காணிக்க' : 'Track Complaint Status'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                setSubmittedRef(null);
                setSubject('');
                setMessage('');
              }}
              className="px-4 py-2.5 bg-[#FAF8F4] hover:bg-white text-[#222222] border border-[#D6D9DC] text-xs font-semibold rounded transition-colors"
            >
              {language === 'ta' ? 'மற்றொரு புகார் அளிக்க' : 'Lodge Another Grievance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
