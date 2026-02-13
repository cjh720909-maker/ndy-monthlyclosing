export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
      </div>
      <h2 className="text-xl font-medium text-slate-600 mb-1">메뉴를 선택해주세요</h2>
      <p className="text-sm">왼쪽 사이드바에서 작업을 시작할 메뉴를 선택하세요.</p>
    </div>
  );
}
