import React from 'react';
import {
  LayoutDashboard,
  Settings2,
  Network,
  GitCommit,
  Share2,
  TableProperties,
  PlaySquare,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'config'
  | 'nfa-graph'
  | 'conversion'
  | 'dfa-graph'
  | 'tables'
  | 'simulator'
  | 'docs';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  nfaStateCount: number;
  dfaStateCount: number;
  stepCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  nfaStateCount,
  dfaStateCount,
  stepCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTabId,
      label: 'Dashboard & Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'config' as NavTabId,
      label: 'NFA Configuration',
      icon: Settings2,
      badge: `${nfaStateCount} states`,
    },
    {
      id: 'nfa-graph' as NavTabId,
      label: 'NFA Visualization',
      icon: Network,
      badge: null,
    },
    {
      id: 'conversion' as NavTabId,
      label: 'Step-by-Step Conversion',
      icon: GitCommit,
      badge: `${stepCount} steps`,
      highlight: true,
    },
    {
      id: 'dfa-graph' as NavTabId,
      label: 'DFA Visualization',
      icon: Share2,
      badge: `${dfaStateCount} states`,
    },
    {
      id: 'tables' as NavTabId,
      label: 'Transition Tables',
      icon: TableProperties,
      badge: 'CSV',
    },
    {
      id: 'simulator' as NavTabId,
      label: 'String Testing & Simulation',
      icon: PlaySquare,
      badge: 'Live',
    },
    {
      id: 'docs' as NavTabId,
      label: 'Theory & Documentation',
      icon: BookOpen,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Automata Theory
            </h2>
            <p className="text-[11px] text-blue-400 font-medium">
              NFA → DFA Simulator
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Simulator Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Academic Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-300">Automata Project v1.0</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Subset Construction Engine
        </div>
      </div>
    </aside>
  );
};
