import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquareWarning, ArrowLeft, CheckCircle2, Clock, Filter, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface ComplaintItem {
  id: string;
  referenceCode: string;
  category: string;
  subject: string;
  message: string;
  status: 'RECEIVED' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  shopId?: string;
  shopCode?: string;
  shopName?: string;
  demoContactHint?: string;
  responseNote?: string;
  createdAt: string;
}

const FALLBACK_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'cmp-1',
    referenceCode: 'CMP-TN-102934',
    category: 'COMMODITY_QUALITY',
    subject: 'Sample Commodity Quality Inquiry (Demonstration)',
    message: 'Requesting confirmation on fortified rice grains appearance.',
    shopCode: 'DEMO-CHN-001',
    status: 'IN_REVIEW',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cmp-2',
    referenceCode: 'CMP-TN-102935',
    category: 'TIMING_IRREGULARITY',
    subject: 'Inquiry regarding Saturday counter operational timings',
    message: 'Are shops open during lunch hour on Saturdays?',
    shopCode: 'DEMO-CHN-002',
    status: 'RESOLVED',
    responseNote: 'Shops follow 08:30-12:30 and 15:00-19:00 timings as per circular.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const AdminComplaintsPage: React.FC = () => {
  const { language } = useLanguage();
  const [complaints, setComplaints] = useState<ComplaintItem[]>(FALLBACK_COMPLAINTS);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [newStatus, setNewStatus] = useState<'RECEIVED' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'>('RESOLVED');
  const [responseNote, setResponseNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.append('status', filterStatus);

      const res = await fetch(`/api/v1/admin/complaints?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.complaints && data.complaints.length > 0) {
          setComplaints(data.complaints);
        } else if (filterStatus !== 'ALL') {
          setComplaints(FALLBACK_COMPLAINTS.filter((c) => c.status === filterStatus));
        }
      }
    } catch (err) {
      console.warn('Complaints fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const handleOpenTriage = (c: ComplaintItem) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setResponseNote(c.responseNote || '');
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch(`/api/v1/admin/complaints/${selectedComplaint.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: newStatus,
          responseNote: responseNote.trim(),
        }),
      });

      if (res.ok) {
        await fetchComplaints();
        setSelectedComplaint(null);
      } else {
        // Fallback local update
        setComplaints((prev) =>
          prev.map((item) =>
            item.id === selectedComplaint.id
              ? { ...item, status: newStatus, responseNote: responseNote.trim() }
              : item
          )
        );
        setSelectedComplaint(null);
      }
    } catch {
      setComplaints((prev) =>
        prev.map((item) =>
          item.id === selectedComplaint.id
            ? { ...item, status: newStatus, responseNote: responseNote.trim() }
            : item
        )
      );
      setSelectedComplaint(null);
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
            {language === 'ta' ? 'குறைதீர்ப்பு மேலாண்மை & தீர்வு' : 'Grievance Triage & Resolution'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>Review submitted demonstration citizen grievances and append official response notes.</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              TNPDS Grievance Redressal
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#555555]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-[#D6D9DC] rounded px-2.5 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:border-[#7B2638]"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="p-1.5 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
              <th className="py-3 px-4">Ref Code</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Shop</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E1]">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#777777]">
                  No grievances found for this status.
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">{c.referenceCode}</td>
                  <td className="py-3 px-4 font-semibold text-[#222222]">{c.category}</td>
                  <td className="py-3 px-4 font-mono text-[#555555]">{c.shopCode || 'General'}</td>
                  <td className="py-3 px-4 text-[#333333] max-w-xs truncate">{c.subject}</td>
                  <td className="py-3 px-4 font-mono text-[#555555] whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-[#1F6B45] border-emerald-200'
                        : c.status === 'CLOSED'
                        ? 'bg-gray-100 text-[#555555] border-gray-200'
                        : c.status === 'IN_REVIEW'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-[#8A5300] border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenTriage(c)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#7B2638] bg-[#FAF8F4] hover:bg-white border border-[#D6D9DC] rounded shadow-xs"
                    >
                      Triage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Triage Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D6D9DC] shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#7B2638]">{selectedComplaint.referenceCode}</span>
                <h3 className="font-bold text-sm text-[#222222]">{selectedComplaint.subject}</h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-[#888888] hover:text-[#222222]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5]">
                <div className="font-bold text-[#555555] mb-1">Citizen Message:</div>
                <p className="text-[#222222]">{selectedComplaint.message}</p>
              </div>

              <form onSubmit={handleSaveResolution} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e: any) => setNewStatus(e.target.value)}
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 text-xs bg-white font-semibold"
                  >
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Official Resolution / Officer Response</label>
                  <textarea
                    rows={3}
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Enter official resolution details..."
                    className="w-full border border-[#D6D9DC] rounded p-2 text-xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-3 py-1.5 text-xs rounded border border-[#D6D9DC] hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 text-xs font-bold bg-[#7B2638] hover:bg-[#591A28] text-white rounded shadow-xs"
                  >
                    {submitting ? 'Saving...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
