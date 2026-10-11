import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, Search, ArrowRight, AlertCircle, ShieldCheck, User, Users } from 'lucide-react';

const SAMPLE_CARDS = [
  { number: 'DEMO-TN-0001', category: 'PHH (Priority)', head: 'Demo Beneficiary One', members: 4, locality: 'Anna Nagar East' },
  { number: 'DEMO-TN-0002', category: 'AAY (Antyodaya)', head: 'Demo Beneficiary Two', members: 3, locality: 'Anna Nagar East' },
  { number: 'DEMO-TN-0003', category: 'NPHH (General)', head: 'Demo Beneficiary Three', members: 5, locality: 'Anna Nagar East' },
  { number: 'DEMO-TN-0004', category: 'PHH (Priority)', head: 'Demo Beneficiary Four', members: 2, locality: 'Mogappair Demo Zone' },
  { number: 'DEMO-TN-0005', category: 'OTHER_DEMO', head: 'Demo Beneficiary Five', members: 1, locality: 'Sample Nagar' },
];

export const CardVerificationPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedCard, setVerifiedCard] = useState<any | null>(null);

  const handleVerify = async (targetNumber?: string) => {
    const num = (targetNumber || cardNumber).trim().toUpperCase();
    if (!num) {
      setError(language === 'ta' ? 'குடும்ப அட்டை எண்ணை உள்ளிடவும்' : 'Please enter a ration card number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/citizen/demo-card-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: num }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.error || json.message ||
          (language === 'ta'
            ? 'அட்டை எண் கிடைக்கவில்லை. மாதிரி அட்டை எண்களை (DEMO-TN-0001 முதல் 0005 வரை) பயன்படுத்தவும்.'
            : 'Ration card not found in demo database. Please use synthetic demo cards DEMO-TN-0001 to 0005.')
        );
      }

      setVerifiedCard({
        id: json.card.id,
        number: json.card.cardNumber,
        category: json.card.category,
        head: json.card.headName,
        members: json.card.familyMembers,
        locality: json.card.locality,
        shopId: json.card.shopId,
        shopCode: json.card.shopCode,
        shopName: json.card.shopName,
        phoneMasked: json.card.demoMobileMasked || '******8821',
        verificationId: json.verificationId,
      });
      setCardNumber(json.card.cardNumber);
    } catch (err: any) {
      // Fallback check in local sample cards if server error
      const found = SAMPLE_CARDS.find((c) => c.number === num);
      if (found) {
        setVerifiedCard({
          number: found.number,
          category: found.category,
          head: found.head,
          members: found.members,
          locality: found.locality,
          shopCode: 'DEMO-CHN-001',
          shopName: 'SRQMS Demo Shop 001',
          phoneMasked: '******8821',
        });
        setCardNumber(found.number);
      } else {
        setError(err.message);
        setVerifiedCard(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <CreditCard className="w-4 h-4" />
          <span>{language === 'ta' ? 'அட்டை சரிபார்ப்பு' : 'Card Verification'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'மாதிரி குடும்ப அட்டை சரிபார்ப்பு' : 'Demonstration Ration Card Verification'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'உங்கள் மாதிரி அட்டை எண்ணை உள்ளிட்டு குடும்ப உறுப்பினர்கள் மற்றும் மாத உரிம விவரங்களை சரிபார்க்கவும்.'
            : 'Enter synthetic ration card number to verify family details and monthly entitlement quota.'}
        </p>
      </div>

      {/* Verification Form Card */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="card-input" className="block text-xs font-bold text-[#222222]">
            {language === 'ta' ? 'மாதிரி குடும்ப அட்டை எண்' : 'Synthetic Ration Card Number'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="card-input"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
              placeholder="e.g. DEMO-TN-0001"
              className="flex-1 px-3 py-2 border border-[#D6D9DC] rounded text-xs font-mono focus:outline-hidden focus:border-[#7B2638]"
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="bg-[#7B2638] hover:bg-[#591A28] disabled:opacity-50 text-white px-5 py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying...') : (language === 'ta' ? 'சரிபார்க்க' : 'Verify Card')}</span>
            </button>
          </div>
          {error && (
            <p className="text-xs text-[#A12622] flex items-center gap-1 font-medium mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Quick Sample Selector */}
        <div className="pt-3 border-t border-[#EBE8E1]">
          <div className="text-[11px] font-bold text-[#555555] mb-2">
            {language === 'ta' ? 'சோதனைக்கான மாதிரி அட்டையைத் தேர்ந்தெடுக்கவும்:' : 'Or select a pre-seeded synthetic card for testing:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLE_CARDS.slice(0, 3).map((c) => (
              <button
                key={c.number}
                type="button"
                onClick={() => handleVerify(c.number)}
                className="text-left p-2.5 rounded border border-[#D6D9DC] bg-[#FAF8F4] hover:border-[#7B2638] hover:bg-white transition-all text-xs"
              >
                <div className="font-mono font-bold text-[#7B2638]">{c.number}</div>
                <div className="text-[11px] text-[#555555]">{c.category}</div>
                <div className="text-[10px] text-[#777777]">{c.head}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Result Card */}
      {verifiedCard && (
        <div className="bg-white border-2 border-[#1F6B45] rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1F6B45]" />
              <h3 className="font-bold text-base text-[#222222]">
                {language === 'ta' ? 'அட்டை சரிபார்ப்பு வெற்றிகரமானது' : 'Card Successfully Verified'}
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-[#1F6B45] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {verifiedCard.category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
              <span className="text-[#555555]">{language === 'ta' ? 'குடும்பத் தலைவர் பெயர்:' : 'Family Head Name:'}</span>
              <div className="font-bold text-sm text-[#222222]">{verifiedCard.head}</div>
            </div>

            <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
              <span className="text-[#555555]">{language === 'ta' ? 'குடும்ப உறுப்பினர்கள்:' : 'Family Members:'}</span>
              <div className="font-bold text-sm text-[#222222]">{verifiedCard.members} {language === 'ta' ? 'நபர்கள்' : 'persons'}</div>
            </div>

            <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
              <span className="text-[#555555]">{language === 'ta' ? 'நியமிக்கப்பட்ட நியாயவிலைக் கடை:' : 'Assigned Fair Price Shop:'}</span>
              <div className="font-bold text-[#7B2638]">{verifiedCard.shopName || 'SRQMS Demo Shop 001 (Anna Nagar East)'}</div>
            </div>

            <div className="bg-[#FAF8F4] p-3 rounded border border-[#E5E0D5] space-y-1">
              <span className="text-[#555555]">{language === 'ta' ? 'பதிவு செய்யப்பட்ட தொலைபேசி:' : 'Registered Phone:'}</span>
              <div className="font-bold font-mono text-[#222222]">{verifiedCard.phoneMasked || '******8821 (Masked)'}</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to={`/card/entitlements?card=${verifiedCard.number}&verificationId=${verifiedCard.verificationId || ''}`}
              className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-xs"
            >
              <span>{language === 'ta' ? 'உரிம விவரங்களைப் பார்க்க' : 'View Configured Entitlements'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to={`/queue/create?card=${verifiedCard.number}&shopId=${verifiedCard.shopId || ''}&shopCode=${verifiedCard.shopCode || ''}&verificationId=${verifiedCard.verificationId || ''}`}
              className="inline-flex items-center gap-1.5 bg-[#C49A3A] hover:bg-[#E1BD67] text-[#222222] text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-xs"
            >
              <span>{language === 'ta' ? 'வரிசை டோக்கன் பெற' : 'Generate Queue Token'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
