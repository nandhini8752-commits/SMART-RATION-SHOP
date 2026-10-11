import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Sliders, ArrowLeft, Plus, ExternalLink, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface PolicyRuleItem {
  id?: string;
  ruleCode: string;
  version: number;
  cardCategory: string;
  commodityCode?: string;
  commodityNameI18n?: { en: string; ta?: string };
  ruleConfig?: { scale?: string; tariff?: string | number; quota?: number; pricePerUnit?: number };
  scale?: string;
  tariff?: string;
  sourceUrl?: string;
  sourceNote?: string;
  validFrom: string;
  validTo?: string | null;
  isDemo?: boolean;
}

const FALLBACK_POLICIES: PolicyRuleItem[] = [
  {
    ruleCode: 'RICE_PHH_V1',
    version: 1,
    cardCategory: 'PHH',
    scale: '5 kg per person',
    tariff: 'Free (₹0.00)',
    sourceUrl: 'https://www.consumer.tn.gov.in/fairprice.htm',
    validFrom: '2026-01-01',
    isDemo: true
  },
  {
    ruleCode: 'RICE_AAY_V1',
    version: 1,
    cardCategory: 'AAY',
    scale: '35 kg per family',
    tariff: 'Free (₹0.00)',
    sourceUrl: 'https://www.consumer.tn.gov.in/fairprice.htm',
    validFrom: '2026-01-01',
    isDemo: true
  },
  {
    ruleCode: 'SUGAR_UNIVERSAL_V1',
    version: 1,
    cardCategory: 'PHH / NPHH',
    scale: '1 kg per card',
    tariff: '₹25.00 / kg',
    sourceUrl: 'https://tncsc.tn.gov.in/en/PDS.html',
    validFrom: '2026-01-01',
    isDemo: true
  },
  {
    ruleCode: 'DAL_UNIVERSAL_V1',
    version: 1,
    cardCategory: 'PHH / NPHH',
    scale: '1 kg per card',
    tariff: '₹30.00 / kg',
    sourceUrl: 'https://tncsc.tn.gov.in/en/PDS.html',
    validFrom: '2026-01-01',
    isDemo: true
  },
  {
    ruleCode: 'OIL_UNIVERSAL_V1',
    version: 1,
    cardCategory: 'PHH / NPHH',
    scale: '1 litre per card',
    tariff: '₹25.00 / litre',
    sourceUrl: 'https://tncsc.tn.gov.in/en/PDS.html',
    validFrom: '2026-01-01',
    isDemo: true
  }
];

export const AdminPoliciesPage: React.FC = () => {
  const { language } = useLanguage();
  const [policies, setPolicies] = useState<PolicyRuleItem[]>(FALLBACK_POLICIES);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [ruleCode, setRuleCode] = useState('');
  const [cardCategory, setCardCategory] = useState('PHH');
  const [commodityCode, setCommodityCode] = useState('RICE');
  const [scale, setScale] = useState('');
  const [tariff, setTariff] = useState('Free (₹0.00)');
  const [sourceUrl, setSourceUrl] = useState('https://www.consumer.tn.gov.in/fairprice.htm');
  const [sourceNote, setSourceNote] = useState('TN PDS Gazetted notification');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/policies', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.policies && data.policies.length > 0) {
          const mapped = data.policies.map((p: any) => ({
            ...p,
            scale: p.ruleConfig?.scale || (p.ruleConfig?.quota ? `${p.ruleConfig.quota} ${p.ruleConfig.unit || ''}` : p.scale || 'As configured'),
            tariff: p.ruleConfig?.tariff !== undefined 
              ? (p.ruleConfig.tariff === 0 || p.ruleConfig.tariff === '0' || p.ruleConfig.tariff === 'Free (₹0.00)' ? 'Free (₹0.00)' : `₹${p.ruleConfig.tariff}`) 
              : p.tariff || 'Subsidized'
          }));
          setPolicies(mapped);
        }
      }
    } catch (err) {
      console.warn('Policies fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/policies', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ruleCode: ruleCode.trim().toUpperCase(),
          cardCategory,
          commodityCode,
          ruleConfig: {
            scale: scale.trim(),
            tariff: tariff.trim(),
          },
          explanationI18n: {
            en: `${scale.trim()} at ${tariff.trim()}`,
            ta: `${scale.trim()} - ${tariff.trim()}`
          },
          sourceUrl: sourceUrl.trim() || undefined,
          sourceNote: sourceNote.trim() || undefined,
          validFrom,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to create policy rule');
      }

      await fetchPolicies();
      setShowAddModal(false);
      setRuleCode('');
      setScale('');
    } catch (err: any) {
      setFormError(err.message || 'Error creating policy rule');
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
            {language === 'ta' ? 'பதிப்புரிமை கொள்கை விதிகள் (Entitlement Policies)' : 'Versioned Policy Rules Engine'}
          </h2>
          <p className="text-xs text-[#555555] mt-1">
            {language === 'ta' ? 'அரசு கொள்கை அளவீடுகள், அதிகாரப்பூர்வ மூல ஆதாரங்கள் மற்றும் அமலாக்க தேதிகள்.' : 'Configure card-category entitlement quotas, tariffs, and source audit citations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPolicies}
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
            <span>{language === 'ta' ? 'புதிய கொள்கை விதி' : 'Create Policy Rule'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
              <th className="py-3 px-4">Rule Code</th>
              <th className="py-3 px-4">Card Category</th>
              <th className="py-3 px-4">Scale</th>
              <th className="py-3 px-4">Subsidized Tariff</th>
              <th className="py-3 px-4">Source Note</th>
              <th className="py-3 px-4">Effective Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E1]">
            {policies.map((rule, idx) => (
              <tr key={rule.ruleCode + '-' + (rule.version || idx)} className="hover:bg-[#FAF8F4]/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">
                  {rule.ruleCode} <span className="text-[10px] text-[#555555] font-normal">(v{rule.version})</span>
                </td>
                <td className="py-3 px-4 font-semibold text-[#222222]">{rule.cardCategory}</td>
                <td className="py-3 px-4 text-[#444444]">{rule.scale}</td>
                <td className="py-3 px-4 font-semibold text-[#1F6B45]">{rule.tariff}</td>
                <td className="py-3 px-4">
                  {rule.sourceUrl ? (
                    <a 
                      href={rule.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#7B2638] hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>{rule.sourceNote || 'Official Policy'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[#555555] text-[11px]">{rule.sourceNote || 'Gazetted Order'}</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-[#555555]">{rule.validFrom ? String(rule.validFrom).split('T')[0] : '2026-01-01'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#D6D9DC] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6D9DC] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#7B2638]" />
                <h3 className="font-bold text-base text-[#222222]">
                  {language === 'ta' ? 'புதிய கொள்கை விதி சேர்' : 'Create New Policy Rule'}
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

            <form onSubmit={handleCreatePolicy} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#222222] mb-1">
                  Rule Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RICE_PHH_V2 or WHEAT_SPECIAL"
                  value={ruleCode}
                  onChange={(e) => setRuleCode(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded font-mono uppercase focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Card Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cardCategory}
                    onChange={(e) => setCardCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded bg-white focus:outline-hidden focus:border-[#7B2638]"
                  >
                    <option value="PHH">PHH</option>
                    <option value="AAY">AAY</option>
                    <option value="NPHH">NPHH</option>
                    <option value="NPHH-S">NPHH-S</option>
                    <option value="ALL">ALL Categories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Commodity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={commodityCode}
                    onChange={(e) => setCommodityCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded bg-white focus:outline-hidden focus:border-[#7B2638]"
                  >
                    <option value="RICE">RICE</option>
                    <option value="SUGAR">SUGAR</option>
                    <option value="WHEAT">WHEAT</option>
                    <option value="TUR_DAL">TUR_DAL</option>
                    <option value="PALMOLEIN_OIL">PALMOLEIN_OIL</option>
                    <option value="KEROSENE">KEROSENE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Scale / Entitlement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 kg per person"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Subsidized Tariff <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free (₹0.00) or ₹25.00 / kg"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">
                  Source Citation Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. TN Gazetted Order No. 2026/04"
                  value={sourceNote}
                  onChange={(e) => setSourceNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Official Reference URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#222222] mb-1">
                    Effective Valid From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6D9DC] rounded focus:outline-hidden focus:border-[#7B2638]"
                  />
                </div>
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
                  {submitting ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (language === 'ta' ? 'விதியை வெளியிடு' : 'Publish Rule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
