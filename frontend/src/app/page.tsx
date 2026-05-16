'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Zap, Shield, BarChart3, ArrowRight, CheckCircle2, Globe } from 'lucide-react';

export default function HomePage() {
  const { t, lang, toggle } = useLanguage();

  return (
    <div className="min-h-screen bg-ui-bg text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-ui-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Search size={22} />
            </div>
            <span className="font-bold text-xl tracking-tight">Vision<span className="text-indigo-400">Inspect</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">{t.featuresTitle}</a>
            <a href="#about" className="hover:text-white transition-colors">{t.dashboard}</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
                onClick={() => toggle()} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
                <Globe size={14} />
                {lang === 'en' ? 'EN' : 'VI'}
            </button>
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4">
              {t.signIn}
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              {t.getStartedFree}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} />
              AI Powered Inspection
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                {t.heroTitle.split('\n').map((line, i) => (
                    <span key={i} className="block">{line}</span>
                ))}
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="btn-primary py-4 px-8 text-lg flex items-center justify-center gap-2">
                {t.startFree}
                <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary py-4 px-8 text-lg">
                Demo
              </button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-500" /> {lang === 'vi' ? 'Không cần thẻ tín dụng' : 'No credit card required'}</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-500" /> {lang === 'vi' ? '14 ngày dùng thử' : '14-day free trial'}</div>
            </div>
          </div>

          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="relative glass-effect rounded-[2rem] p-8 aspect-square flex items-center justify-center overflow-hidden">
                {/* Mock UI Element */}
                <div className="w-full h-full bg-slate-900/50 rounded-xl border border-white/10 p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20" />
                            <div className="h-4 w-32 bg-slate-700 rounded" />
                        </div>
                        <div className="h-6 w-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full" />
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-lg flex items-center justify-center">
                        <Search className="text-slate-600" size={64} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">{t.featuresTitle}</h2>
            <p className="text-slate-400">{lang === 'vi' ? 'Giải pháp kiểm định thông minh dựa trên trí tuệ nhân tạo.' : 'Smart inspection solution based on artificial intelligence.'}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {t.features.map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-800/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/80 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                    {i === 0 ? <Zap size={28} /> : i === 1 ? <Shield size={28} /> : <BarChart3 size={28} />}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl shadow-indigo-500/20 animate-in fade-in zoom-in duration-500">
            <h2 className="text-4xl font-bold mb-6 text-white">{lang === 'vi' ? 'Sẵn sàng nâng tầm quy trình?' : 'Ready to upgrade your workflow?'}</h2>
            <p className="text-indigo-100 text-lg mb-10 opacity-90">{lang === 'vi' ? 'Bắt đầu miễn phí ngay hôm nay.' : 'Start for free today.'}</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/20 text-lg">
                {t.getStartedFree}
                <ArrowRight size={20} />
            </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2.5 grayscale opacity-50">
            <Search size={20} />
            <span className="font-bold text-lg tracking-tight">VisionInspect</span>
          </div>
          <p>© 2026 VisionInspect. {t.footerText}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
