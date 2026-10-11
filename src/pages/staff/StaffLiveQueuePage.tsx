import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Ticket, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Clock, 
  Package, 
  Store,
  RefreshCw,
  Keyboard,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface QueueItem {
  id: string;
  tokenNumber: string;
  sequenceNo: number;
  cardNumber: string;
  headName: string;
  category: string;
  familyMembers?: number;
  counterNo?: number;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  time?: string;
  servingStartedAt?: string;
}

export const StaffLiveQueuePage: React.FC = () => {
  const { language } = useLanguage();
  
  // Staff auth user from localStorage
  const [staffUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_staff_user') || '{}');
    } catch {
      return {};
    }
  });

  const [activeCounter, setActiveCounter] = useState<number>(1);
  const [waitingList, setWaitingList] = useState<QueueItem[]>([]);
  const [servingToken, setServingToken] = useState<QueueItem | null>(null);
  const [summary, setSummary] = useState({
    waitingCount: 0,
    servingCount: 0,
    completedCount: 0,
    totalIssued: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispenseNote, setDispenseNote] = useState('');

  // Fetch live queue from backend
  const fetchQueue = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch(`/api/v1/staff/queue?counterNo=${activeCounter}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || { waitingCount: 0, servingCount: 0, completedCount: 0, totalIssued: 0 });
        
        // Find current serving token for this active counter
        const servingForCounter = (data.serving || []).find((s: any) => s.counterNo === activeCounter);
        setServingToken(servingForCounter || null);
        
        setWaitingList(data.waiting || []);
      }
    } catch (err) {
      console.warn('Queue fetch error:', err);
    }
  }, [activeCounter, staffUser?.token]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3500);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Call Next FIFO Token
  const handleCallNext = async () => {
    setActionLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch('/api/v1/staff/queue/call-next', {
        method: 'POST',
        headers,
        body: JSON.stringify({ counterNo: activeCounter }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to dispatch token');
      }

      if (data.nextServing) {
        setServingToken(data.nextServing);
        setStatusMessage(
          language === 'ta'
            ? `டோக்கன் ${data.nextServing.tokenNumber} கவுண்டர் ${activeCounter}-க்கு வெற்றிகரமாக அழைக்கப்பட்டது.`
            : `Dispatched ${data.nextServing.tokenNumber} to Counter ${activeCounter}.`
        );
      } else {
        setStatusMessage(
          language === 'ta'
            ? 'காத்திருப்பு வரிசையில் டோக்கன்கள் எதுவும் இல்லை.'
            : 'No waiting tokens in FIFO queue for today.'
        );
      }
      await fetchQueue();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Token
  const handleComplete = async () => {
    if (!servingToken) return;
    setActionLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch(`/api/v1/staff/queue-tokens/${servingToken.id}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ note: dispenseNote.trim() || 'Distribution completed successfully' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to complete token');
      }

      setStatusMessage(
        language === 'ta'
          ? `டோக்கன் ${servingToken.tokenNumber} சேவை வெற்றிகரமாக முடிக்கப்பட்டது.`
          : `Distribution completed for token ${servingToken.tokenNumber}. Ready for next customer.`
      );
      setServingToken(null);
      setDispenseNote('');
      await fetchQueue();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Mark No-Show
  const handleNoShow = async () => {
    if (!servingToken) return;
    const defaultReason = language === 'ta' ? 'அழைப்பிற்குப் பின் வரவில்லை' : 'Beneficiary absent after 3 verbal calls';
    const reason = window.prompt(
      language === 'ta' ? 'நோ-ஷோவுக்கான காரணத்தைக் குறிப்பிடவும்:' : 'Reason for marking No-Show:',
      defaultReason
    );
    if (!reason?.trim()) return;

    setActionLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch(`/api/v1/staff/queue-tokens/${servingToken.id}/no-show`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to mark no-show');
      }

      setStatusMessage(
        language === 'ta'
          ? `டோக்கன் ${servingToken.tokenNumber} நோ-ஷோவாக பதிவு செய்யப்பட்டது.`
          : `Token ${servingToken.tokenNumber} marked as NO-SHOW.`
      );
      setServingToken(null);
      await fetchQueue();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Token by Staff
  const handleCancelStaff = async () => {
    if (!servingToken) return;
    const defaultReason = language === 'ta' ? 'கடை ஊழியரால் ரத்து செய்யப்பட்டது' : 'Cancelled by counter operator';
    const reason = window.prompt(
      language === 'ta' ? 'ரத்து செய்வதற்கான காரணம்:' : 'Reason for cancellation:',
      defaultReason
    );
    if (!reason?.trim()) return;

    setActionLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch(`/api/v1/staff/queue-tokens/${servingToken.id}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to cancel token');
      }

      setStatusMessage(
        language === 'ta'
          ? `டோக்கன் ${servingToken.tokenNumber} ரத்து செய்யப்பட்டது.`
          : `Token ${servingToken.tokenNumber} cancelled by staff.`
      );
      setServingToken(null);
      await fetchQueue();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Global Keyboard Shortcuts (Alt+N: Call Next, Alt+C: Complete, Alt+S: No-Show)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in textarea or input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleCallNext();
      } else if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handleComplete();
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleNoShow();
      } else if (e.altKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        handleCancelStaff();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/staff/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'பணியாளர் பலகைக்கு திரும்புக' : 'Back to Staff Dashboard'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D9DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
              {staffUser?.shopCode || 'DEMO-CHN-001'}
            </span>
            <span className="text-xs font-bold text-[#1F6B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {staffUser?.role === 'SHOP_SUPERVISOR' ? 'SUPERVISOR DESK' : 'OPERATOR DESK'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mt-1">
            {language === 'ta' ? 'நிகழ்நேர வரிசை மற்றும் கவுண்டர் மேலாண்மை' : 'Multi-Counter Live Queue Desk'}
          </h2>
          <p className="text-xs text-[#555555] mt-0.5">
            {staffUser?.shopName || 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)'} • Strictly Enforced FIFO Dispatch
          </p>
        </div>

        {/* Counter Selection Tabs */}
        <div className="flex items-center gap-2 bg-[#FAF8F4] border border-[#E5E0D5] p-1.5 rounded-lg text-xs">
          <span className="font-bold text-[#555555] px-2">{language === 'ta' ? 'கவுண்டர்:' : 'Active Counter:'}</span>
          <button
            onClick={() => setActiveCounter(1)}
            className={`px-3 py-1 rounded font-bold transition-all ${
              activeCounter === 1
                ? 'bg-[#7B2638] text-white shadow-xs'
                : 'bg-white text-[#555555] border border-[#D6D9DC]'
            }`}
          >
            Counter 1
          </button>
          <button
            onClick={() => setActiveCounter(2)}
            className={`px-3 py-1 rounded font-bold transition-all ${
              activeCounter === 2
                ? 'bg-[#7B2638] text-white shadow-xs'
                : 'bg-white text-[#555555] border border-[#D6D9DC]'
            }`}
          >
            Counter 2
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#1F6B45] text-xs p-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-[#A12622] text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Queue Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-[#D6D9DC] p-3 rounded-lg">
          <span className="text-[#555555]">{language === 'ta' ? 'காத்திருப்போர்:' : 'Waiting Line:'}</span>
          <div className="font-mono text-xl font-bold text-[#7B2638] mt-0.5">{summary.waitingCount}</div>
        </div>
        <div className="bg-white border border-[#D6D9DC] p-3 rounded-lg">
          <span className="text-[#555555]">{language === 'ta' ? 'சேவை பெறுவோர்:' : 'Currently Serving:'}</span>
          <div className="font-mono text-xl font-bold text-[#1F6B45] mt-0.5">{summary.servingCount}</div>
        </div>
        <div className="bg-white border border-[#D6D9DC] p-3 rounded-lg">
          <span className="text-[#555555]">{language === 'ta' ? 'முடிவடைந்தவை:' : 'Completed Today:'}</span>
          <div className="font-mono text-xl font-bold text-[#222222] mt-0.5">{summary.completedCount}</div>
        </div>
        <div className="bg-white border border-[#D6D9DC] p-3 rounded-lg">
          <span className="text-[#555555]">{language === 'ta' ? 'மொத்த டோக்கன்கள்:' : 'Total Tokens:'}</span>
          <div className="font-mono text-xl font-bold text-[#C49A3A] mt-0.5">{summary.totalIssued}</div>
        </div>
      </div>

      {/* Main Queue & Dispensation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Waiting Line Table */}
        <div className="lg:col-span-2 bg-white border border-[#D6D9DC] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#222222]">
              <Users className="w-4 h-4 text-[#7B2638]" />
              <span>{language === 'ta' ? 'வரிசையில் உள்ள டோக்கன்கள் (FIFO)' : 'Waiting Tokens Line (FIFO)'}</span>
              <span className="text-xs bg-[#FAF8F4] text-[#7B2638] font-mono px-2 py-0.5 rounded border border-[#E5E0D5]">
                {waitingList.length}
              </span>
            </div>
            <button
              onClick={handleCallNext}
              disabled={actionLoading || waitingList.length === 0}
              className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'ta' ? 'அடுத்த டோக்கனை அழை (Alt+N)' : 'Call Next Token (Alt+N)'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{language === 'ta' ? 'டோக்கன் எண்' : 'Token #'}</th>
                  <th className="py-2.5 px-3">{language === 'ta' ? 'அட்டை எண்' : 'Card #'}</th>
                  <th className="py-2.5 px-3">{language === 'ta' ? 'குடும்பத் தலைவர்' : 'Cardholder'}</th>
                  <th className="py-2.5 px-3">{language === 'ta' ? 'பிரிவு' : 'Category'}</th>
                  <th className="py-2.5 px-3">{language === 'ta' ? 'நிலை' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8E1]">
                {waitingList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#777777]">
                      {language === 'ta' ? 'காத்திருப்பு வரிசையில் டோக்கன்கள் இல்லை.' : 'No waiting tokens in FIFO queue.'}
                    </td>
                  </tr>
                ) : (
                  waitingList.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-2.5 px-3 text-[#777777] font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#7B2638]">{q.tokenNumber}</td>
                      <td className="py-2.5 px-3 font-mono text-[#222222]">{q.cardNumber}</td>
                      <td className="py-2.5 px-3 text-[#222222] font-semibold">{q.headName}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[10px] bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E5E0D5] font-bold">
                          {q.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          WAITING
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Active Serving Counter Desk */}
        <div className="bg-white border border-[#D6D9DC] rounded-lg p-5 space-y-4">
          <div className="border-b border-[#EBE8E1] pb-3 flex items-center justify-between">
            <span className="font-bold text-sm text-[#222222]">
              Counter {activeCounter} Desk
            </span>
            <span className="text-[11px] font-bold text-[#1F6B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Desk
            </span>
          </div>

          {servingToken ? (
            <div className="space-y-4 text-xs">
              <div className="bg-[#FAF8F4] p-3.5 rounded border border-[#E5E0D5] space-y-1">
                <div className="text-[10px] text-[#555555] uppercase font-bold tracking-wider">
                  Currently Serving
                </div>
                <div className="text-3xl font-black font-mono text-[#7B2638]">
                  {servingToken.tokenNumber}
                </div>
                <div className="text-xs text-[#222222] font-semibold mt-1">
                  {servingToken.headName} ({servingToken.cardNumber})
                </div>
                <div className="text-[11px] text-[#555555]">
                  Category: <strong>{servingToken.category}</strong> • Family: <strong>{servingToken.familyMembers || 4} members</strong>
                </div>
              </div>

              {/* Standard Quota to Dispense */}
              <div className="space-y-2">
                <span className="font-bold text-[#222222] block">
                  Commodity Allocation (Quota to Dispense):
                </span>
                <div className="bg-[#FAF8F4] p-2.5 rounded border border-[#E5E0D5] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Rice (Common):</span>
                    <strong className="font-mono text-[#7B2638]">20 kg (Free)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Sugar:</span>
                    <strong className="font-mono text-[#7B2638]">1 kg (₹25.00)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tur Dal:</span>
                    <strong className="font-mono text-[#7B2638]">1 kg (₹30.00)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Palmolein Oil:</span>
                    <strong className="font-mono text-[#7B2638]">1 litre (₹25.00)</strong>
                  </div>
                </div>
              </div>

              {/* Dispensation Note Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#555555]">Distribution Note (Optional):</label>
                <input
                  type="text"
                  value={dispenseNote}
                  onChange={(e) => setDispenseNote(e.target.value)}
                  placeholder="e.g. Standard biometrics verified"
                  className="w-full px-2.5 py-1.5 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              {/* Fast Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="w-full bg-[#1F6B45] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Service (Alt+C)</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleNoShow}
                    disabled={actionLoading}
                    className="flex-1 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-[#8A5300] border border-amber-300 font-bold text-xs py-2 rounded transition-colors"
                  >
                    No-Show (Alt+S)
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelStaff}
                    disabled={actionLoading}
                    className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-[#A12622] border border-red-300 font-bold text-xs py-2 rounded transition-colors"
                  >
                    Cancel (Alt+X)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[#777777] space-y-3">
              <Ticket className="w-10 h-10 mx-auto text-[#CCCCCC]" />
              <p className="font-semibold text-[#555555]">No customer currently serving at Counter {activeCounter}.</p>
              <button
                onClick={handleCallNext}
                disabled={actionLoading || waitingList.length === 0}
                className="bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-xs"
              >
                Call Next Token (Alt+N)
              </button>
            </div>
          )}

          {/* Quick Keyboard Reference */}
          <div className="pt-2 border-t border-[#EBE8E1] text-[10px] text-[#777777] flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold">
              <Keyboard className="w-3 h-3 text-[#7B2638]" /> Shortcuts:
            </span>
            <span>Alt+N (Next) • Alt+C (Complete) • Alt+S (No-Show)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
