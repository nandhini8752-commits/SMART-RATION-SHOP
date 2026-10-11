import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Package, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface InventoryItem {
  id: string;
  commodityCode: string;
  nameI18n: { en: string; ta?: string };
  unit: string;
  quantityAvailable: number;
  reorderLevel: number;
  status: 'ADEQUATE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt?: string;
}

const FALLBACK_INVENTORY: InventoryItem[] = [
  { id: '1', commodityCode: 'RICE', nameI18n: { en: 'Rice (Common/Fine)', ta: 'அரிசி' }, quantityAvailable: 200, reorderLevel: 30, unit: 'kg', status: 'ADEQUATE' },
  { id: '2', commodityCode: 'SUGAR', nameI18n: { en: 'Sugar', ta: 'சர்க்கரை' }, quantityAvailable: 40, reorderLevel: 8, unit: 'kg', status: 'ADEQUATE' },
  { id: '3', commodityCode: 'WHEAT', nameI18n: { en: 'Wheat', ta: 'கோதுமை' }, quantityAvailable: 50, reorderLevel: 5, unit: 'kg', status: 'ADEQUATE' },
  { id: '4', commodityCode: 'TUR_DAL', nameI18n: { en: 'Tur dal', ta: 'துவரம் பருப்பு' }, quantityAvailable: 30, reorderLevel: 5, unit: 'kg', status: 'ADEQUATE' },
  { id: '5', commodityCode: 'PALMOLEIN_OIL', nameI18n: { en: 'Palmolein oil', ta: 'பாமாயில்' }, quantityAvailable: 40, reorderLevel: 5, unit: 'litre', status: 'ADEQUATE' },
  { id: '6', commodityCode: 'KEROSENE', nameI18n: { en: 'Kerosene', ta: 'மண்ணெண்ணெய்' }, quantityAvailable: 20, reorderLevel: 5, unit: 'litre', status: 'ADEQUATE' }
];

export const StaffInventoryPage: React.FC = () => {
  const { language } = useLanguage();

  const [staffUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_staff_user') || '{}');
    } catch {
      return {};
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(FALLBACK_INVENTORY);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [txType, setTxType] = useState<'RESTOCK' | 'ADJUSTMENT'>('RESTOCK');
  const [commodityCode, setCommodityCode] = useState('RICE');
  const [quantity, setQuantity] = useState('50');
  const [reason, setReason] = useState('Monthly central godown supply delivery (DC #8921)');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch('/api/v1/staff/inventory', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.inventory && data.inventory.length > 0) {
          setInventory(data.inventory);
        }
      }
    } catch (err) {
      console.warn('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const delta = parseFloat(quantity);
    if (isNaN(delta) || delta === 0) {
      setErrorMsg(language === 'ta' ? 'சரியான அளவை உள்ளிடவும்.' : 'Please enter a valid quantity.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg(language === 'ta' ? 'செயல்பாட்டுக் காரணம் கட்டாயமானது.' : 'Operational reason is mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const idempotencyKey = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const res = await fetch('/api/v1/staff/inventory/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          commodityCode,
          transactionType: txType,
          quantityDelta: delta,
          reason: reason.trim(),
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to record stock movement');
      }

      setSuccessMsg(
        language === 'ta'
          ? `${commodityCode} பொருளுக்கு ${delta > 0 ? '+' : ''}${delta} அளவு வெற்றிகரமாக பதிவு செய்யப்பட்டது.`
          : `Recorded ${txType} of ${delta > 0 ? '+' : ''}${delta} for ${commodityCode}. Stock updated.`
      );

      // Refresh table
      await fetchInventory();

      // Reset form quantity
      if (txType === 'RESTOCK') {
        setQuantity('50');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link 
          to="/staff/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'பணியாளர் பலகைக்கு திரும்புக' : 'Back to Staff Dashboard'}</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D9DC] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#222222]">
            {language === 'ta' ? 'பொருட்கள் இருப்பு மற்றும் மறுநிரப்பல்' : 'Commodity Inventory & Stock Controls'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{staffUser?.shopName || 'Fair Price Shop 001 (Anna Nagar East)'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Physical Store Ledger
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-2 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
            title="Refresh Stock"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
          <Link
            to="/staff/inventory/ledger"
            className="inline-flex items-center gap-1.5 bg-[#FAF8F4] hover:bg-white text-[#7B2638] text-xs font-bold px-3.5 py-2 rounded border border-[#D6D9DC] transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'தணிக்கை ஏடு' : 'View Audit Ledger'}</span>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-[#1F6B45]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-[#A12622]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Stock Table */}
        <div className="lg:col-span-2 bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8E1]">
                {inventory.map((row) => {
                  const displayName = language === 'ta' && row.nameI18n?.ta ? row.nameI18n.ta : (row.nameI18n?.en || row.commodityCode);
                  const isLow = row.quantityAvailable <= row.reorderLevel;
                  const isOut = row.quantityAvailable === 0;

                  return (
                    <tr key={row.commodityCode} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#222222]">{displayName}</div>
                        <div className="font-mono text-[10px] text-[#777777]">{row.commodityCode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#7B2638] text-sm">
                        {row.quantityAvailable}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#555555]">{row.reorderLevel}</td>
                      <td className="py-3 px-4 text-[#555555] font-mono">{row.unit}</td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A5300] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Reorder Soon</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1F6B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Adequate</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restock & Stock Movement Form */}
        <form onSubmit={handleTransactionSubmit} className="bg-white border border-[#D6D9DC] rounded-lg p-5 space-y-4 shadow-xs">
          <div className="font-bold text-sm text-[#222222] border-b border-[#EBE8E1] pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#7B2638]" />
              <span>{language === 'ta' ? 'இருப்பு மாற்றம் பதிவு' : 'Record Stock Movement'}</span>
            </div>
            <div className="flex items-center gap-1 bg-[#FAF8F4] p-0.5 rounded border border-[#E5E0D5] text-[10px]">
              <button
                type="button"
                onClick={() => setTxType('RESTOCK')}
                className={`px-2 py-0.5 rounded font-bold ${
                  txType === 'RESTOCK' ? 'bg-[#7B2638] text-white' : 'text-[#555555]'
                }`}
              >
                Restock (+)
              </button>
              <button
                type="button"
                onClick={() => setTxType('ADJUSTMENT')}
                className={`px-2 py-0.5 rounded font-bold ${
                  txType === 'ADJUSTMENT' ? 'bg-[#7B2638] text-white' : 'text-[#555555]'
                }`}
              >
                Adjust (±)
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-[#222222]">
              {language === 'ta' ? 'பொருள் தேர்வு' : 'Select Commodity'}
            </label>
            <select
              value={commodityCode}
              onChange={(e) => setCommodityCode(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#D6D9DC] rounded bg-white text-xs font-semibold focus:outline-none focus:border-[#7B2638]"
            >
              {inventory.map((i) => (
                <option key={i.commodityCode} value={i.commodityCode}>
                  {language === 'ta' && i.nameI18n?.ta ? i.nameI18n.ta : (i.nameI18n?.en || i.commodityCode)} ({i.commodityCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-[#222222]">
              {language === 'ta' ? 'அளவு மாற்றம்' : 'Quantity Delta (Use negative for deduction)'}
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50 or -5"
              className="w-full px-2.5 py-1.5 border border-[#D6D9DC] rounded text-xs font-mono focus:outline-none focus:border-[#7B2638]"
              required
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-[#222222]">
              {language === 'ta' ? 'காரணம் / வழங்கல் குறிப்பு (கட்டாயம்)' : 'Delivery Note / Reason (Mandatory)'}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#D6D9DC] rounded text-xs focus:outline-none focus:border-[#7B2638]"
              placeholder="e.g. Central godown delivery, physical audit count..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white font-bold text-xs py-2 rounded transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {language === 'ta'
                ? submitting ? 'பதிவு செய்யப்படுகிறது...' : 'இருப்பை உறுதிசெய்'
                : submitting ? 'Recording Movement...' : 'Commit Movement to Ledger'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
