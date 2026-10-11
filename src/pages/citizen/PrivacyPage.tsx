import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Lock, AlertTriangle, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#D6D9DC] pb-4">
        <h2 className="text-2xl font-bold text-[#222222]">
          {language === 'ta' ? 'தனியுரிமை மற்றும் மாதிரி நோக்கம்' : 'Privacy & Prototype Scope'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta' ? 'கடைசி புதுப்பிப்பு: அக்டோபர் 2026' : 'Last Updated: October 2026'}
        </p>
      </div>

      <div className="bg-[#FFF9E6] border border-[#E6D7A8] p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#8A5300] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6B5115] space-y-1">
          <p className="font-bold">
            {language === 'ta' ? 'முக்கிய அறிவிப்பு:' : 'Important Disclosure:'}
          </p>
          <p>
            {language === 'ta'
              ? 'இந்த தளம் ஒரு சுயாதீன மாதிரி முன்மாதிரி ஆகும். இங்கு உண்மையான ஆதார் எண்கள், குடும்ப அட்டை விவரங்கள், அல்லது தனிநபர் தரவுகள் கோரப்படுவதோ அல்லது சேமிக்கப்படுவதோ இல்லை.'
              : 'This portal is an independent research validation prototype. No real Aadhaar numbers, real ration card records, OTPs, or authentic citizen identity data are ever requested or stored.'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-4 text-xs text-[#333333] leading-relaxed">
        <h3 className="text-sm font-bold text-[#222222]">
          {language === 'ta' ? '1. மாதிரி தரவுப் பயன்பாடு (Synthetic Data Only)' : '1. Synthetic Demonstration Data'}
        </h3>
        <p>
          All ration cards used within this prototype (such as <code>DEMO-TN-0001</code> to <code>0005</code>) are synthetic demonstration records created specifically for testing and UI evaluation. Do not input actual government identification numbers.
        </p>

        <h3 className="text-sm font-bold text-[#222222]">
          {language === 'ta' ? '2. அமர்வு மற்றும் டோக்கன் விவரங்கள்' : '2. Session & Queue Tokens'}
        </h3>
        <p>
          Queue tokens created in this prototype are assigned to demonstration shops (e.g., Fair Price Shop 001, Anna Nagar East) and are maintained in a local test database. Tokens expire naturally or can be reset using standard administrative reset tools.
        </p>

        <h3 className="text-sm font-bold text-[#222222]">
          {language === 'ta' ? '3. தொலைபேசி மற்றும் தந்தி (Telegram) எச்சரிக்கைகள்' : '3. Demonstration Notifications'}
        </h3>
        <p>
          Notification dispatches (such as queue advancements and call-next reminders) are delivered via test adapters or in simulated audit-log mode. No unencrypted citizen data is shared with external commercial AI services or third parties.
        </p>
      </div>
    </div>
  );
};
