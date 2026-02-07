"use client";

import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, PieChart, Users, TrendingUp, AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { MemoryModal } from '@/components/MemoryModal';
import { useState, useEffect, Suspense } from 'react';
import { Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { isOnline, saveToCache, getFromCache, addToOutbox, getOutbox, removeFromOutbox } from '@/utils/offline';
import { calculateSettlements } from '@/utils/settlements';

const expenseSchema = z.object({
    description: z.string().min(3, 'Description must be at least 3 characters'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    category: z.string().min(1, 'Category is required'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Expense {
    _id: string;
    description: string;
    amount: number;
    category: string;
    paidBy: {
        _id: string;
        name: string;
    };
    payerGuestName?: string;
    splitBetween?: { user?: string; guestName?: string; amount: number }[];
    date: string;
    createdAt: string;
}

interface Group {
    _id: string;
    name: string;
    members: { _id: string; name: string; avatar?: string; email: string }[];
    guests: { name: string; addedBy: string }[];
    coverImage?: string;
    memoryNote?: string;
    milestones?: string;
    foodieStat?: string;
}

function ExpensesContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const groupId = searchParams.get('groupId');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Expenses');
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            category: 'Food',
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                let currentGroups: Group[] = [];

                if (isOnline()) {
                    try {
                        const groupsRes = await api.get('/groups');
                        currentGroups = groupsRes.data;
                        setGroups(currentGroups);
                        saveToCache('groups', currentGroups);
                        setError(null);
                    } catch (apiErr) {
                        console.error('API Fetch failed, falling back to cache');
                        currentGroups = getFromCache('groups') || [];
                        setGroups(currentGroups);
                    }
                } else {
                    currentGroups = getFromCache('groups') || [];
                    setGroups(currentGroups);
                    if (currentGroups.length === 0) {
                        setError(t('noOfflineData') || 'No offline data available');
                    }
                }

                // Decide which group to view
                if (groupId) {
                    const group = currentGroups.find((g: any) => g._id === groupId);
                    setSelectedGroup(group || null);
                    if (group) {
                        fetchGroupData(groupId);
                    }
                } else if (currentGroups.length > 0) {
                    const firstGroupId = currentGroups[0]._id;
                    router.push(`/${locale}/dashboard/expenses?groupId=${firstGroupId}`);
                }
            } catch (err: any) {
                const cachedGroups = getFromCache('groups');
                if (cachedGroups) {
                    setGroups(cachedGroups);
                    setError(null);
                } else {
                    setError(err.response?.data?.message || 'Failed to load data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        // Global sync listener
        const refreshData = () => {
            console.log('[Expenses] Global sync complete, refreshing...');
            if (groupId) fetchGroupData(groupId);
        };
        window.addEventListener('app:sync-complete', refreshData);
        return () => window.removeEventListener('app:sync-complete', refreshData);
    }, [groupId]);

    const fetchGroupData = async (id: string) => {
        try {
            if (isOnline()) {
                const [expensesRes, summaryRes, groupsRes] = await Promise.all([
                    api.get(`/expenses/group/${id}`),
                    api.get(`/expenses/summary/${id}`),
                    api.get('/groups')
                ]);
                setExpenses(expensesRes.data);
                setSummary(summaryRes.data);
                setGroups(groupsRes.data);

                saveToCache(`expenses_${id}`, expensesRes.data);
                saveToCache(`summary_${id}`, summaryRes.data);
                saveToCache('groups', groupsRes.data);

                const updatedGroup = groupsRes.data.find((g: any) => g._id === id);
                if (updatedGroup) setSelectedGroup(updatedGroup);
            } else {
                const cachedExpenses: Expense[] = getFromCache(`expenses_${id}`) || [];
                const outbox = getOutbox().filter(item => item.type === 'ADD_EXPENSE' && (item.data as any).group === id);

                const pendingExpenses = outbox.map(item => ({
                    ...(item.data as any),
                    _id: item.id,
                    paidBy: (item.data as any).paidBy || { _id: 'me', name: 'Me' } // Default to 'Me' if not specified
                }));

                const allExpenses = [...pendingExpenses, ...cachedExpenses];
                setExpenses(allExpenses);

                // Re-calculate summary locally
                const localSummary = calculateSettlements(allExpenses as any);
                setSummary(localSummary);
            }
        } catch (err: any) {
            console.error('Failed to fetch group data', err);
            setExpenses(getFromCache(`expenses_${id}`) || []);
            setSummary(getFromCache(`summary_${id}`) || null);
        }
    };

    const onSubmit = async (data: ExpenseFormValues) => {
        if (!selectedGroup) return;

        const amount = Number(data.amount);
        const totalPeople = selectedGroup.members.length + (selectedGroup.guests?.length || 0);
        const perPerson = amount / totalPeople;

        const splitBetween = [
            ...selectedGroup.members.map(member => ({
                user: member._id,
                amount: perPerson
            })),
            ...(selectedGroup.guests || []).map(guest => ({
                guestName: guest.name,
                amount: perPerson
            }))
        ];

        const payload = {
            group: selectedGroup._id,
            amount,
            description: data.description,
            category: data.category,
            splitBetween
        };

        if (isOnline()) {
            try {
                await api.post('/expenses', payload);
                setIsModalOpen(false);
                reset();
                fetchGroupData(selectedGroup._id);
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to add expense');
            }
        } else {
            // Optimistic UI
            const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            const optimisticExpense: Expense = {
                _id: 'temp-' + Date.now(),
                description: data.description,
                amount,
                category: data.category,
                paidBy: {
                    _id: currentUser.id || 'me',
                    name: currentUser.name || 'Me'
                },
                date: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            const updatedExpenses = [optimisticExpense, ...expenses];
            setExpenses(updatedExpenses);
            saveToCache(`expenses_${selectedGroup._id}`, updatedExpenses);
            addToOutbox('ADD_EXPENSE', payload);

            // Re-calculate summary immediately
            const localSummary = calculateSettlements(updatedExpenses as any);
            setSummary(localSummary);

            setIsModalOpen(false);
            reset();
            alert(t('savedOffline') || 'Cost logged offline. Will sync later.');
        }
    };

    // Memory Modal State
    const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

    // Settlement Logic
    const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
    const [settlementPayer, setSettlementPayer] = useState('');
    const [settlementReceiver, setSettlementReceiver] = useState('');
    const [settlementAmount, setSettlementAmount] = useState('');

    const onSettlementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup || !settlementPayer || !settlementReceiver || !settlementAmount) return;

        const amount = Number(settlementAmount);
        const payload: any = {
            group: selectedGroup._id,
            amount,
            description: 'Settlement',
            category: 'Settlement',
            type: 'Settlement',
            splitBetween: []
        };

        // Handle Payer
        if (settlementPayer.startsWith('guest:')) {
            payload.payerGuestName = settlementPayer.replace('guest:', '');
        }

        // Handle Receiver
        if (settlementReceiver.startsWith('guest:')) {
            payload.splitBetween.push({
                guestName: settlementReceiver.replace('guest:', ''),
                amount
            });
        } else {
            payload.splitBetween.push({
                user: settlementReceiver,
                amount
            });
        }

        if (isOnline()) {
            try {
                await api.post('/expenses', payload);
                setIsSettlementModalOpen(false);
                setSettlementAmount('');
                setSettlementPayer('');
                setSettlementReceiver('');
                fetchGroupData(selectedGroup._id);
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to record settlement');
            }
        } else {
            const optimisticSettlement: Expense = {
                _id: 'temp-' + Date.now(),
                description: 'Settlement',
                amount,
                category: 'Settlement',
                paidBy: {
                    _id: settlementPayer.startsWith('guest:') ? 'guest' : settlementPayer,
                    name: settlementPayer.replace('guest:', '').split(':')[0] // Just in case
                },
                date: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            const updatedExpenses = [optimisticSettlement, ...expenses];
            setExpenses(updatedExpenses);
            saveToCache(`expenses_${selectedGroup._id}`, updatedExpenses);
            addToOutbox('SETTLE', payload);

            setIsSettlementModalOpen(false);
            setSettlementAmount('');
            setSettlementPayer('');
            setSettlementReceiver('');
            alert(t('settlementOffline') || 'Settlement recorded offline.');
        }
    };

    const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold animate-pulse">{t('loadingData')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass p-20 rounded-[3rem] border-red-500/10 bg-red-500/5 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-16 h-16 mb-6 text-red-500" />
                <h3 className="text-2xl font-bold text-red-500">{t('connectionError')}</h3>
                <p className="max-w-md mt-4 text-zinc-500 mb-8">{t('connectionDesc', { error })}</p>
                <Button onClick={() => window.location.reload()} className="rounded-2xl h-14">
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="glass p-20 rounded-[3rem] border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                <Users className="w-16 h-16 mb-6 text-zinc-600" />
                <h3 className="text-2xl font-bold text-zinc-400">{t('noGroups')}</h3>
                <p className="max-w-md mt-4 text-zinc-500 mb-8">{t('noGroupsDesc')}</p>
                <Button onClick={() => router.push(`/${locale}/dashboard/groups`)} className="rounded-2xl h-14">
                    {t('goGroups')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 md:space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">{t('title')}</h1>
                        <span className="w-fit px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                            {selectedGroup?.name || t('loadingData')}
                        </span>
                    </div>
                    <p className="text-zinc-500 font-medium text-sm md:text-base">{t('subtitle')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <select
                        value={groupId || ''}
                        onChange={(e) => router.push(`/${locale}/dashboard/expenses?groupId=${e.target.value}`)}
                        className="h-14 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none text-zinc-300 w-full sm:min-w-[200px]"
                    >
                        {groups.map(g => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button onClick={() => setIsMemoryModalOpen(true)} className="flex-1 sm:flex-none rounded-2xl h-14 px-6 bg-zinc-800 text-zinc-300 hover:text-white" size="lg">
                            <Camera className="mr-2 w-5 h-5" />
                            {t('memory')}
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none rounded-2xl h-14 px-8 shadow-xl shadow-emerald-500/20" size="lg">
                            <Plus className="mr-2 w-5 h-5" />
                            {t('addCost')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Trip Memory Card */}
            {selectedGroup?.coverImage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full h-[300px] md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl"
                >
                    <img
                        src={selectedGroup.coverImage}
                        alt="Trip Memory"
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
                        <div className="flex items-center gap-3 mb-2 md:mb-4">
                            <div className="px-3 py-1 md:px-4 md:py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                {t('tripMemory')}
                            </div>
                            <span className="text-white/60 text-[8px] md:text-[10px] font-bold uppercase tracking-widest italic truncate max-w-[150px] md:max-w-none">
                                "{selectedGroup.name}"
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-black text-white tracking-tighter max-w-2xl leading-tight mb-4 md:mb-8 line-clamp-2 md:line-clamp-none">
                            {selectedGroup.memoryNote || t('captureMoment')}
                        </h2>

                        <div className="flex flex-wrap gap-4 md:gap-6 items-center border-t border-white/10 pt-4 md:pt-8 mt-2">
                            {selectedGroup.milestones && (
                                <div className="space-y-0.5 md:space-y-1">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400">{t('milestones')}</p>
                                    <p className="text-white font-bold text-xs md:text-sm tracking-tight">{selectedGroup.milestones}</p>
                                </div>
                            )}
                            {selectedGroup.foodieStat && (
                                <div className="space-y-0.5 md:space-y-1 pl-4 md:pl-6 border-l border-white/10">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-orange-400">{t('foodieStat')}</p>
                                    <p className="text-white font-bold text-xs md:text-sm tracking-tight">{selectedGroup.foodieStat}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent col-span-1 sm:col-span-2 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-zinc-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 opacity-60">{t('summary.totalBudget')}</p>
                        <h3 className="text-4xl md:text-6xl font-black tracking-tighter transition-all">৳ {totalSpend.toLocaleString()}</h3>
                        <div className="mt-4 md:mt-8 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <TrendingUp className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            {t('summary.liveCalc')}
                        </div>
                    </div>
                    <PieChart className="absolute -right-8 -bottom-8 w-32 h-32 md:w-48 md:h-48 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>

                <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-white/[0.02] flex flex-col justify-between">
                    <div>
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-4 border border-blue-500/20">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest pb-1">{t('summary.groupStrength')}</p>
                        <h3 className="text-xl md:text-2xl font-black">{(selectedGroup?.members.length || 0) + (selectedGroup?.guests?.length || 0)} {t('summary.members')}</h3>
                    </div>
                </div>

                <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-white/[0.02] flex flex-col justify-between">
                    <div>
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 w-fit mb-4 border border-orange-500/20">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest pb-1">{t('summary.recentActivity')}</p>
                        <h3 className="text-xl md:text-2xl font-black">{expenses.length} {t('summary.entries')}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{t('ledger')}</h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">{t('secureRecords')}</span>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="glass p-12 md:p-20 rounded-[2.5rem] md:rounded-[3rem] border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center opacity-40 grayscale">
                            <Wallet className="w-12 h-12 md:w-16 md:h-16 mb-4 text-zinc-600" />
                            <h4 className="text-base md:text-lg font-bold text-zinc-400 uppercase tracking-widest">{t('cleanSlate')}</h4>
                            <p className="text-[10px] max-w-[200px] mt-2 font-medium">{t('logFirst')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expenses.map((exp, i) => (
                                <motion.div
                                    key={exp._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-white/[0.02] flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] hover:border-white/10 transition-all gap-4"
                                >
                                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/5 transition-all shrink-0">
                                            <Wallet className="w-5 h-5 md:w-7 md:h-7" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight truncate">{exp.description}</h4>
                                            <p className="text-[10px] md:text-xs font-medium text-zinc-500 truncate">
                                                By <span className="text-emerald-500/80 font-bold uppercase tracking-wider">{exp.paidBy?.name || 'Someone'}</span> • {exp.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <h4 className="text-xl md:text-2xl font-black text-white tracking-tighter">৳ {exp.amount.toLocaleString()}</h4>
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                            {new Date(exp.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settlement Summary */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{t('settlements')}</h2>
                        {!isOnline() && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                <WifiOff className="w-3 h-3" />
                                {locale === 'bn' ? '(অনলাইনে আসলে আপডেট হবে)' : '(Updates online)'}
                            </span>
                        )}
                    </div>
                    <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-4">
                        {summary && summary.length > 0 ? (
                            <div className="space-y-3">
                                {summary.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5 gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-base md:text-lg shrink-0 ${item.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {item.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-white text-xs md:text-sm truncate">{item.name}</p>
                                                <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate ${item.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {item.amount > 0 ? t('getsBack') : t('owes')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`text-base md:text-lg font-black tracking-tighter shrink-0 ${item.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            ৳ {Math.abs(Math.round(item.amount)).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Users className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-emerald-500/20" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('allSettled')}</p>
                                <p className="text-[8px] md:text-[10px] text-zinc-600 mt-2">{t('noPending')}</p>
                            </div>
                        )}

                        <Button
                            onClick={() => setIsSettlementModalOpen(true)}
                            className="w-full h-14 md:h-16 rounded-xl md:rounded-[1.5rem] bg-zinc-900 hover:bg-zinc-800 shadow-none border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all mt-4"
                        >
                            {t('recordSettlement')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('addExpense')}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('descriptionLabel')}</label>
                        <Input
                            placeholder="e.g. Dinner at Pauchon"
                            className={errors.description ? 'border-red-500/50 bg-red-500/5 h-16 rounded-2xl' : 'h-16 rounded-2xl'}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 ml-1">
                                <AlertCircle className="w-3 h-3" /> {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('amountLabel')}</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className={errors.amount ? 'border-red-500/50 bg-red-500/5 h-16 rounded-2xl' : 'h-16 rounded-2xl'}
                                {...register('amount')}
                            />
                            {errors.amount && (
                                <p className="flex items-center gap-1.5 text-xs text-red-500 ml-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.amount.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('categoryLabel')}</label>
                            <select
                                {...register('category')}
                                className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none text-zinc-300"
                            >
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Accommodation">Accommodation</option>
                                <option value="Sightseeing">Sightseeing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">{t('automatedSplit')}</p>
                        <p className="text-xs text-zinc-500 font-medium">{t('automatedSplitDesc', { count: (selectedGroup?.members.length || 0) + (selectedGroup?.guests?.length || 0), name: selectedGroup?.name || '' })}</p>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-16 rounded-2xl text-xs font-black uppercase tracking-widest"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" className="flex-1 h-16 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-600 shadow-xl shadow-emerald-500/20">
                            {t('logCost')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Memory Modal */}
            <MemoryModal
                isOpen={isMemoryModalOpen}
                onClose={() => setIsMemoryModalOpen(false)}
                groupId={selectedGroup?._id || ''}
                onSuccess={() => fetchGroupData(selectedGroup?._id || '')}
            />

            {/* Settlement Modal */}
            <Modal
                isOpen={isSettlementModalOpen}
                onClose={() => setIsSettlementModalOpen(false)}
                title={t('recordSettlement')}
            >
                <form onSubmit={onSettlementSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('whoPaid')}</label>
                        <select
                            value={settlementPayer}
                            onChange={(e) => setSettlementPayer(e.target.value)}
                            className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none text-zinc-300"
                            required
                        >
                            <option value="">{t('selectPayer')}</option>
                            {selectedGroup?.members.map(m => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                            {selectedGroup?.guests.map((g, i) => (
                                <option key={i} value={`guest:${g.name}`}>{g.name} (Guest)</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('toWhom')}</label>
                        <select
                            value={settlementReceiver}
                            onChange={(e) => setSettlementReceiver(e.target.value)}
                            className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none text-zinc-300"
                            required
                        >
                            <option value="">{t('selectReceiver')}</option>
                            {selectedGroup?.members.map(m => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                            {selectedGroup?.guests.map((g, i) => (
                                <option key={i} value={`guest:${g.name}`}>{g.name} (Guest)</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('amountLabel')}</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={settlementAmount}
                            onChange={(e) => setSettlementAmount(e.target.value)}
                            className="h-16 rounded-2xl"
                            required
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-16 rounded-2xl text-xs font-black uppercase tracking-widest"
                            onClick={() => setIsSettlementModalOpen(false)}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" className="flex-1 h-16 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-600 shadow-xl shadow-emerald-500/20">
                            {t('confirmSettlement')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function ExpensesPage() {
    const t = useTranslations('Expenses');
    return (
        <Suspense fallback={
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold animate-pulse">Initializing Vault...</p>
            </div>
        }>
            <ExpensesContent />
        </Suspense>
    );
}
