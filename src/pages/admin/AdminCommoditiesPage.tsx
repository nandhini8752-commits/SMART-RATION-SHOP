import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Package, ArrowLeft, Plus, CheckCircle2, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface CommodityItem {
  id: string;
  code: string;
  nameI18n: { en: string; ta?: string };
  unit: string;
  isActive: boolean;
}

const FALLBACK_COMMODITIES: CommodityItem[] = [
  { id: '1', code: 'RICE', nameI18n: { en: 'Rice (Common/Fine)', ta: 'அரிசி' }, unit: 'kg', isActive: true },
  { id: '2', code: 'SUGAR', nameI18n: { en: 'Sugar', ta: 'சர்க்கரை' }, unit: 'kg', isActive: true },
  { id: '3', code: 'WHEAT', nameI18n: { en: 'Wheat', ta: 'கோதுமை' }, unit: 'kg', isActive: true },
  { id: '4', code: 'TUR_DAL', nameI18n: { en: 'Tur dal', ta: 'துவரம் பருப்பு' }, unit: 'kg', isActive: true },
  { id: '5', code: 'PALMOLEIN_OIL', nameI18n: { en: 'Palmolein oil', ta: 'பாமாயில்' }, unit: 'litre', isActive: true },
  { id: '6', code: 'KEROSENE', nameI18n: { en: 'Kerosene', ta: 'மண்ணெண்ணெய்' }, unit: 'litre', isActive: true }
];

export const AdminCommoditiesPage: React.FC = () => {
  const { language } = useLanguage();
  const [commodities, setCommodities] = useState<CommodityItem[]>(FALLBACK_COMMODITIES);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [unit, setUnit] = useState('kg');

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchCommodities = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/commodities', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.commodities && data.commodities.length > 0) {
          setCommodities(data.commodities);
        }
      }
    } catch (err) {
      console.warn('Commodities fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodities();
  }, []);

  const handleCreateCommodity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/commodities', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          nameI18n: { en: nameEn.trim(), ta: nameTa.trim() || undefined },
          unit: unit.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to create commodity');
      }

      await fetchCommodities();
      setShowAddModal(false);
      setCode('');
      setNameEn('');
      setNameTa('');
    } catch (err: any) {
      setFormError(err.message || 'Creation failed');
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
            {language === 'ta' ? 'பொருட்கள் அட்டவணை மேலாண்மை' : 'Commodity Catalogue & Units'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{language === 'ta' ? 'பொது விநியோகப் பொருட்கள், அளவீட்டு அலகுகள் மற்றும் பன்மொழி பெயர்கள்.' : 'Maintain essential PDS commodities, standard measurement units, and multilingual labels.'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              TNPDS Essential Commodities
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCommodities}
            disabled={loading}
            className="p-1.5 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-3.5 py-2 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'புதிய பொருள் சேர்க்க' : 'Add Commodity'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
              <th className="py-3 px-4">Commodity Code</th>
              <th className="py-3 px-4">English Name</th>
              <th className="py-3 px-4">Tamil Name (தமிழ்)</th>
              <th className="py-3 px-4">Standard Unit</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E1]">
            {commodities.map((item) => (
              <tr key={item.code} className="hover:bg-[#FAF8F4]/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">{item.code}</td>
                <td className="py-3 px-4 font-semibold text-[#222222]">{item.nameI18n?.en || item.code}</td>
                <td className="py-3 px-4 text-[#222222]">{item.nameI18n?.ta || '—'}</td>
                <td className="py-3 px-4 font-mono text-[#555555]">{item.unit}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F6B45]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Commodity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D6D9DC] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-2">
              <h3 className="font-bold text-sm text-[#222222]">Add New Essential Commodity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#888888] hover:text-[#222222]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-[#A12622] rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCommodity} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Commodity Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. RAGI"
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 bg-white font-semibold"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="litre">litre (Litre)</option>
                    <option value="packet">packet (Packet)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">English Name</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Finger Millet (Ragi)"
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">Tamil Name (தமிழ்)</label>
                <input
                  type="text"
                  value={nameTa}
                  onChange={(e) => setNameTa(e.target.value)}
                  placeholder="எ.கா. கேழ்வரகு"
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-[#D6D9DC] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 font-bold bg-[#7B2638] hover:bg-[#591A28] text-white rounded shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Commodity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
