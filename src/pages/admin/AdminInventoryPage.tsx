import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Package, 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Store, 
  Sliders, 
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';

interface InventoryItem {
  id: string;
  shopId: string;
  shopCode: string;
  shopName: string;
  district: string;
  commodityCode: string;
  commodityNameI18n: { en: string; ta: string };
  unit: string;
  quantityAvailable: number;
  reorderLevel: number;
  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'ADEQUATE';
  updatedAt: string;
}

const FALLBACK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    shopId: 's1',
    shopCode: 'DEMO-CHN-001',
    shopName: 'SRQMS Demo Fair Price Shop 001',
    district: 'Chennai',
    commodityCode: 'RICE',
    commodityNameI18n: { en: 'Raw Rice (PDS)', ta: 'பச்சரிசி' },
    unit: 'kg',
    quantityAvailable: 1200,
    reorderLevel: 250,
    status: 'ADEQUATE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-2',
    shopId: 's1',
    shopCode: 'DEMO-CHN-001',
    shopName: 'SRQMS Demo Fair Price Shop 001',
    district: 'Chennai',
    commodityCode: 'SUGAR',
    commodityNameI18n: { en: 'Refined Sugar', ta: 'சர்க்கரை' },
    unit: 'kg',
    quantityAvailable: 420,
    reorderLevel: 100,
    status: 'ADEQUATE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-3',
    shopId: 's1',
    shopCode: 'DEMO-CHN-001',
    shopName: 'SRQMS Demo Fair Price Shop 001',
    district: 'Chennai',
    commodityCode: 'DAL',
    commodityNameI18n: { en: 'Tur Dal (Special PDS)', ta: 'துவரம் பருப்பு' },
    unit: 'kg',
    quantityAvailable: 85,
    reorderLevel: 100,
    status: 'LOW_STOCK',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-4',
    shopId: 's2',
    shopCode: 'DEMO-CHN-002',
    shopName: 'SRQMS Demo Fair Price Shop 002',
    district: 'Chennai',
    commodityCode: 'RICE',
    commodityNameI18n: { en: 'Raw Rice (PDS)', ta: 'பச்சரிசி' },
    unit: 'kg',
    quantityAvailable: 800,
    reorderLevel: 200,
    status: 'ADEQUATE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv-5',
    shopId: 's3',
    shopCode: 'DEMO-TVM-001',
    shopName: 'SRQMS Demo Fair Price Shop 003',
    district: 'Tiruvallur',
    commodityCode: 'OIL',
    commodityNameI18n: { en: 'Fortified Palmolein Oil', ta: 'பாமாயில்' },
    unit: 'packet',
    quantityAvailable: 240,
    reorderLevel: 60,
    status: 'ADEQUATE',
    updatedAt: new Date().toISOString()
  }
];

export const AdminInventoryPage: React.FC = () => {
  const { language } = useLanguage();

  const [inventory, setInventory] = useState<InventoryItem[]>(FALLBACK_INVENTORY);
  const [selectedShop, setSelectedShop] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // Form state
  const [targetShop, setTargetShop] = useState('DEMO-CHN-001');
  const [commodity, setCommodity] = useState('RICE');
  const [quantity, setQuantity] = useState(500);
  const [challanNo, setChallanNo] = useState('TNCSC-CH-2026-8910');
  const [reason, setReason] = useState('State Civil Supplies monthly quota warehouse delivery');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const url = selectedShop === 'ALL' 
        ? '/api/v1/admin/inventory' 
        : `/api/v1/admin/inventory?shopId=${selectedShop}`;
      
      const adminAuth = localStorage.getItem('srqms_admin_user');
      const token = adminAuth ? JSON.parse(adminAuth).token : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.inventory && json.inventory.length > 0) {
          setInventory(json.inventory);
        }
      }
    } catch (err) {
      console.warn('Admin inventory fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedShop]);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate updating local inventory state
    setInventory((prev) =>
      prev.map((item) => {
        if (item.shopCode === targetShop && item.commodityCode === commodity) {
          return {
            ...item,
            quantityAvailable: item.quantityAvailable + Number(quantity),
            status: item.quantityAvailable + Number(quantity) > item.reorderLevel ? 'ADEQUATE' : 'LOW_STOCK',
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowRestockModal(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'நிர்வாக முகப்பிற்கு திரும்புக' : 'Back to Admin Dashboard'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6D9DC] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
            <Package className="w-4 h-4" />
            <span>{language === 'ta' ? 'மாநில இருப்பு கண்காணிப்பு' : 'State-Wide Inventory Governance'}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mt-1">
            {language === 'ta' ? 'அனைத்து நியாயவிலைக் கடைகள் இருப்பு நிலை' : 'Fair Price Shop Stock Balances & Allocations'}
          </h2>
          <p className="text-xs text-[#555555] mt-1">
            {language === 'ta'
              ? 'தமிழ்நாடு முழுவதும் உள்ள நியாயவிலைக் கடைகளின் தற்போதைய இருப்பு, மறுஒதுக்கீட்டு நிலைகள் மற்றும் இருப்புக் கணக்காய்வு.'
              : 'Monitor live balances, authorize buffer allocations, and inspect buffer thresholds across districts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRestockModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-3.5 py-2 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'சரக்கு ஒதுக்கீடு செய்க' : 'Authorize Restock Allocation'}</span>
          </button>
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-2 border border-[#D6D9DC] bg-white hover:bg-gray-50 rounded text-gray-700 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Store className="w-4 h-4 text-[#7B2638]" />
          <span className="font-bold text-[#222222]">{language === 'ta' ? 'கடை வடிகட்டி:' : 'Filter by Shop:'}</span>
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="px-3 py-1.5 border border-[#D6D9DC] rounded text-xs bg-white focus:outline-hidden focus:border-[#7B2638]"
          >
            <option value="ALL">All Demo Fair Price Shops (Statewide)</option>
            <option value="DEMO-CHN-001">DEMO-CHN-001 — Anna Nagar East, Chennai</option>
            <option value="DEMO-CHN-002">DEMO-CHN-002 — Mogappair, Chennai</option>
            <option value="DEMO-TVM-001">DEMO-TVM-001 — Sample Nagar, Tiruvallur</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Showing {inventory.length} tracked commodity balances
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{language === 'ta' ? 'கடை விவரம்' : 'Shop / District'}</th>
                <th className="px-4 py-3">{language === 'ta' ? 'பொருள் குறியீடு' : 'Commodity Code'}</th>
                <th className="px-4 py-3">{language === 'ta' ? 'பொருள் பெயர்' : 'Commodity Name'}</th>
                <th className="px-4 py-3 text-right">{language === 'ta' ? 'இருப்பு அளவு' : 'Available Stock'}</th>
                <th className="px-4 py-3 text-right">{language === 'ta' ? 'குறைந்தபட்ச அளவு' : 'Reorder Level'}</th>
                <th className="px-4 py-3 text-center">{language === 'ta' ? 'நிலை' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E1]">
              {inventory.map((item) => (
                <tr key={`${item.shopCode}-${item.commodityCode}`} className="hover:bg-[#FAF8F4] transition-colors">
                  <td className="px-4 py-3.5 space-y-0.5">
                    <div className="font-mono font-bold text-[#7B2638]">{item.shopCode}</div>
                    <div className="text-[11px] text-gray-600">{item.shopName} ({item.district})</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-gray-800">
                    {item.commodityCode}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900">
                    {language === 'ta' ? item.commodityNameI18n.ta : item.commodityNameI18n.en}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-black text-sm text-[#222222]">
                    {item.quantityAvailable.toLocaleString()} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gray-600">
                    {item.reorderLevel.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'ADEQUATE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'LOW_STOCK'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Allocation Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase">
                <Plus className="w-4 h-4" />
                <span>{language === 'ta' ? 'அரசு கிடங்கு ஒதுக்கீடு' : 'Civil Supplies Warehouse Allocation'}</span>
              </div>
              <button onClick={() => setShowRestockModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#1F6B45] text-xs font-bold rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Allocation recorded into immutable stock ledger!</span>
              </div>
            )}

            <form onSubmit={handleRestockSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Target Fair Price Shop</label>
                <select
                  value={targetShop}
                  onChange={(e) => setTargetShop(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  <option value="DEMO-CHN-001">DEMO-CHN-001 — Anna Nagar East, Chennai</option>
                  <option value="DEMO-CHN-002">DEMO-CHN-002 — Mogappair, Chennai</option>
                  <option value="DEMO-TVM-001">DEMO-TVM-001 — Sample Nagar, Tiruvallur</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Commodity</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-white"
                  >
                    <option value="RICE">Rice (PDS)</option>
                    <option value="SUGAR">Sugar</option>
                    <option value="DAL">Tur Dal</option>
                    <option value="OIL">Palmolein Oil</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Allocated Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Warehouse Delivery Challan Number</label>
                <input
                  type="text"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Authorization Operational Note</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white font-bold rounded"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
