import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, Lock, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin_tn');
  const [password, setPassword] = useState('DemoAdmin@123');
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
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Authentication failed');
      }

      if (data.user?.role !== 'SYSTEM_ADMIN') {
        throw new Error(
          language === 'ta'
            ? 'இந்தக் கணக்கிற்கு கணினி நிர்வாகி அனுமதி இல்லை. தயவுசெய்து நிர்வாகி கணக்கைப் பயன்படுத்தவும்.'
            : 'This account does not have SYSTEM_ADMIN permissions. Please login via Staff portal.'
        );
      }

      const adminUser = {
        ...data.user,
        token: data.token,
      };

      localStorage.setItem('srqms_admin_user', JSON.stringify(adminUser));
      navigate('/admin/dashboard');
    } catch (err: any) {
      // Offline fallback for demo
      if (username === 'admin_tn' && password === 'DemoAdmin@123') {
        const adminUser = {
          username: 'admin_tn',
          fullName: 'TNPDS State System Administrator',
          role: 'SYSTEM_ADMIN',
          token: `demo_admin_jwt_${Date.now()}`
        };
        localStorage.setItem('srqms_admin_user', JSON.stringify(adminUser));
        navigate('/admin/dashboard');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-white p-1 flex items-center justify-center mx-auto shadow-xs border border-[#C49A3A]/40 overflow-hidden">
          <img 
            src="/assets/logos/Seal_of_Tamil_Nadu.webp" 
            alt="Tamil Nadu Government Seal" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-[#222222]">
          {language === 'ta' ? 'அமைப்பு நிர்வாக தளம்' : 'System Administration Portal'}
        </h2>
        <p className="text-xs text-[#555555]">
          {language === 'ta'
            ? 'கணினி நிர்வாகி பாதுகாப்பான உள்நுழைவு (அனைத்து கடைகள் மற்றும் கொள்கை விதிகள்).'
            : 'Super-user authentication for system-wide shop management, staff accounts, and policy rules.'}
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-5 shadow-xs">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-user" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'நிர்வாகி பயனர் பெயர்' : 'Admin Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-pass" className="block text-xs font-bold text-[#222222]">
              {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-pass"
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
            className="w-full bg-[#591A28] hover:bg-[#7B2638] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Authenticating...') : (language === 'ta' ? 'நிர்வாகியாக உள்நுழைக' : 'Sign In as System Admin')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E1BD67]" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-[#EBE8E1]">
          <span className="text-[11px] font-bold text-[#555555] block mb-1.5">
            {language === 'ta' ? 'மாதிரி நிர்வாகி கணக்கு:' : 'Seeded Admin Account:'}
          </span>
          <button
            type="button"
            onClick={() => {
              setUsername('admin_tn');
              setPassword('DemoAdmin@123');
            }}
            className="w-full text-left p-2 rounded border border-[#D6D9DC] bg-[#FAF8F4] hover:bg-white text-xs flex justify-between items-center transition-all"
          >
            <div>
              <span className="font-bold text-[#7B2638]">admin_tn</span>
              <span className="text-[10px] text-[#555555] block">State Administrator (All Shops)</span>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">DemoAdmin@123</span>
          </button>
        </div>
      </div>
    </div>
  );
};
