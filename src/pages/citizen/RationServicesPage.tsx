import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Store, CreditCard, Ticket, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export const RationServicesPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#D6D9DC] pb-4">
        <h2 className="text-2xl font-bold text-[#222222]">
          {language === 'ta' ? 'பொது விநியோகத் திட்ட சேவைகள் வழிகாட்டி' : 'Ration Services & Information Guide'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta' 
            ? 'அதிகாரப்பூர்வ தமிழ்நாடு பொது விநியோக சேவைகளுக்கான தகவல் வழிகாட்டி'
            : 'Informational guide to Tamil Nadu PDS citizen services'}
        </p>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-6 text-xs text-[#333333]">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#7B2638] flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>{language === 'ta' ? 'குடும்ப அட்டை வகைகள் மற்றும் சேவைகள்' : 'Ration Card Categories in Tamil Nadu'}</span>
          </h3>
          <p className="leading-relaxed">
            Tamil Nadu implements a universal PDS system with special priority under the National Food Security Act (NFSA). The primary card classifications include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#444444]">
            <li><strong>PHH (Priority Household)</strong>: Rice card eligible for subsidized/free rice per person, sugar, dal, and oil.</li>
            <li><strong>AAY (Antyodaya Anna Yojana)</strong>: Poorest households eligible for flat 35 kg foodgrains per month.</li>
            <li><strong>NPHH (Non-Priority Household)</strong>: General cardholders eligible for sugar and essential items without rice preference.</li>
            <li><strong>NPHH-NC (No Commodity)</strong>: Identity and address verification card without commodity allocations.</li>
          </ul>
        </div>

        <div className="border-t border-[#EBE8E1] pt-4 space-y-3">
          <h3 className="text-sm font-bold text-[#7B2638] flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>{language === 'ta' ? 'அதிகாரப்பூர்வ TNPDS இணைப்புகள்' : 'Official TNPDS Direct Portal Links'}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href="https://www.tnpds.gov.in/home.xhtml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded border border-[#D6D9DC] bg-[#FAF8F4] hover:border-[#7B2638] hover:bg-white transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-[#222222]">Apply New Smart Card</div>
                <div className="text-[10px] text-[#555555]">புதிய மின்னணு அட்டை விண்ணப்பிக்க</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#7B2638]" />
            </a>

            <a 
              href="https://www.tnpds.gov.in/pages/family-details.xhtml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 rounded border border-[#D6D9DC] bg-[#FAF8F4] hover:border-[#7B2638] hover:bg-white transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-[#222222]">Card Member Changes</div>
                <div className="text-[10px] text-[#555555]">உறுப்பினர் சேர்த்தல் / நீக்குதல்</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#7B2638]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
