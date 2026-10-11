import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-lg mx-auto text-center py-12 px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#FAF0F2] text-[#7B2638] flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#222222]">
        {language === 'ta' ? 'பக்கம் காணப்படவில்லை (404)' : 'Page Not Found (404)'}
      </h2>
      <p className="text-sm text-[#555555]">
        {language === 'ta'
          ? 'நீங்கள் கோரிய பக்கம் நீக்கப்பட்டிருக்கலாம் அல்லது முகவரி தவறாக இருக்கலாம்.'
          : 'The page you requested does not exist or may have moved.'}
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#7B2638] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#591A28] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>{language === 'ta' ? 'முகப்பிற்கு செல்க' : 'Return to Home'}</span>
        </Link>
      </div>
    </div>
  );
};
