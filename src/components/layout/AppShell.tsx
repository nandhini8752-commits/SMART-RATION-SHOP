import React from 'react';
import { Outlet } from 'react-router-dom';
import { Masthead } from './Masthead';
import { PrimaryNav } from './PrimaryNav';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#222222] font-sans antialiased selection:bg-[#7B2638] selection:text-white">
      {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.2 AA) */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Government Department Masthead */}
      <Masthead />

      {/* Primary Department Navigation */}
      <PrimaryNav />

      {/* Breadcrumbs for Contextual Hierarchy */}
      <Breadcrumbs />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 focus:outline-hidden">
        <Outlet />
      </main>

      {/* Departmental Footer */}
      <Footer />
    </div>
  );
};
