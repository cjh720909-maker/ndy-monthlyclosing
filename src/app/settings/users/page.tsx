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
import { createUser, getUsers, updateUserPermissions, changePassword } from '@/app/actions/user-actions';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // New User Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '' });
    const [submitting, setSubmitting] = useState(false);

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

    const handlePermissionToggle = async (userId: number, field: string, currentValue: boolean) => {
        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: !currentValue } : u));

        const result = await updateUserPermissions(userId, { [field]: !currentValue });
        if (!result.success) {
            setMessage({ type: 'error', text: `권한 업데이트 실패: ${result.error}` });
            // Rollback
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: currentValue } : u));
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password || !newUser.fullName) {
            setMessage({ type: 'error', text: '모든 정보를 입력해주세요.' });
            return;
        }

        setSubmitting(true);
        const result = await createUser(newUser);
        if (result.success) {
            setMessage({ type: 'success', text: '사용자가 생성되었습니다.' });
            setShowAddModal(false);
            setNewUser({ username: '', password: '', fullName: '' });
            await fetchUsers();
        } else {
            setMessage({ type: 'error', text: `실패: ${result.error}` });
        }
        setSubmitting(false);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()))
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
                    <p className="text-slate-500 mt-1 text-sm font-medium">직접 계정 생성 및 권한 관리</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                >
                    <Users size={16} />
                    신규 사용자 추가
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">관리 권한</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">접근</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">조회</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">쓰기</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">등록일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
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
                                                    {user.fullName ? user.fullName.substring(0, 1) : <UserIcon size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{user.fullName || '미지정'}</div>
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
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handlePermissionToggle(user.id, 'canAccess', user.canAccess ?? true)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.canAccess ?? true ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.canAccess ?? true ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handlePermissionToggle(user.id, 'canRead', user.canRead ?? true)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.canRead ?? true ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.canRead ?? true ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handlePermissionToggle(user.id, 'canWrite', user.canWrite ?? true)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.canWrite ?? true ? 'bg-amber-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.canWrite ?? true ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
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
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Users size={32} />
                                        </div>
                                        <h3 className="text-slate-600 font-bold italic">사용자가 없습니다.</h3>
                                        <p className="text-slate-400 text-xs mt-1">상단의 추가 버튼을 클릭하여 사용자를 등록해 주세요.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">신규 사용자 추가</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <RefreshCw size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">아이디</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                    placeholder="사용자 아이디"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">초기 비밀번호</label>
                                <input
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                    placeholder="비밀번호"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">사용자 성함</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                    placeholder="성함"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? '생성 중...' : '사용자 생성'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

