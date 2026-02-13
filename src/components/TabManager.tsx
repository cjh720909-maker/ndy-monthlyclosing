'use client';

import React from 'react';
import { useTabs } from '@/context/TabContext';
import { X } from 'lucide-react';

export default function TabManager() {
  const { tabs, activeTabId, setActiveTabId, closeTab } = useTabs();

  // If no tabs are open, show nothing (or a default dashboard?)
  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </div>
        <h2 className="text-xl font-medium text-slate-600 mb-1">메뉴를 선택해주세요</h2>
        <p className="text-sm">왼쪽 사이드바에서 작업을 시작할 메뉴를 선택하세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50/50 pt-1 px-4 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`
                group relative flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-t-lg cursor-pointer transition-colors border-t border-x
                ${isActive 
                  ? 'bg-white border-slate-200 text-indigo-600 z-10 -mb-[1px] border-b-white' 
                  : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'}
              `}
            >
              <span>{tab.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={`
                  p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all
                  ${isActive ? 'hover:bg-indigo-100 text-indigo-400' : 'hover:bg-slate-300 text-slate-400'}
                `}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Content Area (Keep-Alive) */}
      <div className="flex-1 overflow-auto bg-white p-6 relative">
        {tabs.map((tab) => (
          <div 
            key={tab.id} 
            style={{ display: tab.id === activeTabId ? 'block' : 'none', height: '100%' }}
          >
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
}
