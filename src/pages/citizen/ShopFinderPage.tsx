import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Store, MapPin, Clock, Search, Filter, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface DemoShop {
  id: string;
  shopCode: string;
  name: string;
  district: string;
  taluk: string;
  locality: string;
  address: string;
  pincode: string;
  status: string;
  waitingCount: number;
}

const DEFAULT_DEMO_SHOPS: DemoShop[] = [
  {
    id: 'DEMO-CHN-001',
    shopCode: 'DEMO-CHN-001',
    name: 'SRQMS Demo Fair Price Shop 001',
    district: 'Chennai',
    taluk: 'Anna Nagar',
    locality: 'Anna Nagar East',
    address: '12 Sample Street, Anna Nagar East, Chennai',
    pincode: '600102',
    status: 'OPEN',
    waitingCount: 4
  },
  {
    id: 'DEMO-CHN-002',
    shopCode: 'DEMO-CHN-002',
    name: 'SRQMS Demo Fair Price Shop 002',
    district: 'Chennai',
    taluk: 'Ambattur',
    locality: 'Mogappair Demo Zone',
    address: '5 Example Avenue, Mogappair, Chennai',
    pincode: '600037',
    status: 'OPEN',
    waitingCount: 2
  },
  {
    id: 'DEMO-TVM-001',
    shopCode: 'DEMO-TVM-001',
    name: 'SRQMS Demo Fair Price Shop 003',
    district: 'Tiruvallur',
    taluk: 'Avadi Demo Taluk',
    locality: 'Sample Nagar',
    address: '8 Prototype Road, Sample Nagar',
    pincode: '600054',
    status: 'OPEN',
    waitingCount: 1
  }
];

export const ShopFinderPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [shops, setShops] = useState<DemoShop[]>(DEFAULT_DEMO_SHOPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchShops = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
        if (searchQuery.trim()) params.append('q', searchQuery.trim());
        const res = await fetch(`/api/v1/public/shops?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.data && json.data.length > 0) {
            setShops(json.data.map((s: any) => ({
              id: s.id,
              shopCode: s.shopCode,
              name: s.name,
              district: s.district,
              taluk: s.taluk,
              locality: s.locality,
              address: s.address,
              pincode: s.pincode,
              status: s.isActive ? 'OPEN' : 'CLOSED',
              waitingCount: parseInt(s.waitingCount || '0', 10),
            })));
          }
        }
      } catch (err) {
        console.warn('Using demo shops fallback', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchShops();
    return () => { active = false; };
  }, [selectedDistrict, searchQuery]);

  // Filter shops locally as instant refinement
  const filteredShops = shops.filter((shop) => {
    const matchesSearch = 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.shopCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.taluk.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = selectedDistrict === 'ALL' || shop.district === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <Store className="w-4 h-4" />
          <span>{language === 'ta' ? 'கடை வழிகாட்டி' : 'Fair Price Shop Directory'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'நியாயவிலைக் கடைகள் கண்டறிதல்' : 'Find Your Ration Shop'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'மாவட்டம், வட்டம் அல்லது பகுதி வாரியாக மாதிரி நியாயவிலைக் கடைகளைத் தேடவும்.'
            : 'Search and inspect demonstration shops by district, locality, or code.'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#FAF8F4] border border-[#E5E0D5] rounded-lg p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ta' ? 'கடை எண், பகுதி அல்லது பெயர் கொண்டு தேடுக...' : 'Search by shop code, name, or locality...'}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#555555] shrink-0" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-white border border-[#D6D9DC] rounded text-xs px-3 py-2 text-[#222222] focus:outline-hidden focus:border-[#7B2638]"
          >
            <option value="ALL">{language === 'ta' ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
            <option value="Chennai">Chennai (சென்னை)</option>
            <option value="Tiruvallur">Tiruvallur (திருவள்ளூர்)</option>
          </select>
        </div>
      </div>

      {/* Shop Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShops.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded border border-[#D6D9DC] text-xs text-[#666666]">
            {language === 'ta' ? 'பொருந்தும் கடைகள் எதுவும் கிடைக்கவில்லை.' : 'No matching demonstration shops found.'}
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white border border-[#D6D9DC] rounded-lg p-5 flex flex-col justify-between hover:border-[#7B2638] hover:shadow-xs transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
                    {shop.shopCode}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F6B45]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B45] animate-pulse"></span>
                    <span>{shop.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#222222] leading-tight">
                    {shop.name}
                  </h3>
                  <div className="flex items-start gap-1 text-xs text-[#555555] mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7B2638] shrink-0 mt-0.5" />
                    <span>{shop.address} - {shop.pincode}</span>
                  </div>
                </div>

                {/* Queue Summary Snapshot */}
                <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-2.5 rounded text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#555555]">
                    <Users className="w-3.5 h-3.5 text-[#7B2638]" />
                    <span>{language === 'ta' ? 'காத்திருக்கும் டோக்கன்கள்:' : 'Active Queue:'}</span>
                  </div>
                  <span className="font-bold font-mono text-[#7B2638]">
                    {shop.waitingCount} {language === 'ta' ? 'நபர்கள்' : 'waiting'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EFEB]">
                <Link
                  to={`/shops/${shop.shopCode}`}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#FAF8F4] hover:bg-[#7B2638] hover:text-white text-[#7B2638] font-semibold text-xs py-2 rounded border border-[#D6D9DC] transition-all"
                >
                  <span>{language === 'ta' ? 'கடை விவரம் & இருப்பு காண்க' : 'View Details & Stock'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
