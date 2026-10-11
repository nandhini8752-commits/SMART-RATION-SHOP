import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Store, 
  MapPin, 
  Clock, 
  Users, 
  Package, 
  Ticket, 
  MessageSquareWarning, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';

interface ShopStock {
  code: string;
  nameEn: string;
  nameTa: string;
  quantity: number;
  unit: string;
  status: 'AMPLE' | 'NORMAL' | 'LOW';
}

export const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { language } = useLanguage();

  const [shopData, setShopData] = useState<any | null>(null);
  const [waitingCount, setWaitingCount] = useState(4);
  const [currentServing, setCurrentServing] = useState<string | null>('TK-101');
  const [stockList, setStockList] = useState<ShopStock[]>([
    { code: 'RICE', nameEn: 'Rice (Common/Fine)', nameTa: 'அரிசி (பொது/சன்னம்)', quantity: 200, unit: 'kg', status: 'AMPLE' },
    { code: 'SUGAR', nameEn: 'Sugar', nameTa: 'சர்க்கரை', quantity: 40, unit: 'kg', status: 'NORMAL' },
    { code: 'WHEAT', nameEn: 'Wheat', nameTa: 'கோதுமை', quantity: 50, unit: 'kg', status: 'NORMAL' },
    { code: 'TUR_DAL', nameEn: 'Tur Dal (Pulses)', nameTa: 'துவரம் பருப்பு', quantity: 30, unit: 'kg', status: 'NORMAL' },
    { code: 'PALMOLEIN_OIL', nameEn: 'Palmolein Oil', nameTa: 'பாமாயில்', quantity: 40, unit: 'litre', status: 'NORMAL' },
    { code: 'KEROSENE', nameEn: 'Kerosene', nameTa: 'மண்ணெண்ணெய்', quantity: 20, unit: 'litre', status: 'LOW' },
  ]);

  useEffect(() => {
    let active = true;
    const fetchAvailability = async () => {
      try {
        const id = shopId || 'DEMO-CHN-001';
        const res = await fetch(`/api/v1/public/shops/${id}/availability`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.shop) {
            setShopData(json.shop);
            if (json.queue) {
              setWaitingCount(json.queue.waitingCount ?? 0);
              if (json.queue.currentlyServing && json.queue.currentlyServing.length > 0) {
                setCurrentServing(json.queue.currentlyServing[0].tokenNumber);
              } else {
                setCurrentServing(null);
              }
            }
            if (json.stock && json.stock.length > 0) {
              setStockList(json.stock.map((s: any) => ({
                code: s.commodityCode,
                nameEn: s.nameI18n?.en || s.commodityCode,
                nameTa: s.nameI18n?.ta || s.commodityCode,
                quantity: parseFloat(s.quantityAvailable || '0'),
                unit: s.unit || 'kg',
                status: parseFloat(s.quantityAvailable || '0') < 20 ? 'LOW' : 'AMPLE',
              })));
            }
          }
        }
      } catch (err) {
        console.warn('Using demo shop detail fallback', err);
      }
    };

    fetchAvailability();
    return () => { active = false; };
  }, [shopId]);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/shops" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'அனைத்து கடைகள் பட்டியலுக்கு திரும்புக' : 'Back to Shop Directory'}</span>
        </Link>
      </div>

      {/* Shop Profile Header */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE8E1] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
                {shopId || 'DEMO-CHN-001'}
              </span>
              <span className="text-[11px] font-bold text-[#1F6B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {language === 'ta' ? 'கடை திறந்துள்ளது' : 'Open for Distribution'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#222222]">
              {shopData?.name || 'SRQMS Demo Fair Price Shop 001'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#555555]">
              <MapPin className="w-3.5 h-3.5 text-[#7B2638]" />
              <span>{shopData?.address ? `${shopData.address} - ${shopData.pincode || '600102'}` : '12 Sample Street, Anna Nagar East, Chennai - 600102'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/queue/create"
              className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-3.5 py-2 rounded transition-colors shadow-xs"
            >
              <Ticket className="w-3.5 h-3.5 text-[#E1BD67]" />
              <span>{language === 'ta' ? 'டோக்கன் பெறுக' : 'Get Queue Token'}</span>
            </Link>
            <Link
              to="/complaints/new"
              className="inline-flex items-center gap-1.5 bg-[#FAF8F4] hover:bg-white text-[#7B2638] text-xs font-semibold px-3 py-2 rounded border border-[#D6D9DC] transition-colors"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'புகார் அளிக்க' : 'Grievance'}</span>
            </Link>
          </div>
        </div>

        {/* Operating Timings & Queue Status Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-3.5 rounded text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#7B2638]">
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'பணி நேரம்' : 'Working Hours'}</span>
            </div>
            <p className="text-[#555555]">09:00 - 13:00, 14:00 - 17:00</p>
            <p className="text-[10px] text-[#777777]">
              {language === 'ta' ? 'திங்கள் - வெள்ளி (சனி அரை நாள்)' : 'Mon - Fri (Sat Half Day)'}
            </p>
          </div>

          <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-3.5 rounded text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#7B2638]">
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'நிகழ்நேர வரிசை' : 'Live Queue Status'}</span>
            </div>
            <p className="font-bold text-[#222222] font-mono text-sm">
              {waitingCount} {language === 'ta' ? 'காத்திருப்போர்' : 'in waiting line'}
            </p>
            <p className="text-[10px] text-[#555555]">
              {language === 'ta' ? 'தற்போது சேவை பெறும் டோக்கன்:' : 'Now Serving:'} <span className="font-bold text-[#7B2638]">{currentServing}</span>
            </p>
          </div>

          <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-3.5 rounded text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#7B2638]">
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'சேவை கவுண்டர்கள்' : 'Active Counters'}</span>
            </div>
            <p className="font-semibold text-[#1F6B45]">
              Counter 1 & Counter 2 Active
            </p>
            <p className="text-[10px] text-[#555555]">
              FIFO Dispatch Active
            </p>
          </div>
        </div>
      </div>

      {/* Stock Availability Snapshot Table */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#7B2638]" />
            <h3 className="font-bold text-base text-[#222222]">
              {language === 'ta' ? 'மாதிரி பொருட்கள் இருப்பு நிலை' : 'Demonstration Commodity Stock Availability'}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#8A5300] bg-[#FFF9E6] px-2 py-0.5 rounded border border-[#E6D7A8]">
            {language === 'ta' ? 'மாதிரி இருப்பு விவரம்' : 'Sample Snapshot'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'பொருள் பெயர்' : 'Commodity'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'இருப்பு அளவு' : 'Available Stock'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'அளவு அலகு' : 'Unit'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'நிலை' : 'Availability Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E1]">
              {stockList.map((item, idx) => (
                <tr key={item.code} className="hover:bg-[#FAF8F4]/50 transition-colors">
                  <td className="py-2.5 px-3 text-[#777777] font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#222222]">
                    {language === 'ta' ? item.nameTa : item.nameEn}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#7B2638]">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-[#555555]">{item.unit}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F6B45]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'இருப்பில் உள்ளது' : 'In Stock'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
