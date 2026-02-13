'use client';

import React, { useState } from 'react';
import { 
  PenTool, 
  Save, 
  Trash2, 
  Plus, 
  Minus, 
  Calendar,
  User,
  Settings,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export default function AdditionalCostPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [formData, setFormData] = useState({
    name: '',
    type: 'picking',
    contractType: 'fixed',
    baseRate: '',
    allowance: '',
    note: ''
  });

  return (
    <div className="max-w-4xl mx-auto pt-2">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Input Form */}
        <div className="md:col-span-2">
          <div className="glass rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus size={16} className="text-indigo-600" />
                신규 항목 등록
              </h2>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                <select 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="pl-8 pr-8 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 appearance-none focus:outline-none focus: ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                  <option value="2024">2024년</option>
                  <option value="2025">2025년</option>
                  <option value="2026">2026년</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {/* Name Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">이름</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="성함 또는 업체명"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">추가 형태</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { id: 'picking', label: '현장 피킹 알바', icon: Settings },
                      { id: 'turn2', label: '2회전 배송', icon: Clock },
                      { id: 'support', label: '지원 수당', icon: DollarSign }
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setFormData({...formData, type: item.id})}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all text-xs font-bold ${
                          formData.type === item.id 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Contract Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">단가 유형</label>
                  <select 
                    value={formData.contractType}
                    onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium appearance-none"
                  >
                    <option value="fixed">월단가</option>
                    <option value="daily">일단가</option>
                    <option value="hourly">시간단가</option>
                  </select>
                </div>
                {/* Rate Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">금액 (원)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      placeholder="0"
                      value={formData.baseRate}
                      onChange={(e) => setFormData({...formData, baseRate: e.target.value})}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-sans text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Allowance Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">수당 (원)</label>
                <div className="relative">
                  <TrendingUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input 
                    type="number" 
                    placeholder="지급 수당"
                    value={formData.allowance}
                    onChange={(e) => setFormData({...formData, allowance: e.target.value})}
                    className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-sans font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Note Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">비고</label>
                <textarea 
                  rows={2}
                  placeholder="메모사항"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                  <Save size={16} />
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info / Help */}
        <div className="space-y-4">
          <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200/50">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-400" />
              등록 가이드
            </h3>
            <ul className="text-[11px] space-y-2 text-indigo-100 font-medium leading-relaxed opacity-80">
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>추가 비용은 월말 마감 시 정산 데이터에 자동으로 합산됩니다.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>연도별 데이터가 별도 관리됩니다.</span>
              </li>
            </ul>
          </div>

          <div className="glass rounded-2xl border border-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3">최근 등록 (Preview)</h3>
            <div className="space-y-2">
              {[
                { name: '홍길동', type: '피킹알바', amount: '₩1,200,000' },
                { name: '대영물류', type: '2회전배송', amount: '₩4,500,000' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.type}</p>
                  </div>
                  <p className="text-[11px] font-black text-indigo-600 font-sans">{item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
