'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { User } from '@/types';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { 
  LayoutDashboard, 
  Search, 
  History, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  Menu,
  X,
  Loader2,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, toggle } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.data);
      } catch (err) {
        Cookies.remove('access_token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: lang === 'vi' ? 'Tổng quan' : 'Dashboard' },
    { href: '/dashboard/inspect', icon: Search, label: lang === 'vi' ? 'Kiểm tra ảnh' : 'Inspect Image' },
    { href: '/dashboard/history', icon: History, label: lang === 'vi' ? 'Lịch sử kiểm tra' : 'History' },
    { href: '/dashboard/usage', icon: CreditCard, label: lang === 'vi' ? 'Gói dịch vụ' : 'Usage & Plan' },
  ];

  if (user?.is_admin) {
    NAV_ITEMS.push({ href: '/dashboard/admin', icon: ShieldCheck, label: lang === 'vi' ? 'Quản trị hệ thống' : 'Admin Panel' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-bg flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="font-medium animate-pulse">{t.loadingWorkspace}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ui-bg text-slate-100">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-40 p-2.5 bg-slate-800 border border-white/10 rounded-xl text-white shadow-xl"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 
        transition-transform duration-300 lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Search size={22} />
          </div>
          <span className="font-bold text-xl tracking-tight">Vision<span className="text-indigo-400">Inspect</span></span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-2 text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mx-6 p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-inner">
                {(user.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{user.full_name || (lang === 'vi' ? 'Người dùng' : 'User')}</div>
                <div className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold mt-0.5">
                    {lang === 'vi' ? (user.plan === 'free' ? 'TÀI KHOẢN MIỄN PHÍ' : 'TÀI KHOẢN PREMIUM') : `${user.plan} account`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout & Lang */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <button 
            onClick={toggle}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <Globe size={18} className="text-slate-500" />
            {lang === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
          </button>

          <button
            onClick={() => { Cookies.remove('access_token'); router.push('/login'); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen relative">
        <div className="max-w-6xl mx-auto p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
