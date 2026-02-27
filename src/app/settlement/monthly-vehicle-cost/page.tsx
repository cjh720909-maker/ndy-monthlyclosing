'use client';

import React, { useState, useEffect } from 'react';
import { 
  getMonthlyCosts, 
  saveMonthlyCosts, 
  getPreviousYearCosts,
  type MonthlyVehicleCostInput 
} from '@/app/actions/monthly-vehicle-cost';

export default function MonthlyVehicleCostPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [costs, setCosts] = useState<MonthlyVehicleCostInput>({
    cost1T: 0,
    cost2T: 0,
    cost2_5T: 0,
    cost3T: 0,
    cost3_5T: 0,
    cost5T: 0,
    cost5TAxis: 0,
  });
  const [prevCosts, setPrevCosts] = useState<MonthlyVehicleCostInput | null>(null);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currentRes, prevRes] = await Promise.all([
        getMonthlyCosts(year),
        getPreviousYearCosts(year)
      ]);

      if (currentRes.success && currentRes.data) {
        const { cost1T, cost2T, cost2_5T, cost3T, cost3_5T, cost5T, cost5TAxis } = currentRes.data;
        setCosts({ cost1T, cost2T, cost2_5T, cost3T, cost3_5T, cost5T, cost5TAxis });
      } else {
        setCosts({
          cost1T: 0,
          cost2T: 0,
          cost2_5T: 0,
          cost3T: 0,
          cost3_5T: 0,
          cost5T: 0,
          cost5TAxis: 0,
        });
      }

      if (prevRes.success && prevRes.data) {
        const { cost1T, cost2T, cost2_5T, cost3T, cost3_5T, cost5T, cost5TAxis } = prevRes.data;
        setPrevCosts({ cost1T, cost2T, cost2_5T, cost3T, cost3_5T, cost5T, cost5TAxis });
      } else {
        setPrevCosts(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await saveMonthlyCosts(year, costs);
      if (res.success) {
        alert('저장되었습니다.');
        fetchData(); 
      } else {
        alert('저장 실패: ' + res.error);
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MonthlyVehicleCostInput, value: string) => {
    const numValue = parseInt(value.replace(/,/g, '')) || 0;
    setCosts(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateDiff = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) return { diff: 0, percent: 0 };
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    return { diff, percent };
  };

  const calculateDailyRate = (amount: number, days: number) => {
    if (!amount) return 0;
    const totalAmount = amount * 10000;
    const dailyPrice = Math.ceil(totalAmount / days / 1000) * 1000;
    return dailyPrice / 10000;
  };

  const renderRow = (label: string, field: keyof MonthlyVehicleCostInput) => {
    const currentVal = costs[field];
    const prevVal = prevCosts?.[field];
    const { diff, percent } = calculateDiff(currentVal, prevVal);
    
    // Fixed for 6-day work week
    const daily25 = calculateDailyRate(currentVal, 25);
    const daily26 = calculateDailyRate(currentVal, 26);

    return (
      <div className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
        <div className="col-span-2 text-gray-700 font-medium text-sm">{label}</div>
        <div className="col-span-3">
          <input
            type="text"
            value={currentVal.toLocaleString()}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
          />
        </div>
        <div className="col-span-3 flex flex-col gap-1 text-sm text-right pr-4">
          <div className="flex justify-between px-2">
            <span className="text-gray-400 text-xs">25일</span>
            <span className="font-medium text-gray-700">{daily25.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
          <div className="flex justify-between px-2">
            <span className="text-gray-400 text-xs">26일</span>
            <span className="font-medium text-gray-700">{daily26.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
        </div>
        <div className="col-span-2 text-right text-sm">
          {prevVal ? (
            <span className="text-gray-500">{prevVal.toLocaleString()}</span>
          ) : (
            <span className="text-gray-300">-</span>
          )}
        </div>
        <div className="col-span-2 text-right flex flex-col items-end gap-1">
          <span className={`${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-gray-400'} font-medium text-sm`}>
            {diff > 0 ? '+' : ''}{diff.toLocaleString()}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-flex items-center w-fit ${diff > 0 ? 'bg-red-100 text-red-600' : diff < 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {diff > 0 ? '▲' : diff < 0 ? '▼' : ''} {Math.abs(percent).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고정차량 월 지급액 관리</h1>
          <p className="text-gray-500 mt-1 text-sm">차종별 월 지급액을 관리하고 전년도 대비 증감률을 확인합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
          >
            {Array.from({ length: (new Date().getFullYear() + 2) - 2020 + 1 }, (_, i) => 2020 + i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-sm font-medium"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
              6일 근무 기준
            </span>
          </div>
          <span className="text-[11px] text-blue-600 font-medium">
            * 일 단가는 월 지급액을 25일/26일로 나눈 후 천 원 단위 올림 계산 (결근/추가수당 기준)
          </span>
        </div>
        
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 items-center uppercase tracking-wider">
          <div className="col-span-2">차종</div>
          <div className="col-span-3 text-center">당해년도 월 지급액 (만 단위)</div>
          <div className="col-span-3 text-center">일 단가 산출 (25일 / 26일)</div>
          <div className="col-span-2 text-center">전년도 월 지급액</div>
          <div className="col-span-2 text-center">전년 대비 증감</div>
        </div>
        <div className="px-6">
          {renderRow('1톤', 'cost1T')}
          {renderRow('2톤', 'cost2T')}
          {renderRow('2.5톤', 'cost2_5T')}
          {renderRow('3톤', 'cost3T')}
          {renderRow('3.5톤', 'cost3_5T')}
          {renderRow('5톤', 'cost5T')}
          {renderRow('5톤 축', 'cost5TAxis')}
        </div>
      </div>
    </div>
  );
}
