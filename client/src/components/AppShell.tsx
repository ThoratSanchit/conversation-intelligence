import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, subtitle, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <TopBar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
