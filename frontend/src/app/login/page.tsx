'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2, ArrowLeft, Search, Globe } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t, lang, toggle } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      Cookies.set('access_token', response.data.access_token);
      toast.success(t.welcomeBack + '!');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Đăng nhập thất bại.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ui-bg flex items-center justify-center p-6 relative">
      <button 
        onClick={toggle}
        className="fixed top-8 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold"
      >
        <Globe size={14} />
        {lang === 'en' ? 'EN' : 'VI'}
      </button>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                    <Search size={22} />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Vision<span className="text-indigo-400">Inspect</span></span>
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t.signIn}</h1>
            <p className="text-slate-400 mt-2 font-medium">Truy cập vào không gian làm việc của bạn</p>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                    type="email" 
                    className={`w-full pl-12 pr-4 py-4 bg-slate-900/50 border rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                    placeholder="name@company.com"
                    {...register('email')} 
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs font-medium ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mật khẩu</label>
                    <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Quên mật khẩu?</a>
                </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                    type="password" 
                    className={`w-full pl-12 pr-4 py-4 bg-slate-900/50 border rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                    placeholder="••••••••"
                    {...register('password')} 
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs font-medium ml-1">{errors.password.message}</p>}
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {isLoading ? 'Đang xác thực...' : t.signIn}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors underline underline-offset-4 decoration-indigo-500/30">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            <div className="w-8 h-8 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}
