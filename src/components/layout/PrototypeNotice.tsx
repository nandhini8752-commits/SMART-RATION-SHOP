import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const DISCLAIMERS = {
  en: "Independent validation prototype — not an official Government of Tamil Nadu website. Uses synthetic demonstration data.",
  ta: "சுயாதீன மாதிரி முன்மாதிரி — தமிழ்நாடு அரசின் அதிகாரப்பூர்வ இணையதளம் அல்ல. மாதிரி தரவு மட்டுமே பயன்படுத்தப்படுகிறது.",
  te: "స్వతంత్ర నమూనా ప్రాజెక్ట్ — తమిళనాడు ప్రభుత్వ అధికారిక వెబ్‌సైట్ కాదు. నమూనా డేటా మాత్రమే ఉపయోగించబడుతుంది.",
  hi: "स्वतंत्र सत्यापन प्रोटोटाइप — यह तमिलनाडु सरकार की आधिकारिक वेबसाइट नहीं है। केवल डमी डेटा का उपयोग किया गया है。"
};

export const PrototypeNotice: React.FC = () => {
  const { language } = useLanguage();
  const noticeText = DISCLAIMERS[language] || DISCLAIMERS.en;

  return (
    <aside 
      aria-label="Prototype Notice" 
      className="bg-[#FFF9E6] border-b border-[#E6D7A8] text-[#6B5115] text-xs py-1.5 px-4 font-medium"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#8A5300]" aria-hidden="true" />
          <span>{noticeText}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] shrink-0 text-[#8A5300]">
          <Link to="/privacy" className="underline hover:text-[#591A28]">
            {language === 'ta' ? 'விவரக்குறிப்பு' : 'Prototype Info'}
          </Link>
          <span>•</span>
          <a 
            href="https://www.tnpds.gov.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:underline"
          >
            {language === 'ta' ? 'அதிகாரப்பூர்வ TNPDS' : 'Official TNPDS'}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
