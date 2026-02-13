'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  ChevronRight,
  UserX,
  AlertCircle,
  List,
  BarChart3
} from 'lucide-react';

  import { getTurn2Data, getTurn2WeeklyData, AbsenceRecord, WeeklyTurn2Summary } from './actions';

  export default function Turn2Page() {
    // Default to Today for End Date
    const today = new Date();
    // Default Start Date: 1st day of current month (2026 context)
    // For consistency with user context (2026), we might hardcode 2026 if 'today' is 2026.
    // Assuming system time is correct per metadata (2026-02-12).
    
    // Helper to format date
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return formatDate(d);
    });
    
    const [endDate, setEndDate] = useState(() => formatDate(new Date()));

    const [results, setResults] = useState<AbsenceRecord[]>([]);
    const [weeklyResults, setWeeklyResults] = useState<WeeklyTurn2Summary[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'weekly'>('list');
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSetThisMonth = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      // End Date = Today (User Request: Don't show future dates as absent)
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
        const data = await getTurn2Data(startDate, endDate);
        setResults(data);
        const weekly = await getTurn2WeeklyData(startDate, endDate);
        setWeeklyResults(weekly);
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
            
            {/* Search Input */}
             <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="기사명 검색" 
                className="pl-3 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-32 outline-none focus:border-indigo-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={14} /> 목록
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart3 size={14} /> 주간요약
              </button>
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

      </div>

      {/* Results Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {viewMode === 'list' ? (
          results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">운행 일자</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">요일</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">운행 도크</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">기사명</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">연락처</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-center">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results
                    .filter(r => !searchTerm || r.driverName.includes(searchTerm))
                    .map((record, idx) => (
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
                      <td className="px-6 py-4 text-[13px] font-mono text-slate-500">{record.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                          2회전
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                <AlertCircle size={32} className="text-slate-300" />
              </div>
              <p className="font-medium text-sm">조회된 이회전 차량이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">조회 버튼을 눌러 데이터를 확인하세요.</p>
            </div>
          )
        ) : (
          /* Weekly View */
          weeklyResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">기사명</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">차량번호</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-right text-emerald-600">평일(월~금)</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-right text-blue-600">토요일</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-right text-rose-600">일요일</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase text-right">합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {weeklyResults
                     .filter(r => !searchTerm || r.driverName.includes(searchTerm))
                     .map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">{row.driverName}</td>
                      <td className="px-6 py-4 text-[13px] font-mono text-slate-500">{row.vehicleNumber}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-right text-emerald-600 bg-emerald-50/30">
                        {row.weekdayCount > 0 ? `${row.weekdayCount}회` : '-'}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-right text-blue-600 bg-blue-50/30">
                        {row.saturdayCount > 0 ? `${row.saturdayCount}회` : '-'}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-right text-rose-600 bg-rose-50/30">
                        {row.sundayCount > 0 ? `${row.sundayCount}회` : '-'}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-right text-slate-800 bg-slate-50">
                        {row.total}회
                      </td>
                    </tr>
                   ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
              <div className="p-4 bg-slate-50 rounded-full mb-3">
                 <BarChart3 size={32} className="text-slate-300" />
              </div>
              <p className="font-medium text-sm">집계된 데이터가 없습니다.</p>
            </div>
          )
        )}
      </div>

      <div className="flex justify-end text-[11px] text-slate-400">
        <p>* 하루에 서로 다른 2개 이상의 도크(정수 기준)에서 배차된 차량을 조회합니다.</p>
      </div>
    </div>
  );
}
