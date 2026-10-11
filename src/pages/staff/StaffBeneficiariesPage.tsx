import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Users, ArrowLeft, Search, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface Beneficiary {
  id: string;
  cardNumber: string;
  category: string;
  headName: string;
  familyMembers: number;
  locality: string;
  demoMobileMasked: string;
}

const FALLBACK_BENEFICIARIES: Beneficiary[] = [
  { id: '1', cardNumber: 'DEMO-TN-0001', headName: 'Demo Beneficiary One', category: 'PHH', familyMembers: 4, locality: 'Anna Nagar East', demoMobileMasked: '******8821' },
  { id: '2', cardNumber: 'DEMO-TN-0002', headName: 'Demo Beneficiary Two', category: 'AAY', familyMembers: 3, locality: 'Anna Nagar East', demoMobileMasked: '******1092' },
  { id: '3', cardNumber: 'DEMO-TN-0003', headName: 'Demo Beneficiary Three', category: 'NPHH', familyMembers: 5, locality: 'Anna Nagar East', demoMobileMasked: '******5541' },
  { id: '4', cardNumber: 'DEMO-TN-0004', headName: 'Demo Beneficiary Four', category: 'PHH', familyMembers: 2, locality: 'Anna Nagar East', demoMobileMasked: '******3311' },
  { id: '5', cardNumber: 'DEMO-TN-0005', headName: 'Demo Beneficiary Five', category: 'NPHH-S', familyMembers: 1, locality: 'Anna Nagar East', demoMobileMasked: '******9900' }
];

export const StaffBeneficiariesPage: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(FALLBACK_BENEFICIARIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [staffUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_staff_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchBeneficiaries = async (queryStr = '') => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const params = new URLSearchParams();
      if (queryStr) params.append('q', queryStr);

      const res = await fetch(`/api/v1/staff/beneficiaries?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.beneficiaries && data.beneficiaries.length > 0) {
          setBeneficiaries(data.beneficiaries);
        } else if (queryStr) {
          setBeneficiaries([]);
        }
      } else {
        // Fallback filter
        const filtered = FALLBACK_BENEFICIARIES.filter(
          (b) => b.cardNumber.includes(queryStr.toUpperCase()) || b.headName.toLowerCase().includes(queryStr.toLowerCase())
        );
        setBeneficiaries(filtered);
      }
    } catch {
      const filtered = FALLBACK_BENEFICIARIES.filter(
        (b) => b.cardNumber.includes(queryStr.toUpperCase()) || b.headName.toLowerCase().includes(queryStr.toLowerCase())
      );
      setBeneficiaries(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries(search);
  }, [search]);

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
            {language === 'ta' ? 'கடை பயனாளிகள் பட்டியல்' : 'Assigned Beneficiary Directory'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{staffUser?.shopName || 'Fair Price Shop 001 (Anna Nagar East)'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Synthetic Demo Cards (Masked PII)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ta' ? 'அட்டை எண் அல்லது பெயர்...' : 'Search card or name...'}
              className="pl-9 pr-3 py-1.5 border border-[#D6D9DC] rounded text-xs bg-white w-56 focus:outline-none focus:border-[#7B2638]"
            />
          </div>
          <button
            onClick={() => fetchBeneficiaries(search)}
            disabled={loading}
            className="p-1.5 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
        </div>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="bg-white border border-[#D6D9DC] rounded-lg p-8 text-center text-xs text-[#666666]">
          {language === 'ta' 
            ? 'பொருந்தும் பயனாளிகள் எவரும் காணப்படவில்லை.' 
            : 'No matching beneficiaries found for this query.'}
        </div>
      ) : (
        <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
                  <th className="py-3 px-4">Card Number</th>
                  <th className="py-3 px-4">Family Head Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Family Members</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Contact (Masked)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8E1]">
                {beneficiaries.map((b) => (
                  <tr key={b.cardNumber} className="hover:bg-[#FAF8F4]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">{b.cardNumber}</td>
                    <td className="py-3 px-4 font-semibold text-[#222222]">{b.headName}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-[#F6F3EA] px-2 py-0.5 rounded text-[#7B2638] font-bold border border-[#EBE8E1]">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#555555]">{b.familyMembers} persons</td>
                    <td className="py-3 px-4 text-[#555555]">{b.locality}</td>
                    <td className="py-3 px-4 font-mono text-[#888888]">{b.demoMobileMasked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
