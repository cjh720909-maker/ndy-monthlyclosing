'use client';

import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { changePassword } from '@/app/actions/user-actions';
import Link from 'next/link';

export default function ProfilePage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Note: In a real app, we would get the logged-in user's ID from the session.
    // Here, we'll assume a mechanism to identify the user is in place.
    const userId = 1; // Placeholder for demo/current context

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ type: 'error', text: '비밀번호는 4자 이상이어야 합니다.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const result = await changePassword(userId, newPassword);

        if (result.success) {
            setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ type: 'error', text: `변경 실패: ${result.error}` });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <Link href="/settings/users" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold">
                <ArrowLeft size={16} />
                사용자 목록으로 돌아가기
            </Link>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <KeyRound size={28} />
                            비밀번호 변경
                        </h2>
                        <p className="text-indigo-100 mt-2 text-sm">보안을 위해 주기적으로 비밀번호를 변경해 주세요.</p>
                    </div>
                    <ShieldCheck size={120} className="absolute -right-8 -bottom-8 text-white/10" />
                </div>

                <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">새 비밀번호</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-300"
                                placeholder="4자 이상 입력"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">비밀번호 확인</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-300"
                                placeholder="한 번 더 입력"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />}
                        비밀번호 변경하기
                    </button>
                </form>
            </div>
        </div>
    );
}
