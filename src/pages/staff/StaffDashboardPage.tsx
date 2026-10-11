import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  Ticket, 
  Store, 
  ArrowRight, 
  LogOut, 
  FileText, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  UserCheck,
  Settings
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [staffUser] = useState(() => {
    try {
      const saved = localStorage.getItem('srqms_staff_user');
      return saved ? JSON.parse(saved) : {
        username: 'operator_anna',
        fullName: 'K. Rajavel (FPS Operator)',
        role: 'SHOP_OPERATOR',
        shopCode: 'DEMO-CHN-001',
        shopName: 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)'
      };
    } catch {
      return {
        username: 'operator_anna',
        fullName: 'K. Rajavel (FPS Operator)',
        role: 'SHOP_OPERATOR',
        shopCode: 'DEMO-CHN-001',
        shopName: 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)'
      };
    }
  });

  const [metrics, setMetrics] = useState({
    waitingCount: 4,
    servingCount: 1,
    completedCount: 18,
    totalIssued: 23,
    avgServingMinutes: 3.5,
    lowStockCount: 1
  });
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      // Fetch queue snapshot
      const queueRes = await fetch('/api/v1/staff/queue', { headers });
      let queueData = null;
      if (queueRes.ok) {
        queueData = await queueRes.json();
      }

      // Fetch shift reports summary
      const reportsRes = await fetch('/api/v1/staff/reports/summary', { headers });
      let reportsData = null;
      if (reportsRes.ok) {
        reportsData = await reportsRes.json();
      }

      setMetrics((prev) => ({
        waitingCount: queueData?.summary?.waitingCount ?? prev.waitingCount,
        servingCount: queueData?.summary?.servingCount ?? prev.servingCount,
        completedCount: queueData?.summary?.completedCount ?? reportsData?.completedCount ?? prev.completedCount,
        totalIssued: queueData?.summary?.totalIssued ?? reportsData?.totalTokens ?? prev.totalIssued,
        avgServingMinutes: reportsData?.avgServingMinutes ?? prev.avgServingMinutes,
        lowStockCount: prev.lowStockCount
      }));
    } catch (err) {
      console.warn('Dashboard metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('srqms_staff_user');
    navigate('/staff/login');
  };

  return (
    <div className="space-y-6">
      {/* Staff Header */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
              {staffUser.shopCode}
            </span>
            <span className="text-[11px] font-bold text-[#1F6B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {staffUser.role}
            </span>
            <span className="text-[11px] text-[#666666] flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F6B45]" />
              TN-PDS Verified Shift
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#222222]">
            {staffUser.shopName}
          </h2>
          <div className="text-xs text-[#555555]">
            {language === 'ta' ? 'செயல்பாட்டு பொறுப்பாளர்:' : 'Logged in Operator:'} <strong className="text-[#222222]">{staffUser.fullName}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-[#555555] hover:bg-gray-100 border border-gray-200"
            title="Refresh shift counters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
            <span>{language === 'ta' ? 'புதுப்பி' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#A12622] hover:bg-red-50 border border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'வெளியேறுக' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span>{language === 'ta' ? 'வரிசையில் காத்திருப்போர்' : 'Currently Waiting'}</span>
            <Users className="w-4 h-4 text-[#7B2638]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#7B2638]">{metrics.waitingCount}</div>
          <div className="text-[10px] text-[#666666]">
            {language === 'ta' ? 'FIFO வரிசை முறை செயல்படுகிறது' : 'FIFO active queue'}
          </div>
        </div>

        <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span>{language === 'ta' ? 'இன்று சேவை பெற்றோர்' : 'Served Today'}</span>
            <CheckCircle2 className="w-4 h-4 text-[#1F6B45]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1F6B45]">{metrics.completedCount}</div>
          <div className="text-[10px] text-[#666666]">
            {language === 'ta' ? 'விநியோகம் நிறைவடைந்த டோக்கன்கள்' : 'Completed tokens'}
          </div>
        </div>

        <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span>{language === 'ta' ? 'சராசரி சேவை நேரம்' : 'Avg Service Time'}</span>
            <Clock className="w-4 h-4 text-[#C49A3A]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#222222]">{metrics.avgServingMinutes}m</div>
          <div className="text-[10px] text-[#666666]">
            {language === 'ta' ? 'டோக்கன் ஒன்றுக்கு சராசரி' : 'Per beneficiary token'}
          </div>
        </div>

        <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[#555555]">
            <span>{language === 'ta' ? 'குறைந்த இருப்பு எச்சரிக்கை' : 'Low Stock Alerts'}</span>
            <AlertTriangle className="w-4 h-4 text-[#8A5300]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#8A5300]">{metrics.lowStockCount}</div>
          <div className="text-[10px] text-[#666666]">
            {language === 'ta' ? 'மறு நிரப்பல் தேவை' : 'Reorder alert active'}
          </div>
        </div>
      </div>

      {/* Staff Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/staff/queue"
          className="bg-white border border-[#D6D9DC] hover:border-[#7B2638] rounded-lg p-5 flex flex-col justify-between space-y-3 group transition-all shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center group-hover:bg-[#7B2638] group-hover:text-white transition-colors">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#222222] group-hover:text-[#7B2638]">
              {language === 'ta' ? 'நிகழ்நேர வரிசை மேலாண்மை' : 'Live Multi-Counter Queue'}
            </h3>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'கவுண்டர் 1 மற்றும் 2 மூலம் டோக்கன்களை அழைத்தல், சேவை செய்தல், மற்றும் நிறைவு செய்தல்.'
                : 'FIFO call-next token dispatch, counter assignments, and dispensation workflows.'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold text-[#7B2638]">
            <span>{language === 'ta' ? 'வரிசையை நிர்வகிக்க' : 'Open Queue Desk'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/staff/inventory"
          className="bg-white border border-[#D6D9DC] hover:border-[#7B2638] rounded-lg p-5 flex flex-col justify-between space-y-3 group transition-all shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center group-hover:bg-[#7B2638] group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#222222] group-hover:text-[#7B2638]">
              {language === 'ta' ? 'பொருட்கள் இருப்பு மற்றும் வரவு' : 'Commodity Inventory & Restock'}
            </h3>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'அரிசி, சர்க்கரை, எண்ணெய் நடப்பு இருப்பு அளவுகள் மற்றும் மறு நிரப்பல் பதிவு.'
                : 'Real-time stock balance monitoring, reorder alerts, and stock adjustments.'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold text-[#7B2638]">
            <span>{language === 'ta' ? 'இருப்பைப் பார்க்க' : 'Manage Stock'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/staff/inventory/ledger"
          className="bg-white border border-[#D6D9DC] hover:border-[#7B2638] rounded-lg p-5 flex flex-col justify-between space-y-3 group transition-all shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center group-hover:bg-[#7B2638] group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#222222] group-hover:text-[#7B2638]">
              {language === 'ta' ? 'இருப்பு பரிவர்த்தனை தணிக்கை ஏடு' : 'Stock Movement Audit Ledger'}
            </h3>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'ஒவ்வொரு விநியோகம் மற்றும் வரவுக்கும் பதிவு செய்யப்பட்ட மாற்ற முடியாத தணிக்கை விவரங்கள்.'
                : 'Immutable signed ledger of all stock additions, deductions, and distribution items.'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold text-[#7B2638]">
            <span>{language === 'ta' ? 'ஏட்டைப் பார்க்க' : 'View Ledger'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/staff/beneficiaries"
          className="bg-white border border-[#D6D9DC] hover:border-[#7B2638] rounded-lg p-5 flex flex-col justify-between space-y-3 group transition-all shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center group-hover:bg-[#7B2638] group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#222222] group-hover:text-[#7B2638]">
              {language === 'ta' ? 'பயனாளிகள் பட்டியல்' : 'Beneficiary Directory'}
            </h3>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'கடைக்கு ஒதுக்கப்பட்ட குடும்ப அட்டைதாரர்கள் மற்றும் ஒதுக்கீட்டு வகை.'
                : 'Assigned family ration card holders, member counts, and card types.'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold text-[#7B2638]">
            <span>{language === 'ta' ? 'பயனாளிகளைப் பார்க்க' : 'View Beneficiaries'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/staff/settings"
          className="bg-white border border-[#D6D9DC] hover:border-[#7B2638] rounded-lg p-5 flex flex-col justify-between space-y-3 group transition-all shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center group-hover:bg-[#7B2638] group-hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#222222] group-hover:text-[#7B2638]">
              {language === 'ta' ? 'கடை அமைப்புகள்' : 'Shop Operations Settings'}
            </h3>
            <p className="text-xs text-[#555555]">
              {language === 'ta'
                ? 'கவுண்டர் எண்ணிக்கை, ஒலி எச்சரிக்கைகள் மற்றும் ரசீது அச்சு அமைப்புகளை உள்ளமைக்கவும்.'
                : 'Configure active dispensing counters, bell chime alerts, and receipt footer notes.'}
            </p>
          </div>
          <div className="pt-3 border-t border-[#F0EFEB] flex items-center justify-between text-xs font-bold text-[#7B2638]">
            <span>{language === 'ta' ? 'அமைப்புகளை மாற்ற' : 'Configure Settings'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};
