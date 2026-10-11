import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-100 text-[#A12622] flex items-center justify-center mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#222222]">
        {language === 'ta' ? 'அணுகல் மறுக்கப்பட்டது (403)' : 'Access Denied (403)'}
      </h2>
      <p className="text-sm text-[#555555]">
        {language === 'ta'
          ? 'இந்த பக்கத்தை பார்க்க உங்களுக்கு போதிய அனுமதிகள் இல்லை. உங்கள் நியமிக்கப்பட்ட கடை அல்லது நிர்வாக கணக்கின் மூலம் உள்நுழையவும்.'
          : 'You do not have permission to access this resource. Please log in with the appropriate shop staff or administrative credentials.'}
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
