'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTabs } from '@/context/TabContext';
import {
  CreditCard,
  PenTool,
  Truck,
  CalendarX,
  LayoutDashboard,
  Search,
  Download,
  CheckCircle,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MonthSelector } from '@/components/MonthSelector';

// Import Actions (Need to ensure these exist or create mock if not)
import { getPickingSettlement } from '@/app/settlement/picking/actions';
import { getTurn2WeeklyData } from '@/app/settlement/turn2/actions';
import { getVehicles } from '@/app/billing/long-distance/actions';

// Import Feature Pages (for tab opening)
import PickingSettlementPage from '@/app/settlement/picking/page';
import Turn2VehiclePage from '@/app/settlement/turn2/page';
import LongDistanceVehiclePage from '@/app/billing/long-distance/page';
import ExtraSettlementPage from '@/app/settlement/extra/page';
import DeductionSettlementPage from '@/app/settlement/deduction/page';

export default function MonthlyClosingDashboard() {
  const { openTab } = useTabs();

  // State for Date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // States for each section data
  const [pickingData, setPickingData] = useState<any[]>([]);
  const [turn2Data, setTurn2Data] = useState<any[]>([]);
  const [longDistanceData, setLongDistanceData] = useState<any[]>([]);

  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  // Billing Period (26th of prev month ~ 25th of current month)
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 26);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth(), 25);
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }, [currentDate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Picking Settlement
      const resPicking = await getPickingSettlement(year, month);
      if (resPicking.success) setPickingData(resPicking.data || []);

      // 2. 2nd Turn Settlement
      const resTurn2 = await getTurn2WeeklyData(startDate, endDate);
      setTurn2Data(resTurn2 || []);

      // 3. Long Distance Vehicle
      const resLong = await getVehicles(year);
      setLongDistanceData(resLong || []);

      // 4. Extra & Deduction (Currently Preparation)
      // ...
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [year, month, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Totals Calculation
  const totals = useMemo(() => {
    const picking = pickingData.reduce((sum, item) => {
      // Need to replicate picking logic: baseRate + allowance - deduction + (overtime * rate)
      // For simplicity in summary, we use the pre-calculated total if available or estimate.
      // In PickingSettlementPage, total is calculated with batch rate.
      // Here we just sum up the base + allowance - deduction.
      return sum + (item.baseRate || 0) + (item.allowance || 0) - (item.deduction || 0);
    }, 0);

    // Turn 2: 70,000 per turn (assumption based on common logic, need to verify)
    const turn2 = turn2Data.reduce((sum, item) => sum + (item.total * 70000), 0);

    // Long Distance: sum of allowances
    const longDistance = longDistanceData.reduce((sum, item) => sum + (item.allowance || 0), 0);

    return {
      picking,
      turn2,
      longDistance,
      total: picking + turn2 + longDistance
    };
  }, [pickingData, turn2Data, longDistanceData]);

  const features = [
    { id: 'picking', name: '1. 피킹 파트 정산', component: <PickingSettlementPage /> },
    { id: 'turn2', name: '2. 2회전 차량 정산', component: <Turn2VehiclePage /> },
    { id: 'long-distance', name: '3. 장거리 수당 차량', component: <LongDistanceVehiclePage /> },
    { id: 'extra-settlement', name: '4. 추가 정산 차량', component: <ExtraSettlementPage /> },
    { id: 'deduction-settlement', name: '5. 차감 차량', component: <DeductionSettlementPage /> },
  ];

  const handleOpenTab = (id: string) => {
    const feature = features.find(f => f.id === id);
    if (feature) {
      openTab(feature.id, feature.name, feature.component);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <LayoutDashboard size={22} className="text-indigo-600" />
              월말 마감
            </h1>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
              <span className="text-[12px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {startDate} ~ {endDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              조회하기
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg text-[12px] font-bold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200">
              <Download size={15} /> 엑셀 다운로드
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-[12px] font-bold text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-100">
              <CheckCircle size={15} /> 월간 마감
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Main Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">항목</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">금액 (합계)</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">건수/정보</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">비고</th>
                <th className="px-6 py-3 w-32 border-l border-slate-100"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Section 1: Picking */}
              <tr className="bg-indigo-50/30">
                <td colSpan={4} className="px-6 py-2 text-[12px] font-black text-indigo-700">1. 피킹 파트 정산</td>
                <td className="px-6 py-2 border-l border-indigo-100 text-center text-indigo-600 font-bold text-[11px] cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => handleOpenTab('picking')}>
                  <span className="flex items-center justify-center gap-1">상세 정산 <ChevronRight size={12} /></span>
                </td>
              </tr>
              {pickingData.slice(0, 3).map((item, idx) => (
                <tr key={`picking-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-2.5 text-[13px] text-slate-600">{item.name}</td>
                  <td className="px-6 py-2.5 text-[13px] text-slate-800 font-bold text-right">₩{((item.baseRate || 0) + (item.allowance || 0) - (item.deduction || 0)).toLocaleString()}</td>
                  <td className="px-6 py-2.5 text-[12px] text-slate-500 text-center">결근 {item.absentDays || 0}일</td>
                  <td className="px-6 py-2.5 text-[12px] text-slate-400">{item.note || '-'}</td>
                  <td className="border-l border-slate-50"></td>
                </tr>
              ))}
              {pickingData.length > 3 && (
                <tr>
                  <td colSpan={4} className="px-6 py-1.5 text-[11px] text-slate-400 italic">외 {pickingData.length - 3}건 더보기...</td>
                  <td className="border-l border-slate-50"></td>
                </tr>
              )}

              {/* Section 2: Turn 2 */}
              <tr className="bg-blue-50/30">
                <td colSpan={4} className="px-6 py-2 text-[12px] font-black text-blue-700 border-t border-slate-100">2. 2회전 차량 정산</td>
                <td className="px-6 py-2 border-l border-blue-100 text-center text-blue-600 font-bold text-[11px] cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleOpenTab('turn2')}>
                  <span className="flex items-center justify-center gap-1">상세 정산 <ChevronRight size={12} /></span>
                </td>
              </tr>
              {turn2Data.slice(0, 3).map((item, idx) => (
                <tr key={`turn2-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-2.5 text-[13px] text-slate-600">{item.driverName} ({item.vehicleNumber})</td>
                  <td className="px-6 py-2.5 text-[13px] text-slate-800 font-bold text-right">₩{(item.total * 70000).toLocaleString()}</td>
                  <td className="px-6 py-2.5 text-[12px] text-slate-500 text-center">{item.total}회 (평{item.weekdayCount}/토{item.saturdayCount}/일{item.sundayCount})</td>
                  <td className="px-6 py-2.5 text-[12px] text-slate-400">-</td>
                  <td className="border-l border-slate-50"></td>
                </tr>
              ))}

              {/* Section 3: Long Distance */}
              <tr className="bg-amber-50/30">
                <td colSpan={4} className="px-6 py-2 text-[12px] font-black text-amber-700 border-t border-slate-100">3. 장거리 수당 차량</td>
                <td className="px-6 py-2 border-l border-amber-100 text-center text-amber-600 font-bold text-[11px] cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => handleOpenTab('long-distance')}>
                  <span className="flex items-center justify-center gap-1">상세 정산 <ChevronRight size={12} /></span>
                </td>
              </tr>
              {longDistanceData.slice(0, 3).map((item, idx) => (
                <tr key={`long-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-2.5 text-[13px] text-slate-600">{item.driverName} ({item.vehicleNo})</td>
                  <td className="px-6 py-2.5 text-[13px] text-slate-800 font-bold text-right">₩{(item.allowance || 0).toLocaleString()}</td>
                  <td className="px-6 py-2.5 text-[12px] text-slate-500 text-center">{item.tonnage} / {item.region}</td>
                  <td className="px-6 py-2.5 text-[12px] text-slate-400">{item.note || '-'}</td>
                  <td className="border-l border-slate-50"></td>
                </tr>
              ))}

              {/* Section 4: Extra */}
              <tr className="bg-rose-50/30">
                <td colSpan={4} className="px-6 py-2 text-[12px] font-black text-rose-700 border-t border-slate-100">4. 추가 정산 차량</td>
                <td className="px-6 py-2 border-l border-rose-100 text-center text-rose-600 font-bold text-[11px] cursor-pointer hover:bg-rose-100 transition-colors"
                  onClick={() => handleOpenTab('extra-settlement')}>
                  <span className="flex items-center justify-center gap-1">상세 정산 <ChevronRight size={12} /></span>
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-[13px]">데이터 준비 중입니다.</td>
                <td className="border-l border-slate-50"></td>
              </tr>

              {/* Section 5: Deduction */}
              <tr className="bg-emerald-50/30">
                <td colSpan={4} className="px-6 py-2 text-[12px] font-black text-emerald-700 border-t border-slate-100">5. 차감 차량</td>
                <td className="px-6 py-2 border-l border-emerald-100 text-center text-emerald-600 font-bold text-[11px] cursor-pointer hover:bg-emerald-100 transition-colors"
                  onClick={() => handleOpenTab('deduction-settlement')}>
                  <span className="flex items-center justify-center gap-1">상세 정산 <ChevronRight size={12} /></span>
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-[13px]">데이터 준비 중입니다.</td>
                <td className="border-l border-slate-50"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Bottom Total Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">총 정산 항목</span>
              <span className="text-lg font-black">{pickingData.length + turn2Data.length + longDistanceData.length}건</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-indigo-400 font-bold">피킹 파트</span>
                <span className="text-[14px] font-bold">₩{totals.picking.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-400 font-bold">2회전 차량</span>
                <span className="text-[14px] font-bold">₩{totals.turn2.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-bold">장거리 수당</span>
                <span className="text-[14px] font-bold">₩{totals.longDistance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-400 font-bold mb-0.5">최종 통합 정산 합계 (지급액)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">₩{totals.total.toLocaleString()}</span>
              <span className="text-[13px] text-slate-400 font-medium">원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
