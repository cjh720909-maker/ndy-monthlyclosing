'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Download, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { getPickingSettlement } from './actions';

export default function PickingSettlementPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    const result = await getPickingSettlement(year, month);
    if (result.success) {
      setData(result.data || []);
    }
    setLoading(false);
  };

  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <select 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 py-1.5 px-3 focus:outline-none"
            >
              <option value="2024">2024년</option>
              <option value="2025">2025년</option>
              <option value="2026">2026년</option>
            </select>
            <div className="w-px h-4 bg-slate-300"></div>
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 py-1.5 px-3 focus:outline-none"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                  {i + 1}월
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Search size={14} />
            조회
          </button>
        </div>

        <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-200">
                <span className="opacity-70 mr-2 text-xs font-normal">총 지급액</span>
                ₩ {totalAmount.toLocaleString()}
            </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 border-b text-center w-16">No</th>
              <th className="px-6 py-3 border-b">기사명</th>
              <th className="px-6 py-3 border-b text-right">기본급+수당</th>
              <th className="px-6 py-3 border-b text-center">시급 (시간)</th>
              <th className="px-6 py-3 border-b text-right text-red-500">차감액 (결근)</th>
              <th className="px-6 py-3 border-b text-right text-blue-500">연장수당</th>
              <th className="px-6 py-3 border-b text-right font-bold text-slate-900 bg-slate-100/50">총지급액</th>
              <th className="px-6 py-3 border-b text-center w-24">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <span>데이터를 불러오는 중...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center text-slate-400">
                  조회된 데이터가 없습니다.
                </td>
              </tr>
            ) : (
                data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                            {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                            {item.name}
                            {item.absentDays > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded font-medium">
                                    결근 {item.absentDays}일
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-600">
                            {(item.baseRate + item.allowance).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-slate-500 text-xs">
                            {item.hourlyRate.toLocaleString()}원
                            <span className="block text-slate-400">({item.workingHours}hr)</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-red-500 font-medium">
                            {item.deduction > 0 ? `-${item.deduction.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-blue-500 font-medium">
                            {item.addition > 0 ? `+${item.addition.toLocaleString()}` : '-'}
                            {item.overtimeHours > 0 && (
                                <span className="block text-[10px] text-blue-400">({item.overtimeHours}hr)</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-indigo-900 bg-indigo-50/30 group-hover:bg-indigo-50/50 transition-colors">
                            {item.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-slate-400 truncate max-w-[200px]">
                            {item.note}
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-400">
        <AlertCircle size={14} />
        <span>일할 계산: (기본급+수당)/26  |  시급: 일할/근무시간  |  연장수당: 시급×연장시간</span>
      </div>
    </div>
  );
}
