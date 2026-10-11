import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, Eye, Keyboard, Type } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#D6D9DC] pb-4">
        <h2 className="text-2xl font-bold text-[#222222]">
          {language === 'ta' ? 'அணுகல்தன்மை கொள்கை (Accessibility)' : 'Accessibility Policy & Standards'}
        </h2>
        <p className="text-xs text-[#555555] mt-1">
          {language === 'ta' ? 'WCAG 2.2 AA இணக்கத்தன்மை மற்றும் பயனர் வழிகாட்டி' : 'WCAG 2.2 Level AA Compliance Guidelines'}
        </p>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg p-6 space-y-5 text-xs text-[#333333] leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#E5E0D5] p-4 rounded bg-[#FAF8F4] space-y-2">
            <div className="flex items-center gap-2 text-[#7B2638] font-bold">
              <Keyboard className="w-4 h-4" />
              <span>{language === 'ta' ? 'விசைப்பலகை வழிசெலுத்தல்' : 'Keyboard Navigation'}</span>
            </div>
            <p className="text-[11px] text-[#555555]">
              Full keyboard accessibility with logical tab order, skip-to-content anchor, and visible focus rings.
            </p>
          </div>

          <div className="border border-[#E5E0D5] p-4 rounded bg-[#FAF8F4] space-y-2">
            <div className="flex items-center gap-2 text-[#7B2638] font-bold">
              <Eye className="w-4 h-4" />
              <span>{language === 'ta' ? 'வண்ண மாறுபாடு (Contrast)' : 'High Contrast Ratio'}</span>
            </div>
            <p className="text-[11px] text-[#555555]">
              Meets WCAG 2.2 AA minimum 4.5:1 text contrast on all public interface components.
            </p>
          </div>

          <div className="border border-[#E5E0D5] p-4 rounded bg-[#FAF8F4] space-y-2">
            <div className="flex items-center gap-2 text-[#7B2638] font-bold">
              <Type className="w-4 h-4" />
              <span>{language === 'ta' ? 'தமிழ் எழுத்துரு ஆதரவு' : 'Tamil Script Rendering'}</span>
            </div>
            <p className="text-[11px] text-[#555555]">
              Native Noto Sans Tamil typography with line-height allowances (1.7) to prevent glyph clipping.
            </p>
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#222222] pt-2">
          {language === 'ta' ? 'அணுகல்தன்மை ஆதரவு' : 'Feedback and Support'}
        </h3>
        <p>
          If you encounter any difficulty navigating or reading content on this validation prototype, please reach out via our grievance portal or call the department helpline at <strong>1967</strong>.
        </p>
      </div>
    </div>
  );
};
