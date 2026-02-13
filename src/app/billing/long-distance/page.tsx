'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Truck, User, MapPin, Weight, DollarSign, Save, 
  Trash2, Search
} from 'lucide-react';
import { getVehicles, saveVehicle, deleteVehicle, VehicleData } from './actions';

export default function LongDistanceVehiclePage() {
  const [currentYear, setCurrentYear] = useState('2026'); // Default to 2026
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Form State
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [formData, setFormData] = useState<VehicleData>({
    driverName: '',
    vehicleNo: '',
    tonnage: '3.5ton',
    region: '',
    allowance: 0,
    note: '',
    history: []
  });

  const [isPending, startTransition] = useTransition();

  // Load Data
  useEffect(() => {
    loadData();
  }, [currentYear]);

  async function loadData() {
    startTransition(async () => {
      const data = await getVehicles(currentYear);
      setVehicles(data as VehicleData[]);
    });
  }

  function handleSelect(vehicle: VehicleData) {
    setSelectedId(vehicle.id || null);
    setActiveTab('info'); // Switch to info tab on select
    setFormData({
      id: vehicle.id,
      driverName: vehicle.driverName,
      vehicleNo: vehicle.vehicleNo,
      tonnage: vehicle.tonnage,
      region: vehicle.region,
      allowance: vehicle.allowance,
      note: vehicle.note,
      history: vehicle.history || []
    });
  }

  function handleNew() {
    setSelectedId(null);
    setActiveTab('info');
    setFormData({
      id: undefined, 
      driverName: '',
      vehicleNo: '',
      tonnage: '3.5ton',
      region: '',
      allowance: 0,
      note: '',
      history: []
    });
  }

  async function handleSave() {
    if (!formData.driverName) {
      alert('기사명은 필수입니다.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveVehicle(formData, currentYear);
        
        if (result.success) {
           // alert('저장되었습니다.');
           window.location.reload(); 
        } else {
            alert(`저장 실패: ${result.error}`);
        }
      } catch (e) {
          alert(`[Debug] 에러 발생: ${e}`);
      }
    });
  }

  async function handleDelete(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    startTransition(async () => {
      await deleteVehicle(id);
      await loadData();
      if (selectedId === id) handleNew();
    });
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-[1600px] mx-auto">
      {/* Header & Filter */}
      {/* Main Split View */}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-6 pb-6 pt-2">
        
        {/* Left: List Panel (Compacted) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Truck size={16} /> 차량 목록 
              <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">{vehicles.length}</span>
            </h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input 
                type="text" 
                placeholder="검색..." 
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-32 outline-none focus:border-indigo-300"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isPending && <div className="text-center py-10 text-xs text-slate-400">Loading...</div>}
            
            {!isPending && vehicles.map((v) => (
              <div 
                key={v.id}
                onClick={() => handleSelect(v)}
                className={`
                  group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                  ${selectedId === v.id 
                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                    : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                    ${selectedId === v.id ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {v.driverName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{v.driverName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{v.tonnage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-sans">{v.vehicleNo}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{v.region}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 font-sans">
                    ₩{v.allowance?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentYear}년 기준
                  </div>
                </div>
              </div>
            ))}

            {vehicles.length === 0 && !isPending && (
              <div className="text-center py-20 text-slate-400 text-xs">
                등록된 차량이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right: Form Panel (Compact) */}
        <div className="col-span-12 lg:col-span-5 h-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
            <div className="px-4 pt-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex justify-between items-center mb-3">
                {/* Year Selector moved here */}
                <div className="flex items-center gap-2">
                  <select 
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                  >
                    <option value="2025">2025년</option>
                    <option value="2026">2026년</option>
                    <option value="2027">2027년</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {selectedId && (
                    <button 
                      onClick={() => handleDelete(selectedId)}
                      className="p-2 bg-white border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={handleNew}
                    className="bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    ↻ 초기화
                  </button>
                  <div 
                    onClick={handleSave}
                    className={`cursor-pointer bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Save size={14} />
                    {isPending ? '저장' : '저장'}
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-6 -mb-px">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  기본 정보
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  변경 이력 ({formData.history?.length || 0})
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {activeTab === 'info' ? (
                <>
                  {/* Row 1: Name & Vehicle No */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">기사명</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.driverName}
                          onChange={e => setFormData({...formData, driverName: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          placeholder="기사명"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">차량번호</label>
                      <div className="relative">
                        <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.vehicleNo}
                          onChange={e => setFormData({...formData, vehicleNo: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          placeholder="e.g. 12가 3456"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Region & Tonnage */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">운행지역</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.region}
                          onChange={e => setFormData({...formData, region: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          placeholder="지역명"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">톤수</label>
                      <div className="relative">
                        <Weight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                          value={formData.tonnage}
                          onChange={e => setFormData({...formData, tonnage: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                        >
                          <option value="1ton">1톤</option>
                          <option value="2.5ton">2.5톤</option>
                          <option value="3.5ton">3.5톤</option>
                          <option value="5ton">5톤</option>
                          <option value="11ton">11톤</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Amount - Highlighted */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <label className="flex items-center justify-between text-[10px] font-bold text-emerald-700 uppercase mb-1">
                      <span>{currentYear}년 적용 수당</span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-100">월 정액</span>
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input 
                        type="number" 
                        step="1000"
                        value={formData.allowance || ''}
                        onChange={e => setFormData({...formData, allowance: Number(e.target.value)})}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-right font-sans"
                        placeholder="0"
                      />
                      <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">원</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-1 text-right">
                      * 저장 시 히스토리에 자동 기록됩니다.
                    </p>
                  </div>

                  {/* Note */}
                  <div className="space-y-1 pb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">비고</label>
                    <textarea 
                      rows={4}
                      value={formData.note}
                      onChange={e => setFormData({...formData, note: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                      placeholder="메모사항"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-0divide-y divide-slate-100">
                  {formData.history && formData.history.length > 0 ? (
                    formData.history.map((h: any) => (
                      <div key={h.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{h.year}년</div>
                          <div className="text-xs text-slate-400">{h.applyDate} • {h.reason}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600">
                             ₩{h.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Search size={16} />
                      </div>
                      <p>기록된 이력이 없습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
