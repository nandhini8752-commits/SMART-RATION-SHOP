import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AiAssistant } from '../../components/AiAssistant';
import { HelpCircle, ChevronDown, ChevronUp, PhoneCall, Bot, FileQuestion, ExternalLink } from 'lucide-react';

interface FaqItem {
  qEn: string;
  qTa: string;
  aEn: string;
  aTa: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    qEn: 'What is the monthly rice entitlement for Priority Household (PHH) cards in Tamil Nadu?',
    qTa: 'தமிழ்நாட்டில் முன்னுரிமை குடும்ப அட்டைக்கு (PHH) மாதம் எவ்வளவு இலவச அரிசி வழங்கப்படும்?',
    aEn: 'Under Tamil Nadu universal PDS policy, all PHH smart cards receive 5 kg of rice per family member completely free of cost (₹0.00). For example, a family of 4 receives 20 kg per month.',
    aTa: 'தமிழ்நாடு அரசின் பொது விநியோகத் திட்டத்தின் கீழ், PHH குடும்ப அட்டைதாரர்களுக்கு குடும்ப உறுப்பினருக்கு தலா 5 கிலோ இலவச அரிசி வழங்கப்படுகிறது. 4 பேர் கொண்ட குடும்பத்திற்கு 20 கிலோ இலவசமாக கிடைக்கும்.'
  },
  {
    qEn: 'What are the subsidized prices of sugar, pulses (tur dal), and palmolein oil?',
    qTa: 'சர்க்கரை, துவரம் பருப்பு மற்றும் பாமாயிலின் அரசு மானிய விலை என்ன?',
    aEn: 'Sugar is distributed at ₹25.00 per kg (1 kg per card). Special PDS Tur Dal is provided at ₹30.00 per kg (1 kg per card). Palmolein oil is provided at ₹25.00 per 1-litre packet.',
    aTa: 'சர்க்கரை ஒரு கிலோ ₹25.00 மானிய விலையில் வழங்கப்படுகிறது (அட்டைக்கு 1 கிலோ). துவரம் பருப்பு ஒரு கிலோ ₹30.00 மற்றும் பாமாயில் 1 லிட்டர் பாக்கெட் ₹25.00 மானிய விலையில் வழங்கப்படுகிறது.'
  },
  {
    qEn: 'How does the Smart FIFO Token queue management system work?',
    qTa: 'ஸ்மார்ட் FIFO டோக்கன் வரிசை முறை எவ்வாறு செயல்படுகிறது?',
    aEn: 'When you generate a token using your verified card, the system places you in a strict First-In First-Out (FIFO) line for your shop. Tokens are called in sequence across active counters (Counter 1 & 2) without duplicate skipping.',
    aTa: 'உங்கள் அட்டையை சரிபார்த்து டோக்கன் எடுக்கும்போது, கணினி உங்களை வரிசை முறையில் (FIFO) சேர்க்கிறது. கடையில் உள்ள சேவை கவுண்டர்கள் மூலம் முன்னுரிமைப்படி டோக்கன்கள் அழைக்கப்படும்.'
  },
  {
    qEn: 'What are the standard Fair Price Shop operating hours?',
    qTa: 'நியாயவிலைக் கடையின் நிலையான வேலை நேரம் என்ன?',
    aEn: 'Standard operating hours are Monday through Friday: 09:00 to 13:00 and 14:00 to 17:00. Saturday is open from 09:00 to 13:00. Sunday is the official weekly holiday.',
    aTa: 'நிலையான வேலை நேரம்: திங்கள் முதல் வெள்ளி வரை காலை 09:00 - 13:00 மற்றும் மதியம் 14:00 - 17:00. சனிக்கிழமை காலை 09:00 - 13:00. ஞாயிற்றுக்கிழமை வார விடுமுறை.'
  },
  {
    qEn: 'What is the official government helpline for ration complaints?',
    qTa: 'ரேஷன் புகார்களுக்கான அதிகாரப்பூர்வ கட்டணமில்லா உதவி எண் என்ன?',
    aEn: 'You can call toll-free helpline numbers 1967 or 1800-425-5901 (Civil Supplies & Consumer Protection Department) between 08:00 AM and 08:00 PM on all days.',
    aTa: 'உணவுப் பொருள் வழங்கல் துறை கட்டணமில்லா உதவி எண்களான 1967 அல்லது 1800-425-5901 என்ற எண்களை தினமும் காலை 8:00 முதல் இரவு 8:00 வரை தொடர்பு கொள்ளலாம்.'
  }
];

export const HelpPage: React.FC = () => {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'faq' | 'assistant'>('faq');

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <HelpCircle className="w-4 h-4" />
          <span>{language === 'ta' ? 'உதவி மையம் & அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Help & Information Center'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'பொது விநியோக வழிகாட்டி மற்றும் உதவி' : 'PDS Citizen Help & Support'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta'
            ? 'அடிக்கடி கேட்கப்படும் கேள்விகள், உதவி எண்கள் மற்றும் மெய்நிகர் AI உதவியாளர்.'
            : 'Explore vetted FAQs, official helpline directory, or ask our automated assistant.'}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#D6D9DC]">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'faq'
              ? 'border-[#7B2638] text-[#7B2638]'
              : 'border-transparent text-[#555555] hover:text-[#222222]'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>{language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)' : 'Frequently Asked Questions'}</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'assistant'
              ? 'border-[#7B2638] text-[#7B2638]'
              : 'border-transparent text-[#555555] hover:text-[#222222]'
          }`}
        >
          <Bot className="w-4 h-4 text-[#C49A3A]" />
          <span>{language === 'ta' ? 'ஸ்மார்ட் AI உதவியாளர்' : 'Smart AI Assistant'}</span>
        </button>
      </div>

      {activeTab === 'faq' ? (
        /* FAQ Accordion Section */
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FAF8F4] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-xs sm:text-sm text-[#222222]">
                    {language === 'ta' ? faq.qTa : faq.qEn}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#7B2638] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#888888] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#444444] border-t border-[#F0EFEB] leading-relaxed bg-[#FAF8F4]/30">
                    {language === 'ta' ? faq.aTa : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}

          {/* Official Helplines Callout */}
          <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-[#7B2638] uppercase">
                {language === 'ta' ? 'நேரடி தொலைபேசி உதவி' : 'Direct Helpline Assistance'}
              </div>
              <div className="text-lg font-bold text-[#222222]">
                1967 / 1800-425-5901
              </div>
              <div className="text-[11px] text-[#666666]">
                {language === 'ta' ? 'அனைத்து நாட்களிலும் காலை 8:00 மணி முதல் இரவு 8:00 மணி வரை' : 'Available all days from 08:00 AM to 08:00 PM'}
              </div>
            </div>

            <a
              href="tel:1967"
              className="inline-flex items-center gap-2 bg-[#7B2638] hover:bg-[#591A28] text-white font-bold text-xs px-4 py-2.5 rounded transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{language === 'ta' ? 'உதவிக்கு அழைக்க' : 'Call Toll-Free Helpline'}</span>
            </a>
          </div>
        </div>
      ) : (
        /* AI Assistant Section */
        <div className="space-y-4">
          <AiAssistant />
        </div>
      )}
    </div>
  );
};
