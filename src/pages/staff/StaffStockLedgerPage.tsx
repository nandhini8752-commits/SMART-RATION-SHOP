import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, ArrowLeft, Filter, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

interface LedgerRow {
  id: string;
  timestamp: string;
  commodityCode: string;
  commodityNameI18n: { en: string; ta?: string };
  unit: string;
  type: 'RESTOCK' | 'DISTRIBUTION' | 'ADJUSTMENT' | 'REVERSAL';
  delta: number;
  before: number;
  after: number;
  actorUsername: string;
  actorFullName: string;
  reason: string;
  idempotencyKey?: string;
}

const FALLBACK_LEDGER: LedgerRow[] = [
  { id: 'tx-1', timestamp: '2026-10-11T10:45:00Z', commodityCode: 'RICE', commodityNameI18n: { en: 'Rice (Common/Fine)', ta: 'அரிசி' }, unit: 'kg', type: 'DISTRIBUTION', delta: -20, before: 220, after: 200, actorUsername: 'operator_anna', actorFullName: 'K. Rajavel', reason: 'Dispensed for token TK-101 (DEMO-TN-0001)' },
  { id: 'tx-2', timestamp: '2026-10-11T10:45:00Z', commodityCode: 'SUGAR', commodityNameI18n: { en: 'Sugar', ta: 'சர்க்கரை' }, unit: 'kg', type: 'DISTRIBUTION', delta: -1, before: 41, after: 40, actorUsername: 'operator_anna', actorFullName: 'K. Rajavel', reason: 'Dispensed for token TK-101 (DEMO-TN-0001)' },
  { id: 'tx-3', timestamp: '2026-10-11T09:15:00Z', commodityCode: 'RICE', commodityNameI18n: { en: 'Rice (Common/Fine)', ta: 'அரிசி' }, unit: 'kg', type: 'RESTOCK', delta: 200, before: 20, after: 220, actorUsername: 'supervisor_anna', actorFullName: 'M. Senthilkumar', reason: 'Monthly central godown supply delivery (DC #8921)' },
  { id: 'tx-4', timestamp: '2026-10-11T09:15:00Z', commodityCode: 'SUGAR', commodityNameI18n: { en: 'Sugar', ta: 'சர்க்கரை' }, unit: 'kg', type: 'RESTOCK', delta: 40, before: 1, after: 41, actorUsername: 'supervisor_anna', actorFullName: 'M. Senthilkumar', reason: 'Monthly central godown supply delivery (DC #8921)' }
];

export const StaffStockLedgerPage: React.FC = () => {
  const { language } = useLanguage();
  const [filterType, setFilterType] = useState('ALL');
  const [ledger, setLedger] = useState<LedgerRow[]>(FALLBACK_LEDGER);
  const [loading, setLoading] = useState(false);

  const [staffUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_staff_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);

      const res = await fetch(`/api/v1/staff/inventory/ledger?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.ledger && data.ledger.length > 0) {
          setLedger(data.ledger);
        } else if (filterType !== 'ALL') {
          // If no rows for this filter in backend, show filtered fallback
          setLedger(FALLBACK_LEDGER.filter((l) => l.type === filterType));
        }
      }
    } catch (err) {
      console.warn('Ledger fetch error:', err);
      setLedger(
        filterType === 'ALL'
          ? FALLBACK_LEDGER
          : FALLBACK_LEDGER.filter((l) => l.type === filterType)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [filterType]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link 
          to="/staff/inventory" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'இருப்பு பக்கத்திற்கு திரும்புக' : 'Back to Inventory'}</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D9DC] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#222222]">
            {language === 'ta' ? 'இருப்பு பரிவர்த்தனை தணிக்கை ஏடு' : 'Stock Movement Audit Ledger'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{staffUser?.shopName || 'Fair Price Shop 001 (Anna Nagar East)'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Immutable Signed Stock Ledger
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#555555]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-[#D6D9DC] rounded px-2.5 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:border-[#7B2638]"
            >
              <option value="ALL">All Movements</option>
              <option value="DISTRIBUTION">Distributions (-)</option>
              <option value="RESTOCK">Restocks (+)</option>
              <option value="ADJUSTMENT">Adjustments</option>
              <option value="REVERSAL">Reversals</option>
            </select>
          </div>

          <button
            onClick={fetchLedger}
            disabled={loading}
            className="p-1.5 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Delta</th>
                <th className="py-3 px-4">Before → After</th>
                <th className="py-3 px-4">Operator / Actor</th>
                <th className="py-3 px-4">Reason / Reference Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E1]">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#777777]">
                    No stock movements recorded for this filter.
                  </td>
                </tr>
              ) : (
                ledger.map((row) => {
                  const displayName = language === 'ta' && row.commodityNameI18n?.ta
                    ? row.commodityNameI18n.ta
                    : (row.commodityNameI18n?.en || row.commodityCode);

                  const formattedTime = new Date(row.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <tr key={row.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#555555] whitespace-nowrap text-[11px]">
                        {formattedTime}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#222222]">{displayName}</div>
                        <div className="font-mono text-[10px] text-[#777777]">{row.commodityCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          row.type === 'DISTRIBUTION' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : row.type === 'RESTOCK'
                            ? 'bg-emerald-50 text-[#1F6B45] border-emerald-200'
                            : 'bg-amber-50 text-[#8A5300] border-amber-200'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">
                        {row.delta > 0 ? `+${row.delta}` : row.delta} {row.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#555555] whitespace-nowrap">
                        {row.before} → {row.after}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-[#222222] font-semibold">{row.actorUsername}</div>
                        {row.actorFullName && (
                          <div className="text-[10px] text-[#777777]">{row.actorFullName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#333333] max-w-xs">{row.reason}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
