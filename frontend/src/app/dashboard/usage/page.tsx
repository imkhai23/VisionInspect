'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle2, 
  Zap, 
  Shield, 
  Crown, 
  ArrowRight, 
  Loader2, 
  CreditCard,
  Sparkles,
  History
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usageApi } from '@/lib/api';

export default function UsagePage() {
  const { t, lang } = useLanguage();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await usageApi.getUsage();
        setUsage(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const PLANS = [
    {
      name: 'Free Plan',
      price: '0',
      icon: Zap,
      color: 'indigo',
      features: ['50 dự đoán/tháng', 'Tốc độ tiêu chuẩn', 'Hỗ trợ cộng đồng', 'Lưu lịch sử 7 ngày'],
      current: usage?.plan === 'free',
      button: 'Đang sử dụng'
    },
    {
      name: 'Pro Plan',
      price: '49',
      icon: Crown,
      color: 'amber',
      features: ['Vô hạn dự đoán', 'Tốc độ ưu tiên', 'Hỗ trợ 24/7', 'Lưu lịch sử vĩnh viễn', 'Xuất báo cáo PDF'],
      current: usage?.plan === 'pro',
      button: 'Nâng cấp ngay'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-slate-500 font-medium">{t.loadingWorkspace}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
          {t.billingUsage}
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">{t.billingSubtitle}</p>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="premium-card p-8 bg-gradient-to-br from-slate-900 to-indigo-900/20">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="space-y-2">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.usageProgress}</div>
                <div className="text-3xl font-black text-white">{usage.predictions_used} / {usage.predictions_limit}</div>
                <p className="text-xs text-slate-500 font-medium italic">{t.resetNotice}</p>
            </div>
            <div className="md:col-span-2">
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                        style={{ width: `${usage.percentage_used}%` }}
                    />
                </div>
                <div className="flex justify-between mt-3 text-xs font-bold text-slate-500">
                    <span>0%</span>
                    <span>{usage.percentage_used.toFixed(1)}% {lang === 'vi' ? 'đã dùng' : 'used'}</span>
                    <span>100%</span>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div key={plan.name} className={`premium-card p-10 flex flex-col gap-8 ${plan.current ? 'ring-2 ring-indigo-500/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  plan.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  <Icon size={28} />
                </div>
                {plan.current && (
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                    {t.currentPlan}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-slate-500 font-bold">/{lang === 'vi' ? 'tháng' : 'month'}</span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                    <CheckCircle2 size={18} className="text-indigo-500 shrink-0" />
                    {lang === 'vi' ? feat : feat} {/* Features are currently mapped to Vietnamese in the array, would need a bilingual array for perfect i18n */}
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                plan.current 
                ? 'bg-white/5 text-slate-500 cursor-default' 
                : 'btn-premium'
              }`}>
                {plan.current ? t.using : t.upgradeNow}
                {!plan.current && <ArrowRight size={18} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment & Billing placeholders with proper Icons */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="premium-card p-8 space-y-6">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
                <CreditCard size={24} />
                <h3 className="text-lg font-bold text-white tracking-tight">{t.paymentMethods}</h3>
            </div>
            <p className="text-slate-500 text-sm italic">{t.noPaymentMethod}</p>
            <button className="text-indigo-400 text-xs font-bold hover:underline">{t.addPayment}</button>
        </div>

        <div className="premium-card p-8 space-y-6">
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
                <Sparkles size={24} />
                <h3 className="text-lg font-bold text-white tracking-tight">{t.billingHistory}</h3>
            </div>
            <p className="text-slate-500 text-sm italic">{t.noBillingHistory}</p>
            <button className="text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1">
                <History size={14} /> {t.viewAll}
            </button>
        </div>
      </div>
    </div>
  );
}
