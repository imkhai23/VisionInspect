'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFECT_COLORS } from '@/types';
import type { DashboardStats, UsageStats } from '@/types';
import { Search, History, Zap, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('access_token');
      if (!token) return;

      try {
        const [statsRes, usageRes] = await Promise.all([
          fetch('http://localhost:8000/usage/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8000/usage', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (usageRes.ok) setUsage(await usageRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
    );
  }

  const chartData = stats ? Object.entries(stats.defect_breakdown).map(([label, count]) => ({
    label: t.defects[label as keyof typeof t.defects] || label.replace('_', ' '),
    count,
    color: DEFECT_COLORS[label as keyof typeof DEFECT_COLORS] || '#6366f1',
  })) : [];

  const isPro = usage?.plan === 'pro';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t.dashboardTitle}</h1>
          <p className="text-slate-400 mt-1">{t.dashboardSubtitle}</p>
        </div>
        <Link href="/dashboard/inspect" className="btn btn-primary shadow-xl shadow-indigo-500/20">
            <Zap size={18} />
            {t.newInspection}
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            icon={<Search className="text-indigo-400" />} 
            value={stats?.total_predictions || 0} 
            label={t.totalInspections} 
            trend="+12% từ tháng trước"
        />
        <StatCard 
            icon={<TrendingUp className="text-cyan-400" />} 
            value={stats?.predictions_this_month || 0} 
            label={t.thisMonth} 
        />
        <StatCard 
            icon={<CheckCircle2 className="text-emerald-400" />} 
            value={stats?.average_confidence ? `${stats.average_confidence.toFixed(1)}%` : '—'} 
            label={t.avgConfidence} 
        />
        <StatCard 
            icon={<AlertCircle className="text-amber-400" />} 
            value={stats?.most_common_defect?.replace('_', ' ') ?? '—'} 
            label={t.mostCommonDefect} 
            isText 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Card */}
        <div className="lg:col-span-1 card flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t.monthlyUsage}</h2>
                        <p className="text-2xl font-bold mt-1">
                            {isPro ? t.unlimited : `${usage?.predictions_used || 0} / ${usage?.predictions_limit || 0}`}
                        </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isPro ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                        {isPro ? 'PRO' : 'FREE'}
                    </span>
                </div>

                {!isPro && usage && (
                    <div className="space-y-3">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
                                style={{ width: `${Math.min(usage.percentage_used, 100)}%` }} 
                            />
                        </div>
                        <p className="text-xs text-slate-400 text-right">
                            Còn lại {usage.predictions_remaining} lượt trong tháng này
                        </p>
                    </div>
                )}
            </div>

            {!isPro && (
                <div className="mt-8 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <p className="text-sm text-indigo-300 font-medium leading-relaxed">
                        Nâng cấp lên Pro để không giới hạn lượt kiểm tra và sử dụng Model AI nâng cao.
                    </p>
                    <Link href="/dashboard/usage" className="mt-4 inline-flex items-center text-sm font-bold text-indigo-400 hover:text-indigo-300">
                        Nâng cấp ngay →
                    </Link>
                </div>
            )}
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">{t.defectBreakdown}</h2>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="label" 
                            tick={{ fill: '#64748b', fontSize: 11 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <YAxis 
                            tick={{ fill: '#64748b', fontSize: 11 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                                background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                color: '#f1f5f9',
                                fontSize: '12px'
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink 
            href="/dashboard/inspect" 
            icon={<Search size={32} />} 
            title={t.newInspection} 
            desc={t.newInspectionDesc}
            className="bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20"
        />
        <QuickLink 
            href="/dashboard/history" 
            icon={<History size={32} />} 
            title={t.viewHistory} 
            desc={t.viewHistoryDesc}
            className="bg-white/5 border-white/10 hover:bg-white/10"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, trend, isText = false }: any) {
  return (
    <div className="card group hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
            {icon}
        </div>
        {trend && <span className="text-[10px] text-emerald-400 font-bold">{trend}</span>}
      </div>
      <div className="mt-4">
        <div className={`text-2xl font-bold text-white ${isText ? 'capitalize' : ''}`}>{value}</div>
        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, title, desc, className }: any) {
    return (
        <Link href={href} className={`flex items-center gap-6 p-6 rounded-2xl border transition-all duration-300 group ${className}`}>
            <div className="text-indigo-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <div>
                <div className="text-lg font-bold text-white">{title}</div>
                <div className="text-sm text-slate-400 mt-1">{desc}</div>
            </div>
        </Link>
    )
}
