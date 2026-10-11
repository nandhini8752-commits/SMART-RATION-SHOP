import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, Package, ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, Info } from 'lucide-react';

export const EntitlementViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const cardNumber = searchParams.get('card') || 'DEMO-TN-0001';
  const { language } = useLanguage();

  const isAAY = cardNumber.includes('0002');
  const isNPHH = cardNumber.includes('0003');

  const defaultEntitlements = [
    {
      commodityEn: 'Rice (Common/Fine)',
      commodityTa: 'அரிசி (பொது/சன்னம்)',
      scaleEn: isAAY ? '35 kg per family' : isNPHH ? 'Not eligible (Sugar card)' : '5 kg per person (4 members = 20 kg)',
      scaleTa: isAAY ? 'குடும்பத்திற்கு 35 கிலோ' : isNPHH ? 'பொருந்தாது' : 'நபருக்கு 5 கிலோ (4 பேர் = 20 கிலோ)',
      quota: isAAY ? '35 kg' : isNPHH ? '0 kg' : '20 kg',
      price: 'Free (₹0.00)',
      ruleCode: isAAY ? 'RICE_AAY_V1' : 'RICE_PHH_V1'
    },
    {
      commodityEn: 'Sugar',
      commodityTa: 'சர்க்கரை',
      scaleEn: '1 kg per card per month',
      scaleTa: 'குடும்ப அட்டைக்கு மாதம் 1 கிலோ',
      quota: '1 kg',
      price: '₹25.00 / kg',
      ruleCode: 'SUGAR_UNIVERSAL_V1'
    },
    {
      commodityEn: 'Tur Dal (Special PDS)',
      commodityTa: 'துவரம் பருப்பு',
      scaleEn: '1 kg per card per month',
      scaleTa: 'குடும்ப அட்டைக்கு மாதம் 1 கிலோ',
      quota: '1 kg',
      price: '₹30.00 / kg',
      ruleCode: 'DAL_UNIVERSAL_V1'
    },
    {
      commodityEn: 'Palmolein Oil',
      commodityTa: 'பாமாயில்',
      scaleEn: '1 litre packet per month',
      scaleTa: 'மாதம் 1 பாக்கெட்',
      quota: '1 litre',
      price: '₹25.00 / litre',
      ruleCode: 'OIL_UNIVERSAL_V1'
    },
    {
      commodityEn: 'Wheat',
      commodityTa: 'கோதுமை',
      scaleEn: 'Up to 5 kg (Optional/Subject to availability)',
      scaleTa: '5 கிலோ வரை (இருப்புக்கு உட்பட்டு)',
      quota: '5 kg',
      price: 'Free (₹0.00)',
      ruleCode: 'WHEAT_DEMO_V1'
    }
  ];

  const [entitlementList, setEntitlementList] = useState(defaultEntitlements);
  const [categoryLabel, setCategoryLabel] = useState(isAAY ? 'AAY' : isNPHH ? 'NPHH' : 'PHH');

  useEffect(() => {
    let active = true;
    const fetchEntitlements = async () => {
      try {
        const res = await fetch(`/api/v1/citizen/demo-card-verifications/${cardNumber}/entitlements`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.items && json.items.length > 0) {
            if (json.card?.category) setCategoryLabel(json.card.category);
            setEntitlementList(json.items.map((it: any) => ({
              commodityEn: it.nameI18n?.en || it.commodityCode,
              commodityTa: it.nameI18n?.ta || it.commodityCode,
              scaleEn: it.explanationI18n?.en || `${it.quantity} ${it.unit}`,
              scaleTa: it.explanationI18n?.ta || `${it.quantity} ${it.unit}`,
              quota: `${it.quantity} ${it.unit}`,
              price: it.pricePerUnit === 0 ? 'Free (₹0.00)' : `₹${Number(it.pricePerUnit).toFixed(2)} / ${it.unit}`,
              ruleCode: it.ruleCode || it.commodityCode,
            })));
          }
        }
      } catch (err) {
        console.warn('Using default entitlements fallback', err);
      }
    };

    fetchEntitlements();
    return () => { active = false; };
  }, [cardNumber]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/card/verify" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'அட்டை சரிபார்ப்புக்கு திரும்புக' : 'Back to Card Verification'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#D6D9DC] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7B2638] uppercase tracking-wide">
          <CreditCard className="w-4 h-4" />
          <span>{language === 'ta' ? 'மாதாந்திர உரிமங்கள்' : 'Monthly Entitlement Breakdown'}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mt-1">
          {language === 'ta' ? 'உரிம விவரங்கள் & அரசு மானிய விலை' : 'Configured Entitlement Scale & Tariffs'}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#555555]">
          <span>{language === 'ta' ? 'அட்டை எண்:' : 'Card Number:'}</span>
          <span className="font-mono font-bold text-[#7B2638] bg-[#F6F3EA] px-2 py-0.5 rounded border border-[#EBE8E1]">
            {cardNumber}
          </span>
          <span>•</span>
          <span className="font-semibold text-[#222222]">
            {categoryLabel === 'AAY' ? 'AAY (Antyodaya Anna Yojana)' : categoryLabel === 'NPHH' ? 'NPHH (Non-Priority)' : 'PHH (Priority Household)'}
          </span>
        </div>
      </div>

      {/* Versioned Policy Metadata Banner */}
      <div className="bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-[#7B2638] shrink-0 mt-0.5" />
        <div className="text-xs text-[#444444] space-y-1">
          <div className="font-bold text-[#222222]">
            {language === 'ta' ? 'கொள்கை பதிப்பு மற்றும் மூலக்குறிப்பு:' : 'Policy Version & Source Reference:'}
          </div>
          <p>
            Entitlements calculated using configured policy rule version <strong>TN-PDS-2026-V1</strong> (Effective: Jan 2026 to present). Illustrative demo rules verified against TN CSC PDS guidelines.
          </p>
          <div className="pt-1">
            <a 
              href="https://www.consumer.tn.gov.in/fairprice.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#7B2638] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{language === 'ta' ? 'அதிகாரப்பூர்வ கொள்கை ஆவணம்' : 'Official Policy Reference (consumer.tn.gov.in)'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Entitlement Table */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">{language === 'ta' ? 'பொருள்' : 'Commodity'}</th>
              <th className="py-3 px-4">{language === 'ta' ? 'அரசு ஒதுக்கீட்டு அளவுமுறை' : 'Entitlement Scale'}</th>
              <th className="py-3 px-4">{language === 'ta' ? 'மாத ஒதுக்கீடு' : 'Total Monthly Quota'}</th>
              <th className="py-3 px-4">{language === 'ta' ? 'மானிய விலை' : 'Subsidized Price'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E1]">
            {entitlementList.map((item, idx) => (
              <tr key={item.ruleCode} className="hover:bg-[#FAF8F4]/50 transition-colors">
                <td className="py-3 px-4 text-[#777777] font-mono">{idx + 1}</td>
                <td className="py-3 px-4 font-bold text-[#222222]">
                  {language === 'ta' ? item.commodityTa : item.commodityEn}
                </td>
                <td className="py-3 px-4 text-[#555555]">
                  {language === 'ta' ? item.scaleTa : item.scaleEn}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">
                  {item.quota}
                </td>
                <td className="py-3 px-4 font-semibold text-[#1F6B45]">
                  {item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF8F4] border border-[#E5E0D5] p-4 rounded-lg">
        <div className="text-xs text-[#555555]">
          {language === 'ta'
            ? 'அங்கீகரிக்கப்பட்ட நியாயவிலைக் கடையில் நேரடியாக இந்த பொருட்களைப் பெறலாம்.'
            : 'Present this card and active token at your assigned shop counter.'}
        </div>
        <Link
          to={`/queue/create?card=${cardNumber}`}
          className="inline-flex items-center gap-2 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-xs"
        >
          <span>{language === 'ta' ? 'வரிசை டோக்கன் பெறுதல்' : 'Generate Queue Token'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
