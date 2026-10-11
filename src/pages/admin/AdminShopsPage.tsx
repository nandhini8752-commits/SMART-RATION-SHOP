import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Store, ArrowLeft, Plus, MapPin, Clock, Edit2, ShieldCheck, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface ShopItem {
  id: string;
  shopCode: string;
  name: string;
  district: string;
  taluk?: string;
  locality?: string;
  address: string;
  pincode?: string;
  phoneDisplay?: string;
  isActive: boolean;
  assignedCardsCount?: number;
}

const FALLBACK_SHOPS: ShopItem[] = [
  {
    id: '1',
    shopCode: 'DEMO-CHN-001',
    name: 'SRQMS Demo Fair Price Shop 001',
    district: 'Chennai',
    taluk: 'Anna Nagar',
    locality: 'Anna Nagar East',
    address: '12 Sample Street, Anna Nagar East, Chennai - 600102',
    isActive: true,
    assignedCardsCount: 5
  },
  {
    id: '2',
    shopCode: 'DEMO-CHN-002',
    name: 'SRQMS Demo Fair Price Shop 002',
    district: 'Chennai',
    taluk: 'Ambattur',
    locality: 'Mogappair Demo Zone',
    address: '5 Example Avenue, Mogappair, Chennai - 600037',
    isActive: true,
    assignedCardsCount: 3
  },
  {
    id: '3',
    shopCode: 'DEMO-TVM-001',
    name: 'SRQMS Demo Fair Price Shop 003',
    district: 'Tiruvallur',
    taluk: 'Avadi Demo Taluk',
    locality: 'Sample Nagar',
    address: '8 Prototype Road, Sample Nagar - 600054',
    isActive: true,
    assignedCardsCount: 2
  }
];

export const AdminShopsPage: React.FC = () => {
  const { language } = useLanguage();
  const [shops, setShops] = useState<ShopItem[]>(FALLBACK_SHOPS);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [shopCode, setShopCode] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Chennai');
  const [taluk, setTaluk] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('600001');
  const [phoneDisplay, setPhoneDisplay] = useState('044-25340001');

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchShops = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/shops', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.shops && data.shops.length > 0) {
          setShops(data.shops);
        }
      }
    } catch (err) {
      console.warn('Shops fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/shops', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shopCode: shopCode.trim().toUpperCase(),
          name: name.trim(),
          district: district.trim(),
          taluk: taluk.trim() || undefined,
          locality: locality.trim() || undefined,
          address: address.trim(),
          pincode: pincode.trim(),
          phoneDisplay: phoneDisplay.trim(),
          openingHours: { morning: '08:30 - 12:30', afternoon: '15:00 - 19:00' },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to create shop');
      }

      await fetchShops();
      setShowAddModal(false);
      setShopCode('');
      setName('');
      setAddress('');
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
            {language === 'ta' ? 'நியாயவிலைக் கடைகள் மேலாண்மை' : 'Fair Price Shop Management'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{language === 'ta' ? 'அனைத்து மாதிரி நியாயவிலைக் கடைகள் மற்றும் கவுண்டர் அமைப்புகள்.' : 'Configure demonstration shop locations, opening hours, and active counters.'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              State Fair Price Shop Directory
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchShops}
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
            <span>{language === 'ta' ? 'புதிய கடை சேர்க்க' : 'Add Demo Shop'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Shop Name</th>
              <th className="py-3 px-4">District / Taluk</th>
              <th className="py-3 px-4">Assigned Cards</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E1]">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">{shop.shopCode}</td>
                <td className="py-3 px-4 font-semibold text-[#222222]">
                  <div>{shop.name}</div>
                  <div className="text-[10px] text-[#666666]">{shop.address}</div>
                </td>
                <td className="py-3 px-4 text-[#555555]">{shop.district} {shop.taluk ? `/ ${shop.taluk}` : ''}</td>
                <td className="py-3 px-4 font-mono text-[#222222]">{shop.assignedCardsCount ?? 0} Cards</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F6B45]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active (Demo)</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Shop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D6D9DC] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-2">
              <h3 className="font-bold text-sm text-[#222222]">Register Demo Shop</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#888888] hover:text-[#222222]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-[#A12622] rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateShop} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Shop Code</label>
                  <input
                    type="text"
                    value={shopCode}
                    onChange={(e) => setShopCode(e.target.value)}
                    placeholder="DEMO-CHN-004"
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Chennai"
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">Shop Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SRQMS Demo Fair Price Shop 004"
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Taluk</label>
                  <input
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    placeholder="Egmore"
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="Kilpauk"
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">Full Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="14 Millers Road, Kilpauk, Chennai - 600010"
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  required
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
                  {submitting ? 'Registering...' : 'Register Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
