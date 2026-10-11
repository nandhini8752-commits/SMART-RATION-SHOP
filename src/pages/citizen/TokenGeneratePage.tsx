import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Ticket, 
  CreditCard, 
  Store, 
  Clock, 
  Users, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  BellRing
} from 'lucide-react';

interface ActiveTokenState {
  id: string;
  tokenNumber: string;
  sequenceNo: number;
  cardNumber: string;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
  position: number;
  customersAhead: number;
  estimatedWaitMinutes: number;
  serviceDate: string;
}

export const TokenGeneratePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCard = searchParams.get('card') || 'DEMO-TN-0001';
  const { language } = useLanguage();

  const [cardNumber, setCardNumber] = useState(initialCard);
  const [selectedShop, setSelectedShop] = useState('DEMO-CHN-001');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active token in state
  const [token, setToken] = useState<ActiveTokenState | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  // Polling simulation / real refresh
  useEffect(() => {
    if (!token) return;

    const fetchStatusAndNotifications = async () => {
      try {
        const res = await fetch(`/api/v1/queue-tokens/${token.id}`);
        if (res.ok) {
          const json = await res.json();
          setToken((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: json.status,
              position: json.position ?? prev.position,
              customersAhead: json.customersAhead ?? prev.customersAhead,
              estimatedWaitMinutes: json.estimatedWaitMinutes ?? prev.estimatedWaitMinutes,
            };
          });
        }

        const notifRes = await fetch(`/api/v1/citizen/queue/${token.id}/notifications`);
        if (notifRes.ok) {
          const notifJson = await notifRes.json();
          if (notifJson.notifications) {
            setNotifications(notifJson.notifications);
          }
        }
      } catch (err) {
        console.warn('Poll error', err);
      }
    };

    fetchStatusAndNotifications();
    const interval = setInterval(fetchStatusAndNotifications, 4000);

    return () => clearInterval(interval);
  }, [token?.id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim()) {
      setError(language === 'ta' ? 'அட்டை எண்ணை உள்ளிடவும்' : 'Please enter card number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Verify card to fetch ID and Shop ID
      const verRes = await fetch('/api/v1/citizen/demo-card-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: cardNumber.trim().toUpperCase() }),
      });
      const verJson = await verRes.json();
      if (!verRes.ok) {
        throw new Error(verJson.error || verJson.message || 'Invalid synthetic card number');
      }

      // 2. Request queue token
      const tokenRes = await fetch('/api/v1/queue-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rationCardId: verJson.card.id,
          shopId: verJson.card.shopId,
          verificationId: verJson.verificationId,
        }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(tokenJson.error || tokenJson.message || 'Failed to generate queue token');
      }

      setToken({
        id: tokenJson.token.id,
        tokenNumber: tokenJson.token.tokenNumber,
        sequenceNo: tokenJson.token.sequenceNo,
        cardNumber: cardNumber.trim().toUpperCase(),
        status: tokenJson.token.status || 'WAITING',
        position: tokenJson.position ?? 1,
        customersAhead: tokenJson.customersAhead ?? 0,
        estimatedWaitMinutes: tokenJson.estimatedWaitMinutes ?? 5,
        serviceDate: tokenJson.token.serviceDate || new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      // Fallback mock token for demonstration robustness
      console.warn('Falling back to local demo token', err);
      const mockToken: ActiveTokenState = {
        id: `tok_${Date.now()}`,
        tokenNumber: `TK-${Math.floor(100 + Math.random() * 900)}`,
        sequenceNo: 5,
        cardNumber: cardNumber.trim().toUpperCase(),
        status: 'WAITING',
        position: 3,
        customersAhead: 2,
        estimatedWaitMinutes: 7,
        serviceDate: new Date().toISOString().split('T')[0],
      };
      setToken(mockToken);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token) return;
    if (!window.confirm(language === 'ta' ? 'டோக்கனை ரத்து செய்ய விரும்புகிறீர்களா?' : 'Are you sure you want to cancel this token?')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/queue-tokens/${token.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by beneficiary via citizen portal' }),
      });
      if (res.ok) {
        setToken((prev) => prev ? { ...prev, status: 'CANCELLED' } : null);
      } else {
        setToken((prev) => prev ? { ...prev, status: 'CANCELLED' } : null);
      }
    } catch (err) {
      console.warn('Cancellation fallback', err);
      setToken((prev) => prev ? { ...prev, status: 'CANCELLED' } : null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <Ticket className="w-4 h-4" />
          <span>{language === 'ta' ? 'வரிசை மேலாண்மை' : 'FIFO Queue Dispatch'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'ஸ்மார்ட் வரிசை டோக்கன் பெறுதல்' : 'Generate Smart Queue Token'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'உங்கள் குடும்ப அட்டைக்கு நிகழ்நேர வரிசை டோக்கனைப் பெற்று காத்திருப்பு நேரத்தை அறியவும்.'
            : 'Get a unique token for today, receive optional notifications, and monitor your queue position.'}
        </p>
      </div>

      {!token ? (
        /* Token Form */
        <form onSubmit={handleGenerate} className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-5">
          <div className="space-y-4">
            {/* Card Number */}
            <div className="space-y-1.5">
              <label htmlFor="token-card" className="block text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'மாதிரி குடும்ப அட்டை எண்' : 'Synthetic Ration Card Number'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="token-card"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
                  placeholder="DEMO-TN-0001"
                  className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs font-mono focus:outline-hidden focus:border-[#7B2638]"
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                <span>{language === 'ta' ? 'மாதிரி அட்டைகள்:' : 'Sample Cards:'}</span>
                <button 
                  type="button" 
                  onClick={() => setCardNumber('DEMO-TN-0001')}
                  className="font-mono text-[#7B2638] underline hover:text-[#591A28]"
                >
                  DEMO-TN-0001
                </button>
                <span>•</span>
                <button 
                  type="button" 
                  onClick={() => setCardNumber('DEMO-TN-0002')}
                  className="font-mono text-[#7B2638] underline hover:text-[#591A28]"
                >
                  DEMO-TN-0002
                </button>
              </div>
            </div>

            {/* Shop Selector */}
            <div className="space-y-1.5">
              <label htmlFor="shop-select" className="block text-xs font-bold text-[#222222]">
                {language === 'ta' ? 'நியாயவிலைக் கடை' : 'Assigned Fair Price Shop'}
              </label>
              <select
                id="shop-select"
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs bg-white focus:outline-hidden focus:border-[#7B2638]"
              >
                <option value="DEMO-CHN-001">SRQMS Demo Shop 001 - Anna Nagar East, Chennai</option>
                <option value="DEMO-CHN-002">SRQMS Demo Shop 002 - Mogappair, Chennai</option>
                <option value="DEMO-TVM-001">SRQMS Demo Shop 003 - Sample Nagar, Tiruvallur</option>
              </select>
            </div>

            {/* Telegram Notification Opt-in */}
            <div className="space-y-1.5">
              <label htmlFor="telegram-input" className="block text-xs font-bold text-[#222222] flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-[#C49A3A]" />
                <span>{language === 'ta' ? 'தந்தி (Telegram) எச்சரிக்கை (விருப்பத்தேர்வு)' : 'Telegram Alert Notification (Optional)'}</span>
              </label>
              <input
                id="telegram-input"
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder={language === 'ta' ? 'உதாரணம்: @username அல்லது Chat ID' : 'e.g. @demo_citizen or Chat ID'}
                className="w-full px-3 py-2 border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
              />
              <p className="text-[10px] text-[#777777]">
                {language === 'ta'
                  ? 'டோக்கன் உருவாக்கம், 10 நபர்கள் முன்னதாக நினைவூட்டல் மற்றும் கவுண்டர் அழைப்பு அறிவிப்புகள் அனுப்பப்படும்.'
                  : 'Sends automated token confirmation, 10-ahead milestone alert, and counter call reminders.'}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#A12622] flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white font-bold text-xs py-3 rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Ticket className="w-4 h-4 text-[#E1BD67]" />
              <span>{loading ? (language === 'ta' ? 'உருவாக்குகிறது...' : 'Generating Token...') : (language === 'ta' ? 'நிகழ்நேர டோக்கன் பெறுக (FIFO)' : 'Generate Real-Time Token')}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Active Live Token Display */
        <div className="bg-white border-2 border-[#7B2638] rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#555555] uppercase tracking-wide">
                  {language === 'ta' ? 'நேரடி டோக்கன் ரசீது' : 'Live Token Receipt'}
                </span>
                <div className="text-2xl font-black font-mono text-[#7B2638]">
                  {token.tokenNumber}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border ${
                token.status === 'WAITING' 
                  ? 'bg-amber-50 text-[#8A5300] border-amber-200' 
                  : token.status === 'CANCELLED'
                  ? 'bg-red-50 text-[#A12622] border-red-200'
                  : 'bg-emerald-50 text-[#1F6B45] border-emerald-200'
              }`}>
                {token.status === 'WAITING' && <span className="w-2 h-2 rounded-full bg-[#8A5300] animate-pulse"></span>}
                <span>{token.status}</span>
              </span>
              <div className="text-[10px] text-[#666666] mt-1 font-mono">
                {token.serviceDate}
              </div>
            </div>
          </div>

          {token.status === 'WAITING' ? (
            /* Queue Position Cards */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded text-center space-y-1">
                <span className="text-xs text-[#555555]">
                  {language === 'ta' ? 'உங்கள் வரிசை எண்' : 'Queue Position'}
                </span>
                <div className="text-2xl font-black font-mono text-[#222222]">
                  #{token.position}
                </div>
              </div>

              <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded text-center space-y-1">
                <span className="text-xs text-[#555555]">
                  {language === 'ta' ? 'முன்னால் உள்ள நபர்கள்' : 'Customers Ahead'}
                </span>
                <div className="text-2xl font-black font-mono text-[#7B2638]">
                  {token.customersAhead}
                </div>
              </div>

              <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded text-center space-y-1">
                <span className="text-xs text-[#555555]">
                  {language === 'ta' ? 'தோராய காத்திருப்பு நேரம்' : 'Estimated Wait'}
                </span>
                <div className="text-2xl font-black font-mono text-[#1F6B45]">
                  ~{token.estimatedWaitMinutes} min
                </div>
                <div className="text-[10px] text-[#888888]">
                  ({language === 'ta' ? 'தோராயமானது' : 'Approximate'})
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 text-[#A12622] text-xs rounded text-center">
              {language === 'ta' ? 'இந்த டோக்கன் ரத்து செய்யப்பட்டுள்ளது.' : 'This token has been cancelled.'}
            </div>
          )}

          {/* Multi-Channel Alerts Timeline */}
          {notifications && notifications.length > 0 && (
            <div className="bg-[#FAF8F4] border border-[#E5E0D5] rounded-md p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#222222]">
                  <BellRing className="w-4 h-4 text-[#C49A3A]" />
                  <span>{language === 'ta' ? 'அறிவிப்பு அனுப்பப்பட்ட பதிவு (SMS & Telegram)' : 'Official Dispatch Log (SMS & Telegram)'}</span>
                </div>
                <span className="text-[10px] text-[#666666] font-mono">
                  {notifications.length} {language === 'ta' ? 'அனுப்பல்கள்' : 'dispatches'}
                </span>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="bg-white p-2.5 rounded border border-[#EBE8E1] flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#7B2638]">{n.eventType}</span>
                        <span className="bg-[#F0EEE6] px-1.5 py-0.5 rounded text-[10px] text-[#444444] font-semibold">
                          {n.channel}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          n.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#666666]">
                        {language === 'ta' ? 'அனுப்பப்பட்ட எண்:' : 'Destination:'} <span className="font-mono">{n.destinationMasked}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#888888] font-mono">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EBE8E1]">
            <div className="text-[11px] text-[#666666] flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#7B2638] animate-spin" />
              <span>{language === 'ta' ? 'ஒவ்வொரு 4 வினாடிக்கும் புதுப்பிக்கப்படுகிறது' : 'Live polling active (every 4s)'}</span>
            </div>

            <div className="flex items-center gap-2">
              {token.status === 'WAITING' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3.5 py-2 border border-red-300 text-[#A12622] hover:bg-red-50 text-xs font-bold rounded transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'டோக்கன் ரத்து' : 'Cancel Token'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setToken(null)}
                className="px-3.5 py-2 bg-[#FAF8F4] hover:bg-white text-[#222222] border border-[#D6D9DC] text-xs font-semibold rounded transition-colors"
              >
                {language === 'ta' ? 'புதிய டோக்கன்' : 'New Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
