'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Loader2,
  Clock,
  User,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { getOvertimeData, OvertimeItem } from './actions';
import { formatDate } from '@/lib/utils';

export default function OvertimePage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OvertimeItem[]>([]);
  const [summary, setSummary] = useState<{name: string, total: number, count: number, totalAmount: number}[]>([]);
  const [standardRate, setStandardRate] = useState(0);

  const handleSearch = async (s = startDate, e = endDate) => {
    setLoading(true);
    const result = await getOvertimeData(s, e);
    if (result.success && result.data) {
      setData(result.data);
      const rate = result.standardHourlyRate || 0;
      setStandardRate(rate);
      calculateSummary(result.data, rate);
    }
    setLoading(false);
  };

  const handleSetThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const s = formatDate(start);
    const e = formatDate(now);
    setStartDate(s);
    setEndDate(e);
    handleSearch(s, e);
  };

  const handleSetPrevMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    const s = formatDate(start);
    const e = formatDate(end);
    setStartDate(s);
    setEndDate(e);
    handleSearch(s, e);
  };

  const calculateSummary = (items: OvertimeItem[], rate: number) => {
    const map = new Map<string, { total: number, count: number }>();
    items.forEach(item => {
      if (item.parsedHours > 0) {
        const current = map.get(item.name) || { total: 0, count: 0 };
        map.set(item.name, {
          total: current.total + item.parsedHours,
          count: current.count + 1
        });
      }
    });

    const summaryList = Array.from(map.entries())
      .map(([name, { total, count }]) => ({ 
        name, 
        total, 
        count,
        totalAmount: Math.floor(total * rate)
      }))
      .sort((a, b) => b.total - a.total);
    
    setSummary(summaryList);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-4">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <Calendar size={14} className="ml-2 text-indigo-500" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 py-1.5 px-2 focus:outline-none"
            />
            <span className="text-slate-300">~</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 py-1.5 px-2 focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
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

          <button 
            onClick={() => handleSearch()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
            조회
          </button>
        </div>

        {/* Standard Rate Info */}
        <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <Clock size={16} />
            </div>
            <div>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">적용 표준 시단가 (4h 기준)</p>
                <p className="text-sm font-bold text-slate-800 font-sans">
                    ₩{standardRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ hr</span>
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Summary Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Clock size={16} className="text-indigo-600" />
                      기사별 근무 합계
                  </h3>
              </div>
              <div className="flex-1 overflow-auto p-2">
                  <table className="w-full text-sm">
                      <thead className="text-xs text-slate-500 bg-slate-50 uppercase sticky top-0">
                          <tr>
                              <th className="px-3 py-2 text-left">기사명</th>
                              <th className="px-3 py-2 text-right">근무횟수</th>
                              <th className="px-3 py-2 text-right">총 시간</th>
                              <th className="px-3 py-2 text-right">연장수당</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {summary.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                  <td className="px-3 py-2.5 font-bold text-slate-700">{item.name}</td>
                                  <td className="px-3 py-2.5 text-right text-slate-500">{item.count}회</td>
                                  <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-600">
                                      {item.total.toFixed(1)} hr
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">
                                      ₩{item.totalAmount.toLocaleString()}
                                  </td>
                              </tr>
                          ))}
                          {summary.length === 0 && (
                              <tr>
                                  <td colSpan={3} className="py-8 text-center text-xs text-slate-400">데이터가 없습니다.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Details List */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <User size={16} className="text-slate-500" />
                      상세 내역 (t_il_kun)
                  </h3>
                  <span className="text-xs text-slate-400">총 {data.length} 건</span>
              </div>
              <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider sticky top-0 z-10">
                          <tr>
                              <th className="px-4 py-3 border-b">날짜</th>
                              <th className="px-4 py-3 border-b">기사명</th>
                              <th className="px-4 py-3 border-b">근무내용</th>
                              <th className="px-4 py-3 border-b text-right">시간</th>
                              <th className="px-4 py-3 border-b text-right">시단가</th>
                              <th className="px-4 py-3 border-b text-right">금액</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {loading ? (
                              <tr>
                                  <td colSpan={6} className="py-20 text-center text-slate-400">
                                      <Loader2 className="animate-spin mx-auto mb-2" />
                                      로딩 중...
                                  </td>
                              </tr>
                          ) : data.length === 0 ? (
                              <tr>
                                  <td colSpan={6} className="py-20 text-center text-slate-400">
                                      조회된 데이터가 없습니다.
                                  </td>
                              </tr>
                          ) : (
                              data.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{item.date}</td>
                                      <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">{item.name}</td>
                                      <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[150px]" title={item.gubun}>
                                          {item.gubun}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-500">
                                          {item.parsedHours > 0 ? `${item.parsedHours}h` : '-'}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono text-slate-400 text-xs">
                                          {standardRate > 0 ? `₩${standardRate.toLocaleString()}` : '-'}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600">
                                          {item.parsedHours > 0 && standardRate > 0 
                                            ? `₩${Math.floor(item.parsedHours * standardRate).toLocaleString()}` 
                                            : '-'}
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      
      <div className="flex justify-end text-[11px] text-slate-400 gap-2">
        <AlertCircle size={12} />
        <span>근무 내용(IK_GUBUN)에서 '시간', '분' 텍스트를 파싱하여 계산된 결과입니다.</span>
      </div>
    </div>
  );
}
