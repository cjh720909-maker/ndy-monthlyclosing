'use client';

import React from 'react';
import { useTabs } from '@/context/TabContext';
import { 
  CreditCard,
  PenTool,
  Truck,
  CalendarX,
  LayoutDashboard
} from 'lucide-react';

// Import Feature Pages
import PickingSettlementPage from '@/app/settlement/picking/page';
import AdditionalCostPage from '@/app/billing/additional-cost/page';
import LongDistanceVehiclePage from '@/app/billing/long-distance/page';
import VehicleAbsencePage from '@/app/settlement/absence/page';
import Turn2VehiclePage from '@/app/settlement/turn2/page';

export default function MonthlyClosingDashboard() {
  const { openTab, setActiveTabId } = useTabs();

  const features = [
    { 
      id: 'picking',
      name: '피킹 파트 정산', 
      desc: 'Picking Settlement', 
      component: <PickingSettlementPage />,
      icon: CreditCard,
      color: 'bg-indigo-500' 
    },
    { 
      id: 'additional-cost',
      name: '추가 비용 등록', 
      desc: 'Additional Cost', 
      component: <AdditionalCostPage />,
      icon: PenTool,
      color: 'bg-rose-500' 
    },
    { 
      id: 'long-distance',
      name: '장거리 및 기타 추가 등록', 
      desc: 'Long-distance Truck', 
      component: <LongDistanceVehiclePage />,
      icon: Truck,
      color: 'bg-amber-500' 
    },
    { 
      id: 'absence',
      name: '차량 결근 조회', 
      desc: 'Vehicle Absence', 
      component: <VehicleAbsencePage />,
      icon: CalendarX,
      color: 'bg-emerald-500' 
    },
    { 
      id: 'turn2',
      name: '이회전 차량 조회', 
      desc: '2nd Turn Vehicle', 
      component: <Turn2VehiclePage />,
      icon: Truck,
      color: 'bg-blue-500' 
    },
  ];

  // Auto-open tabs on mount
  React.useEffect(() => {
    // Open all tabs sequentially
    features.forEach(feature => {
      openTab(feature.id, feature.name, feature.component);
    });
    
    // Set the first tab as active (Picking Settlement)
    // We add a small delay to ensure the state update processes the new tabs
    const timer = setTimeout(() => {
       if (features.length > 0) {
         setActiveTabId(features[0].id);
       }
    }, 50);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <LayoutDashboard className="text-indigo-600" />
          월말 마감 (Monthly Closing)
        </h1>
        <p className="text-slate-500 mt-1">
          월 마감 작업에 필요한 기능을 선택하세요. 각 기능은 새로운 탭으로 열립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => openTab(feature.id, feature.name, feature.component)}
              className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left"
            >
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={100} className="text-slate-900" />
              </div>
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${feature.color} text-white shadow-lg shadow-indigo-100`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                실행하기 
                <span className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
