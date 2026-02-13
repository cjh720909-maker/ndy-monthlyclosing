'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  component: ReactNode;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (id: string, label: string, component: ReactNode) => void;
  closeTab: (id: string) => void;
  setActiveTabId: (id: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = (id: string, label: string, component: ReactNode) => {
    setTabs((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (existing) {
        return prev;
      }
      return [...prev, { id, label, component }];
    });
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== id);
      if (activeTabId === id) {
        // If closing active tab, switch to last available or null
        const lastTab = newTabs[newTabs.length - 1];
        setActiveTabId(lastTab ? lastTab.id : null);
      }
      return newTabs;
    });
  };

  return (
    <TabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, setActiveTabId }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
}
