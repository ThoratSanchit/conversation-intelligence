import React from 'react';
import { Menu, UploadCloud } from 'lucide-react';
import { Link, useRouter } from '../lib/router';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  title: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, title, subtitle }) => {
  const { currentPath } = useRouter();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentPath !== '/import' && (
          <Link
            to="/import"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Leads</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopBar;
