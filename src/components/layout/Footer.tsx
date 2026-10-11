import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Phone, ExternalLink, ShieldCheck, Clock, MapPin, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-[#222222] text-[#D6D9DC] text-xs border-t-4 border-[#7B2638] mt-auto">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Portal Overview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/logos/srqms-mark.svg" 
              alt="SRQMS Mark" 
              className="w-8 h-8 rounded bg-[#7B2638] p-0.5" 
            />
            <span className="font-bold text-white text-sm">SRQMS Tamil Nadu</span>
          </div>
          <p className="text-white/70 leading-relaxed text-[11px]">
            {language === 'ta'
              ? 'ஸ்மார்ட் ரேஷன் வரிசை மேலாண்மை அமைப்பு (SRQMS) என்பது நியாயவிலைக் கடைகளில் நெரிசலைத் தவிர்க்கவும், நிகழ்நேர இருப்பு சரிபார்ப்புக்கும் உருவாக்கப்பட்ட சுயாதீன மாதிரி அமைப்பாகும்.'
              : 'Smart Ration Queue Management System (SRQMS) is an independent validation prototype demonstrating real-time FIFO queue dispatch, synthetic card entitlement checks, and transparent stock audits for Fair Price Shops.'}
          </p>
          <div className="text-[11px] text-[#E1BD67] font-semibold flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#C49A3A]" />
            <span>
              {language === 'ta' ? 'மாதிரி முன்மாதிரி — அதிகாரப்பூர்வ தளம் அல்ல' : 'Validation Prototype — Not an Official Site'}
            </span>
          </div>
        </div>

        {/* Col 2: Official Government Links */}
        <div className="space-y-2.5">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-white/20 pb-1.5">
            {language === 'ta' ? 'அதிகாரப்பூர்வ அரசு இணையதளங்கள்' : 'Official Government Portals'}
          </h3>
          <ul className="space-y-2 text-[11px]">
            <li>
              <a 
                href="https://www.tnpds.gov.in/home.xhtml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink className="w-3 h-3 text-[#C49A3A]" />
                <span>{language === 'ta' ? 'TNPDS குடிமக்கள் தளம்' : 'TNPDS Citizen Portal'}</span>
              </a>
            </li>
            <li>
              <a 
                href="https://www.consumer.tn.gov.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink className="w-3 h-3 text-[#C49A3A]" />
                <span>{language === 'ta' ? 'உணவுப் பொருள் வழங்கல் துறை' : 'Civil Supplies Department'}</span>
              </a>
            </li>
            <li>
              <a 
                href="https://tncsc.tn.gov.in/en/PDS.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink className="w-3 h-3 text-[#C49A3A]" />
                <span>{language === 'ta' ? 'தமிழ்நாடு நுகர்பொருள் வாணிபக் கழகம்' : 'TN Civil Supplies Corporation'}</span>
              </a>
            </li>
            <li>
              <a 
                href="https://nfsa.gov.in/State/TN" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 hover:underline"
              >
                <ExternalLink className="w-3 h-3 text-[#C49A3A]" />
                <span>{language === 'ta' ? 'தேசிய உணவுப் பாதுகாப்புச் சட்டம் (NFSA)' : 'National Food Security Act (NFSA)'}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Operational Timings & Helplines */}
        <div className="space-y-2.5">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-white/20 pb-1.5">
            {language === 'ta' ? 'உதவி எண் & வேலை நேரம்' : 'Helpline & Standard Timings'}
          </h3>
          <div className="space-y-2 text-[11px] text-white/80">
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-[#E1BD67] mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-white">Toll-Free 1967 / 1800-425-5901</div>
                <div className="text-[10px] text-white/60">
                  {language === 'ta' ? 'காலை 8:00 முதல் இரவு 8:00 வரை' : 'Available 08:00 to 20:00 (All days)'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-[#E1BD67] mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-white">
                  {language === 'ta' ? 'திங்கள் - வெள்ளி: 09:00 - 17:00' : 'Mon - Fri: 09:00 - 17:00'}
                </div>
                <div className="text-[10px] text-white/60">
                  {language === 'ta' ? 'சனி: 09:00 - 13:00 | ஞாயிறு விடுமுறை' : 'Sat: 09:00 - 13:00 | Sun: Closed'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 4: Prototype Policies & Disclaimers */}
        <div className="space-y-2.5">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-white/20 pb-1.5">
            {language === 'ta' ? 'கொள்கை & விதிமுறைகள்' : 'Protocols & Standards'}
          </h3>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link to="/privacy" className="hover:text-white hover:underline">
                {language === 'ta' ? 'தனியுரிமை மற்றும் மாதிரி நோக்கம்' : 'Privacy & Demo Scope'}
              </Link>
            </li>
            <li>
              <Link to="/accessibility" className="hover:text-white hover:underline">
                {language === 'ta' ? 'அணுகல்தன்மை கொள்கை (WCAG 2.2 AA)' : 'Accessibility Policy (WCAG 2.2 AA)'}
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-white hover:underline">
                {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions (FAQ)'}
              </Link>
            </li>
            <li>
              <Link to="/complaints/new" className="hover:text-white hover:underline">
                {language === 'ta' ? 'குறைதீர்ப்பு பதிவு' : 'Lodge Grievance'}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#181818] py-4 px-4 sm:px-6 border-t border-white/10 text-[11px] text-white/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} Smart Ration Queue Management System (SRQMS). Independent validation prototype for Tamil Nadu Fair Price Shops.
          </div>
          <div className="text-[10px] text-white/40">
            Version 1.0.0-prototype • Fictional Demo Records Only
          </div>
        </div>
      </div>
    </footer>
  );
};
