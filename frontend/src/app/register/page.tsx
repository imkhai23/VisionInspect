'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Loader2, Search } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      router.push('/login');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Đăng ký thất bại.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ui-bg flex items-center justify-center p-6 relative">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                    <Search size={22} />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Vision<span className="text-indigo-400">Inspect</span></span>
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Tạo tài khoản mới</h1>
            <p className="text-slate-400 mt-2 font-medium">Bắt đầu hành trình kiểm định thông minh cùng chúng tôi</p>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Họ và tên</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                    type="text" 
                    className={`w-full pl-12 pr-4 py-4 bg-slate-900/50 border rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${errors.full_name ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                    placeholder="Nguyễn Văn A"
                    {...register('full_name')} 
                />
              </div>
              {errors.full_name && <p className="text-red-400 text-xs font-medium ml-1">{errors.full_name.message}</p>}
            </div>

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
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Mật khẩu</label>
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
                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors underline underline-offset-4 decoration-indigo-500/30">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
