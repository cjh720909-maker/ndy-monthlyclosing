'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  ChevronRight,
  UserX,
  AlertCircle,
  FileText,
  List
} from 'lucide-react';
import { getAbsenceData, getAbsenceSummary, AbsenceRecord, AbsenceSummary } from './actions';

export default function VehicleAbsencePage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));

  // Modes: 'detail' | 'summary'
  const [viewMode, setViewMode] = useState<'detail' | 'summary'>('detail');

  const [detailResults, setDetailResults] = useState<AbsenceRecord[]>([]);
  const [summaryResults, setSummaryResults] = useState<AbsenceSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to format date
  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const handleSetThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(formatDate(start));
    setEndDate(formatDate(now));
  };

  const handleSetPrevMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // Fetch both (or optimized to fetch only active view, but fetching both is fine for now)
      // Actually, let's fetch based on viewMode or just fetch summary which is derived from data
      // For simplicity/performance, let's fetch appropriately.
      
      // If we want consistent data, fetching both is safer or just fetching raw and summarizing on client.
      // But we made server action for summary. Let's call both parallel or just active.
      
      const [details, summary] = await Promise.all([
        getAbsenceData(startDate, endDate),
        getAbsenceSummary(startDate, endDate)
      ]);
      
      setDetailResults(details);
      setSummaryResults(summary);
      
    } catch (error) {
      console.error(error);
      alert('데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4 relative max-w-[1200px] mx-auto pt-2">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 py-2 bg-slate-100/95 backdrop-blur-md transition-all">
        <div className="glass rounded-xl border border-white shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-200/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('detail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-md transition-all ${
                  viewMode === 'detail' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List size={14} />
                상세 내역
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-md transition-all ${
                  viewMode === 'summary' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText size={14} />
                요약 (Summary)
              </button>
            </div>

            <div className="h-6 w-px bg-slate-300 mx-1" />

            {/* Date Range Picker */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Calendar size={14} className="text-indigo-500" />
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none"
                />
                <ChevronRight size={12} className="text-slate-300" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none"
                />
              </div>
            </div>

            {/* Helper Buttons */}
            <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-xl">
              <button 
                onClick={handleSetThisMonth}
                className="px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all"
              >
                당월
              </button>
              <button 
                onClick={handleSetPrevMonth}
                className="px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all"
              >
                전월
              </button>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-xl text-[13px] font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-md shadow-rose-200 disabled:opacity-50"
          >
            {isSearching ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={14} />
            )}
            조회하기
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {viewMode === 'detail' ? (
          // Detail View
          detailResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">결근 일자</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">요일</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">도크번호</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">기사명</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">차량번호</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">연락처</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailResults.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-700">{record.date}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-600">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                          record.dayOfWeek === '토' ? 'bg-blue-50 text-blue-600' : 
                          record.dayOfWeek === '일' ? 'bg-rose-50 text-rose-600' : 
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {record.dayOfWeek}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-indigo-700">{record.dockNumber}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">{record.driverName}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-600">{record.vehicleNumber}</td>
                      <td className="px-6 py-4 text-[13px] font-mono text-slate-500">{record.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-100">
                          결근
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="조회된 상세 결근 데이터가 없습니다." />
          )
        ) : (
          // Summary View
          summaryResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">도크번호</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">기사명</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">차량번호</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase w-1/3">결근 상세 (일자)</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-center">총 횟수</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-right">차감 금액 (예상)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryResults.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-[13px] font-bold text-indigo-700">{record.dockNumber}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">{record.driverName}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-600">{record.vehicleNumber}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-600 leading-relaxed">
                        {record.displayDates}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                          {record.totalCount}회
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <input 
                           type="text" 
                           placeholder="금액 입력"
                           className="w-32 px-2 py-1 text-right text-sm border border-slate-200 rounded focus:border-indigo-500 outline-none"
                         />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="조회된 요약 데이터가 없습니다." />
          )
        )}
      </div>

      <div className="flex justify-end text-[11px] text-slate-400">
        <p>* 정규 기사(용차 제외) 중 월~금 배차 기록이 없는 경우를 조회합니다.</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
      <div className="p-4 bg-slate-50 rounded-full mb-3">
        <AlertCircle size={32} className="text-slate-300" />
      </div>
      <p className="font-medium text-sm">{message}</p>
      <p className="text-xs text-slate-400 mt-1">조회 버튼을 눌러 데이터를 확인하세요.</p>
    </div>
  );
}
