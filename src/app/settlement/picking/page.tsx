'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  DollarSign
} from 'lucide-react';

export default function PickingSettlementPage() {
  const [startDate, setStartDate] = useState('2024-02-01');
  const [endDate, setEndDate] = useState('2024-02-29');

  // Dummy data for matrix representation
  const centers = ['신선센터', '상온센터', '허브센터'];
  const dates = Array.from({ length: 15 }, (_, i) => `2024-02-${(i + 1).toString().padStart(2, '0')}`);

  return (
    <div className="space-y-6 relative">


      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-slate-100/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
        <div className="glass rounded-2xl border border-white shadow-[0_8px_20px_rgb(0,0,0,0.04)] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <Calendar size={16} className="text-indigo-500" />
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                />
                <ChevronRight size={14} className="text-slate-300" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['당월', '전월', '15일', '정산주기'].map((preset) => (
                <button 
                  key={preset}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                    preset === '당월' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              <RotateCcw size={16} />
              초기화
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
              <Search size={16} />
              조회하기
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '전체 정산 건수', value: '1,248건', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: '정산 대상 일수', value: '29일', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '평균 일일 물동량', value: '43.2 PL', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '총 정산 금액', value: '₩24,850,000', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pivot Grid Table Section */}
      <div className="glass rounded-3xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
              {/* Double Header: Center Layer */}
              <tr>
                <th className="sticky left-0 z-30 bg-slate-50 px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 min-w-[120px]">
                  정산 일자
                </th>
                {centers.map(center => (
                  <th key={center} colSpan={2} className="px-6 py-3 text-[12px] font-bold text-slate-700 text-center border-r border-slate-100 bg-slate-100/50">
                    {center}
                  </th>
                ))}
                <th colSpan={3} className="sticky right-0 z-30 bg-indigo-50/90 px-6 py-3 text-[12px] font-bold text-indigo-900 text-center">
                  일자별 합계 요약
                </th>
              </tr>
              {/* Double Header: Unit Layer */}
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 z-30 bg-slate-50 border-r border-slate-100"></th>
                {centers.map(center => (
                  <React.Fragment key={`${center}-units`}>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-500 text-center bg-white border-r border-slate-50">BOX</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-500 text-center bg-white border-r border-slate-100">PL</th>
                  </React.Fragment>
                ))}
                <th className="sticky right-[160px] z-30 bg-indigo-50 px-4 py-2 text-[10px] font-bold text-indigo-600 text-center border-l border-indigo-100">BOX 합계</th>
                <th className="sticky right-[80px] z-30 bg-emerald-50 px-4 py-2 text-[10px] font-bold text-emerald-600 text-center border-l border-emerald-100">PL 합계</th>
                <th className="sticky right-0 z-30 bg-amber-50 px-4 py-2 text-[10px] font-bold text-amber-600 text-center border-l border-amber-100">정산 금액</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {dates.map((date, idx) => (
                <tr key={date} className={`group hover:bg-slate-50 transition-colors ${idx % 7 === 5 || idx % 7 === 6 ? 'bg-slate-50/30' : ''}`}>
                  <td className="sticky left-0 z-10 bg-inherit px-6 py-4 text-[13px] font-bold text-slate-600 border-r border-slate-100">
                    {date}
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                      idx % 7 === 5 ? 'bg-indigo-100 text-indigo-600' : idx % 7 === 6 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {['월', '화', '수', '목', '금', '토', '일'][idx % 7]}
                    </span>
                  </td>
                  {centers.map(center => (
                    <React.Fragment key={`${date}-${center}`}>
                      <td className="px-4 py-4 text-[13px] font-medium text-slate-700 text-center border-r border-slate-50">
                        {Math.floor(Math.random() * 100)}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-medium text-slate-700 text-center border-r border-slate-100">
                        {Math.floor(Math.random() * 5)}
                      </td>
                    </React.Fragment>
                  ))}
                  {/* Summary Columns */}
                  <td className="sticky right-[160px] z-10 bg-indigo-50/30 group-hover:bg-indigo-50 px-4 py-4 text-[13px] font-black text-indigo-700 text-center border-l border-indigo-100">
                    245
                  </td>
                  <td className="sticky right-[80px] z-10 bg-emerald-50/30 group-hover:bg-emerald-50 px-4 py-4 text-[13px] font-black text-emerald-700 text-center border-l border-emerald-100">
                    12.5
                  </td>
                  <td className="sticky right-0 z-10 bg-amber-50/30 group-hover:bg-amber-50 px-4 py-4 text-[13px] font-black text-amber-700 text-center border-l border-amber-100">
                    850,000
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 z-20 bg-slate-800 text-white font-bold">
              <tr>
                <td className="sticky left-0 z-30 bg-slate-900 px-6 py-4 text-[12px] uppercase">총계 (Summary)</td>
                {centers.map(center => (
                  <React.Fragment key={`${center}-total`}>
                    <td className="px-4 py-4 text-center border-r border-slate-700">1,240</td>
                    <td className="px-4 py-4 text-center border-r border-slate-600">64.5</td>
                  </React.Fragment>
                ))}
                <td className="sticky right-[160px] z-30 bg-indigo-900 px-4 py-4 text-center border-l border-indigo-800">3,720</td>
                <td className="sticky right-[80px] z-30 bg-emerald-900 px-4 py-4 text-center border-l border-emerald-800">193.5</td>
                <td className="sticky right-0 z-30 bg-amber-600 px-4 py-4 text-center border-l border-amber-500">12,500,000</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-2">
        <p>* 모든 데이터는 실시간 집계를 기준으로 하며, 공식 정산 금액과 차이가 있을 수 있습니다.</p>
        <p>최종 업데이트: 2024-02-12 00:30:15</p>
      </div>
    </div>
  );
}
