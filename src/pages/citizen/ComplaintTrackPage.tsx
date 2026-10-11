import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquareWarning, ArrowLeft, Clock, CheckCircle2, ShieldCheck, AlertCircle, Printer } from 'lucide-react';

export const ComplaintTrackPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<{
    referenceCode: string;
    category: string;
    subject: string;
    shopCode: string;
    status: 'RECEIVED' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    responseNote?: string;
  } | null>({
    referenceCode: reference || 'CMP-TN-102934',
    category: 'COMMODITY_QUALITY',
    subject: 'Sample Commodity Quality Inquiry (Demonstration)',
    shopCode: 'DEMO-CHN-001',
    status: 'IN_REVIEW',
    createdAt: new Date().toISOString().split('T')[0],
    responseNote: 'Demonstration grievance acknowledged by area inspection supervisor. Shop inspection scheduled.'
  });

  useEffect(() => {
    if (!reference) return;
    let active = true;
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/complaints/${reference}`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.referenceCode) {
            setComplaint({
              referenceCode: json.referenceCode,
              category: json.category,
              subject: json.subject,
              shopCode: json.shopCode || 'DEMO-CHN-001',
              status: json.status,
              createdAt: json.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              responseNote: json.responseNote || 'Demonstration grievance acknowledged and logged.',
            });
          }
        }
      } catch (err) {
        console.warn('Complaint track fetch error', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchComplaint();
    return () => { active = false; };
  }, [reference]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/complaints/new" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'குறைதீர்ப்பு பதிவுக்கு திரும்புக' : 'Back to Grievance Center'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <MessageSquareWarning className="w-4 h-4" />
          <span>{language === 'ta' ? 'புகார் நிலை கண்காணிப்பு' : 'Complaint Status Tracking'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'புகாரின் தற்போதைய நிலை' : 'Grievance Resolution Status'}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-[#555555]">{language === 'ta' ? 'குறிப்பு எண்:' : 'Reference Code:'}</span>
          <span className="font-mono font-bold text-sm text-[#7B2638] bg-[#F6F3EA] px-2.5 py-0.5 rounded border border-[#EBE8E1]">
            {reference}
          </span>
        </div>
      </div>

      {/* Details Card */}
      {complaint && (
        <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7B2638]" />
              <span className="text-xs text-[#555555]">
                {language === 'ta' ? 'பதிவு செய்யப்பட்ட தேதி:' : 'Submission Date:'} <strong className="text-[#222222] font-mono">{complaint.createdAt}</strong>
              </span>
            </div>

            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border ${
              complaint.status === 'IN_REVIEW'
                ? 'bg-amber-50 text-[#8A5300] border-amber-200'
                : complaint.status === 'RESOLVED'
                ? 'bg-emerald-50 text-[#1F6B45] border-emerald-200'
                : 'bg-gray-100 text-[#555555] border-gray-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#8A5300] animate-pulse"></span>
              <span>{complaint.status}</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
                <span className="text-[#555555]">{language === 'ta' ? 'புகார் வகை:' : 'Category:'}</span>
                <div className="font-bold text-[#222222]">{complaint.category}</div>
              </div>
              <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
                <span className="text-[#555555]">{language === 'ta' ? 'சம்பந்தப்பட்ட கடை:' : 'Concerned FPS:'}</span>
                <div className="font-bold text-[#7B2638]">{complaint.shopCode}</div>
              </div>
            </div>

            <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
              <span className="text-[#555555]">{language === 'ta' ? 'புகாரின் தலைப்பு:' : 'Subject:'}</span>
              <div className="font-bold text-[#222222]">{complaint.subject}</div>
            </div>

            {complaint.responseNote && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-1 text-xs">
                <div className="font-bold text-[#1F6B45] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'ta' ? 'துறை அலுவலர் பதில் / நடவடிக்கை:' : 'Official Response / Action Taken:'}</span>
                </div>
                <p className="text-[#2b513c] leading-relaxed">
                  {complaint.responseNote}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-[#EBE8E1] flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-[#666666]">
              {language === 'ta'
                ? 'அதிகாரப்பூர்வ ஆவணத்திற்காக ரசீதை அச்சிட்டுக் கொள்ளலாம்.'
                : 'You may print this official acknowledgement for your records.'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white hover:bg-[#FAF8F4] text-[#7B2638] border border-[#7B2638] text-xs font-bold rounded transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Print official grievance acknowledgement"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'ரசீது அச்சிடுக' : 'Print Acknowledgement'}</span>
              </button>

              <Link
                to="/complaints/new"
                className="px-3.5 py-2 bg-[#FAF8F4] hover:bg-white text-[#222222] border border-[#D6D9DC] text-xs font-semibold rounded transition-colors"
              >
                {language === 'ta' ? 'புதிய புகார்' : 'New Complaint'}
              </Link>
            </div>
          </div>

          {/* Printable Official Grievance Acknowledgement Slip */}
          <div className="hidden print:block border-2 border-black p-6 space-y-4 text-center mt-6">
            <div className="text-sm font-bold uppercase">Government of Tamil Nadu • தமிழ்நாடு அரசு</div>
            <div className="text-xs">Civil Supplies & Consumer Protection Department</div>
            <div className="text-base font-bold text-[#7B2638] mt-2">Public Grievance Redressal Acknowledgement</div>
            
            <div className="border-y-2 border-black py-3 my-2 space-y-1">
              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Registration Number</div>
              <div className="text-3xl font-mono font-black text-[#7B2638]">
                {complaint.referenceCode}
              </div>
            </div>

            <div className="text-xs space-y-2 text-left max-w-md mx-auto py-2">
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold text-gray-600">Concerned FPS:</span>
                <span className="font-mono font-bold">{complaint.shopCode}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold text-gray-600">Category:</span>
                <span className="font-bold">{complaint.category}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold text-gray-600">Current Status:</span>
                <span className="font-mono font-bold uppercase">{complaint.status}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold text-gray-600">Date Logged:</span>
                <span className="font-mono">{complaint.createdAt}</span>
              </div>
              <div className="pt-1">
                <span className="font-semibold text-gray-600">Subject:</span>
                <p className="mt-0.5">{complaint.subject}</p>
              </div>
            </div>

            <div className="text-[10px] text-gray-600 pt-4 border-t border-dashed border-gray-400">
              Department Consumer Helpline: 1967 (Toll-free) / 1800-425-5901 • Portal: https://srqms.tn.gov.in
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
