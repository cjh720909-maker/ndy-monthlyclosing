'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { TabProvider } from '@/context/TabContext';
import TabManager from '@/components/TabManager';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <TabProvider>
      <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
          {/* Global Hamburger Button */}
          {!sidebarOpen && (
            <button
              type="button"
              className="fixed top-6 left-6 z-50 p-2.5 text-indigo-900 bg-white/90 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white hover:bg-white transition-all duration-300 group active:scale-95"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          )}
          <main className="flex-1 overflow-x-hidden p-0 flex flex-col h-full">
            <TabManager />
          </main>
        </div>
      </div>
    </TabProvider>
  );
}
