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
  TrendingUp,
  Loader2
} from 'lucide-react';
import { createAdditionalCost, getAdditionalCosts, deleteAdditionalCost } from './actions';

export default function AdditionalCostPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [costs, setCosts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'picking',
    contractType: 'fixed',
    baseRate: '',
    allowance: '',
    workingHours: '9',
    note: ''
  });

  const [editId, setEditId] = useState<number | null>(null);

  React.useEffect(() => {
    fetchCosts();
  }, [year]);

  const fetchCosts = async () => {
    setLoading(true);
    const result = await getAdditionalCosts(year);
    if (result.success) {
      setCosts(result.data || []);
    }
    setLoading(false);
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      contractType: item.contractType,
      baseRate: String(item.baseRate),
      allowance: String(item.allowance),
      workingHours: String(item.workingHours),
      note: item.note || ''
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      name: '',
      type: 'picking',
      contractType: 'fixed',
      baseRate: '',
      allowance: '',
      workingHours: '9',
      note: ''
    });
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('이름을 입력해주세요.');
      return;
    }

    setSaveLoading(true);

    let result;
    const payload = {
      year,
      name: formData.name,
      type: formData.type,
      contractType: formData.contractType,
      baseRate: Number(formData.baseRate) || 0,
      allowance: Number(formData.allowance) || 0,
      workingHours: Number(formData.workingHours) || 9,
      note: formData.note
    };

    if (editId) {
      // Update
      // We need to import updateAdditionalCost first! 
      // Note: I will add the import in a separate block or assume it's added.
      // Actually, let's use the tool again to add import if needed or just use it if available in scope.
      // Wait, I need to add updateAdditionalCost to imports.
      // For now, I'll write the logic assuming it will be imported.
      // Actually, I'll do the import in a separate block to be safe.
      // But TS might complain if I use it here without import.
      // I will trust the next step to fix imports.
      const { updateAdditionalCost } = await import('./actions');
      result = await updateAdditionalCost(editId, payload);
    } else {
      // Create
      result = await createAdditionalCost(payload);
    }

    if (result.success) {
      handleCancelEdit(); // Reset form
      fetchCosts();
    } else {
      console.error('Save failed:', result.error);
      alert(`저장 실패: ${result.error || '알 수 없는 오류'}`);
    }
    setSaveLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('삭제하시겠습니까?')) {
      await deleteAdditionalCost(id);
      fetchCosts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-0">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left: Input Form */}
        <div className="md:col-span-2">
          <div className="glass rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {editId ? <PenTool size={16} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
                {editId ? '항목 수정' : '신규 항목 등록'}
              </h2>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="pl-8 pr-8 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 appearance-none focus:outline-none focus: ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                  <option value="2022">2022년</option>
                  <option value="2023">2023년</option>
                  <option value="2024">2024년</option>
                  <option value="2025">2025년</option>
                  <option value="2026">2026년</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {/* Name Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">이름</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="성함 또는 업체명"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onClick={() => setFormData({ ...formData, type: item.id })}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-all text-xs font-bold ${formData.type === item.id
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

              <div className="grid grid-cols-2 gap-2">
                {/* Contract Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">단가 유형</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
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
                  <div className="relative flex items-center">
                    <DollarSign size={14} className="absolute left-3 z-10 text-slate-400" />
                    <input
                      type="number"
                      step="1000"
                      placeholder="0"
                      value={formData.baseRate}
                      onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                      className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-sans text-right"
                    />
                    <div className="absolute right-1 flex flex-col gap-0.5">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, baseRate: String((Number(prev.baseRate) || 0) + 1000) }))}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-600"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, baseRate: String(Math.max(0, (Number(prev.baseRate) || 0) - 1000)) }))}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-red-600"
                      >
                        <Minus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Allowance Field */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">수당 (원)</label>
                  <div className="relative flex items-center">
                    <TrendingUp size={14} className="absolute left-3 z-10 text-emerald-500" />
                    <input
                      type="number"
                      step="1000"
                      placeholder="지급 수당"
                      value={formData.allowance}
                      onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                      className="w-full pl-9 pr-8 py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-sans font-bold text-emerald-700 text-right"
                    />
                    <div className="absolute right-1 flex flex-col gap-0.5">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, allowance: String((Number(prev.allowance) || 0) + 1000) }))}
                        className="p-0.5 hover:bg-emerald-200 rounded text-emerald-400 hover:text-emerald-700"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, allowance: String(Math.max(0, (Number(prev.allowance) || 0) - 1000)) }))}
                        className="p-0.5 hover:bg-emerald-200 rounded text-emerald-400 hover:text-emerald-700"
                      >
                        <Minus size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Working Hours Field */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">하루 근무 시간</label>
                  <div className="relative flex items-center">
                    <Clock size={14} className="absolute left-3 z-10 text-slate-400" />
                    <input
                      type="number"
                      step="0.5"
                      placeholder="9"
                      value={formData.workingHours}
                      onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-sans text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Note Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">비고</label>
                <textarea
                  rows={2}
                  placeholder="메모사항"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                {editId && (
                  <button
                    onClick={handleCancelEdit}
                    disabled={saveLoading}
                    className="w-1/3 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saveLoading ? <Loader2 className="animate-spin" size={16} /> : (editId ? <PenTool size={16} /> : <Save size={16} />)}
                  {saveLoading ? '저장 중...' : (editId ? '수정하기' : '저장하기')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info / Help */}
        <div className="space-y-3">
          <div className="bg-indigo-900 rounded-2xl p-4 text-white shadow-xl shadow-indigo-200/50">
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
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-indigo-500" size={20} />
                </div>
              ) : costs.length === 0 ? (
                <div className="text-center p-4 text-slate-400 text-xs">
                  등록된 내역이 없습니다.
                </div>
              ) : (
                costs.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-slate-700">{item.name}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 font-medium">
                          {item.contractType === 'fixed' ? '월' : item.contractType === 'daily' ? '일' : '시'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.type === 'picking' ? '현장 피킹 알바' : item.type === 'turn2' ? '2회전 배송' : '지원 수당'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="text-right mr-2">
                        <p className="text-[11px] font-black text-indigo-600 font-sans">
                          ₩{(item.baseRate + item.allowance).toLocaleString()}
                        </p>
                        {item.allowance > 0 && (
                          <p className="text-[9px] text-emerald-600 font-medium">
                            + ₩{item.allowance.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleEdit(item)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <PenTool size={12} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
