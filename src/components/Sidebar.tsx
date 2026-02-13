'use client';

import React from 'react';
import { useTabs } from '@/context/TabContext';
import { 
  CreditCard,
  PenTool,
  Truck,
  ChevronRight,
  Menu,
  CalendarX
} from 'lucide-react';

// Import Pages explicitly for Tab Mapping
import MonthlyClosingDashboard from '@/app/monthly-closing/page';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { 
    id: 'monthly-closing',
    name: '월말 마감', 
    enName: 'Monthly Closing', 
    component: <MonthlyClosingDashboard />,
    icon: CreditCard 
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { openTab, activeTabId } = useTabs();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-between px-6 bg-indigo-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-indigo-950 font-bold text-xl">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">NDY Closing</h1>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Monthly Solutions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTabId === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => openTab(item.id, item.name, item.component)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-left
                  ${isActive 
                    ? 'bg-indigo-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-white' 
                    : 'text-indigo-200 hover:bg-white/5 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-amber-400 text-indigo-900' : 'bg-indigo-800/50 text-indigo-300 group-hover:text-white'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold leading-tight">{item.name}</div>
                    <div className="text-[10px] opacity-50 font-bold uppercase tracking-wide mt-0.5">{item.enName}</div>
                  </div>
                </div>
                {isActive && <ChevronRight size={14} className="text-amber-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Info / Status Board */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">System Status</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400">Live</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-300">Region</span>
                <span className="text-indigo-100 font-medium font-sans">KR-SEL</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-300">Environment</span>
                <span className="text-indigo-100 font-medium font-sans">Prod-V3</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
