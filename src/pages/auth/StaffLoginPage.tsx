import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { UserCheck, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const StaffLoginPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('operator_anna');
  const [password, setPassword] = useState('DemoOperator@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error?.message || data.error ||
          (language === 'ta'
            ? 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல். மாதிரி கணக்குகளைப் பயன்படுத்தவும்.'
            : 'Invalid credentials. Please use seeded demo staff accounts.')
        );
      }

      const staffUser = {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        role: data.user.role,
        shopId: data.user.shopId,
        shopCode: data.user.shopCode || 'DEMO-CHN-001',
        shopName: data.user.shopName || 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)',
        token: data.token,
      };

      localStorage.setItem('srqms_staff_user', JSON.stringify(staffUser));
      navigate('/staff/dashboard');
    } catch (err: any) {
      // Local fallback for offline robustness
      if (
        (username === 'operator_anna' && password === 'DemoOperator@123') ||
        (username === 'supervisor_anna' && password === 'DemoSupervisor@123')
      ) {
        const staffUser = {
          username,
          fullName: username === 'operator_anna' ? 'K. Rajavel (FPS Operator)' : 'M. Shanthi (Area Supervisor)',
          role: username === 'operator_anna' ? 'SHOP_OPERATOR' : 'SHOP_SUPERVISOR',
          shopCode: 'DEMO-CHN-001',
          shopName: 'SRQMS Demo Fair Price Shop 001 (Anna Nagar East)',
          token: `demo_jwt_token_${Date.now()}`,
        };
        localStorage.setItem('srqms_staff_user', JSON.stringify(staffUser));
        navigate('/staff/dashboard');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[#FAF0F2] p-1 flex items-center justify-center mx-auto shadow-xs border border-[#C49A3A]/40 overflow-hidden">
          <img 
            src="/assets/logos/Seal_of_Tamil_Nadu.webp" 
            alt="Tamil Nadu Government Seal" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-[#222222]">
          {language === 'ta' ? 'பணியாளர் உள்நுழைவு' : 'Fair Price Shop Staff Portal'}
        </h2>
        <p className="text-xs text-[#555555]">
          {language === 'ta'
            ? 'கடை விற்பனையாளர் மற்றும் மேற்பார்வையாளர் பாதுகாப்பான உள்நுழைவு.'
            : 'Authorized operator & supervisor authentication for assigned Fair Price Shop.'}
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-5 shadow-xs">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="staff-user" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'பயனர் பெயர்' : 'Staff Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="staff-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="staff-pass" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="staff-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#A12622] flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Signing In...') : (language === 'ta' ? 'உள்நுழைக' : 'Sign In to Staff Console')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-[#EBE8E1] space-y-2">
          <span className="text-[11px] font-bold text-[#555555]">
            {language === 'ta' ? 'மாதிரி பணியாளர் கணக்குகள்:' : 'Seeded Demo Credentials:'}
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('operator_anna', 'DemoOperator@123')}
              className="w-full text-left p-2 rounded border border-[#D6D9DC] bg-[#FAF8F4] hover:bg-white text-xs flex justify-between items-center transition-all"
            >
              <div>
                <span className="font-bold text-[#7B2638]">operator_anna</span>
                <span className="text-[10px] text-[#555555] block">Shop Operator (Counter 1 & 2)</span>
              </div>
              <span className="text-[10px] font-mono text-[#888888]">DemoOperator@123</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('supervisor_anna', 'DemoSupervisor@123')}
              className="w-full text-left p-2 rounded border border-[#D6D9DC] bg-[#FAF8F4] hover:bg-white text-xs flex justify-between items-center transition-all"
            >
              <div>
                <span className="font-bold text-[#7B2638]">supervisor_anna</span>
                <span className="text-[10px] text-[#555555] block">Area Supervisor (Stock & Ledger)</span>
              </div>
              <span className="text-[10px] font-mono text-[#888888]">DemoSupervisor@123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
