'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    RefreshCw,
    Search,
    Shield,
    User as UserIcon,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { syncUsers, getUsers } from '@/app/actions/user-actions';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const result = await getUsers();
        if (result.success) {
            setUsers(result.data || []);
        }
        setLoading(false);
    };

    const handleSync = async () => {
        if (!confirm('레거시 MySQL 시스템에서 사용자 정보를 가져오시겠습니까?\n기존에 동일한 아이디가 있는 경우 최신 정보로 업데이트됩니다.')) return;

        setSyncing(true);
        setMessage(null);
        const result = await syncUsers();
        if (result.success) {
            setMessage({ type: 'success', text: `${result.count}명의 사용자가 성공적으로 동기화되었습니다.` });
            await fetchUsers();
        } else {
            setMessage({ type: 'error', text: `동기화 실패: ${result.error}` });
        }
        setSyncing(false);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col p-6 space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                            <Users size={24} />
                        </div>
                        사용자 관리
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm font-medium">시스템 접속 계정 및 레거시 데이터 동기화 관리</p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${syncing
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    레거시 계정 동기화
                </button>
            </div>

            {/* Stats & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{users.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">전체 사용자</div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex items-center px-4 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <Search size={20} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="아이디 또는 성함으로 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full py-4 px-3 text-sm focus:outline-none bg-transparent"
                    />
                </div>
            </div>

            {/* Message alert */}
            {message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            {/* User Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">사용자 정보</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">아이디</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">권한</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">등록일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-4" />
                                        <p className="text-slate-400 text-sm font-medium">사용자 목록을 불러오는 중입니다...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                                    {user.name ? user.name.substring(0, 1) : <UserIcon size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{user.name || '미지정'}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Member</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-mono font-bold">
                                                {user.username}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <Shield size={10} />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-xs text-slate-400 font-mono">
                                                {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Users size={32} />
                                        </div>
                                        <h3 className="text-slate-600 font-bold italic">사용자가 없습니다.</h3>
                                        <p className="text-slate-400 text-xs mt-1">상단의 동기화 버튼을 클릭하여 레거시 계정을 가져올 수 있습니다.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
