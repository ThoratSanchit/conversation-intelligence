import React from 'react';
import { useRouter, Link } from '../lib/router';
import { LayoutDashboard, Users, UploadCloud, Sparkles, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentPath } = useRouter();

  const navItems = [
    {
      label: 'Overview',
      path: '/',
      icon: LayoutDashboard,
      isActive: currentPath === '/',
    },
    {
      label: 'Leads',
      path: '/leads',
      icon: Users,
      isActive: currentPath.startsWith('/leads'),
    },
    {
      label: 'Import Leads',
      path: '/import',
      icon: UploadCloud,
      isActive: currentPath === '/import',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-500 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block">
                Conversation AI
              </span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                SaaSquatch Intelligence
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.isActive
                    ? 'bg-slate-800/90 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System status footer */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-300">Signal Engine Active</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Deterministic Rules + Groq LLM
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
