'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, datasetApi, trainingApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Shield, 
  Loader2,
  FolderKanban,
  Activity,
  Layers3,
  BarChart3,
  ArrowRight,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const [datasetRes, jobRes, modelRes] = await Promise.allSettled([
        datasetApi.list(),
        trainingApi.listJobs(),
        trainingApi.listModels(),
      ]);

      if (datasetRes.status === 'fulfilled') setDatasets(datasetRes.value.data || []);
      if (jobRes.status === 'fulfilled') setJobs(jobRes.value.data || []);
      if (modelRes.status === 'fulfilled') setModels(modelRes.value.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchUsers(), fetchOverview()]).finally(() => setLoading(false));
  }, []);

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUser(userId, { is_admin: !currentStatus });
      toast.success(lang === 'vi' ? 'Cập nhật quyền thành công' : 'Permissions updated');
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi khi cập nhật quyền');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            {t.adminPanel}
          </h1>
          <p className="text-slate-500 font-medium">
            {lang === 'vi' ? 'Quản trị người dùng, dataset, huấn luyện và model vận hành.' : 'Manage users, datasets, training, and live model operations.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatPill icon={<Users size={16} />} label={lang === 'vi' ? 'Users' : 'Users'} value={users.length} />
          <StatPill icon={<FolderKanban size={16} />} label={lang === 'vi' ? 'Datasets' : 'Datasets'} value={datasets.length} />
          <StatPill icon={<Activity size={16} />} label={lang === 'vi' ? 'Jobs' : 'Jobs'} value={jobs.length} />
          <StatPill icon={<Layers3 size={16} />} label={lang === 'vi' ? 'Models' : 'Models'} value={models.length} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <NavCard href="/dashboard/admin/datasets" icon={<FolderKanban size={24} />} title={lang === 'vi' ? 'Dataset Manager' : 'Dataset Manager'} desc={lang === 'vi' ? 'Tạo, upload, chia tách và theo dõi dataset.' : 'Create, upload, split and monitor datasets.'} />
        <NavCard href="/dashboard/admin/training" icon={<Activity size={24} />} title={lang === 'vi' ? 'AI Training' : 'AI Training'} desc={lang === 'vi' ? 'Start jobs and monitor epochs in realtime.' : 'Start jobs and monitor epochs in realtime.'} />
        <NavCard href="/dashboard/admin/models" icon={<Layers3 size={24} />} title={lang === 'vi' ? 'Model Registry' : 'Model Registry'} desc={lang === 'vi' ? 'Quản lý version, deploy và rollback model.' : 'Version, deploy, and rollback models.'} />
        <NavCard href="/dashboard/admin/history" icon={<BarChart3 size={24} />} title={lang === 'vi' ? 'Training History' : 'Training History'} desc={lang === 'vi' ? 'Xem toàn bộ phiên training, logs và metrics.' : 'Review training sessions, logs, and metrics.'} />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <MetricCard title={lang === 'vi' ? 'Active jobs' : 'Active jobs'} value={jobs.filter((job) => job.status === 'running').length} subtitle={lang === 'vi' ? 'Huấn luyện đang chạy' : 'Training currently running'} />
            <MetricCard title={lang === 'vi' ? 'Completed models' : 'Completed models'} value={models.filter((model) => model.is_active).length} subtitle={lang === 'vi' ? 'Model đang active' : 'Active models'} />
            <MetricCard title={lang === 'vi' ? 'Dataset classes' : 'Dataset classes'} value={datasets.reduce((total, dataset) => total + (dataset.classes?.length || 0), 0)} subtitle={lang === 'vi' ? 'Tổng số class định nghĩa' : 'Total configured classes'} />
          </div>

          <div className="premium-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">{lang === 'vi' ? 'Người dùng hệ thống' : 'System users'}</h2>
                <p className="text-sm text-slate-500">{lang === 'vi' ? 'Kiểm soát quyền admin cho các tài khoản.' : 'Grant or revoke admin access for accounts.'}</p>
              </div>
              <Link href="/dashboard/admin/datasets" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300">
                {lang === 'vi' ? 'Đi tới Dataset Manager' : 'Open Dataset Manager'} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Người dùng / User</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Vai trò / Role</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Thao tác / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                          <div className="font-bold text-white">{u.full_name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-slate-400 font-medium">{u.email}</td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.is_admin ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}>
                          <Shield size={12} />
                          {u.is_admin ? 'Admin' : 'User'}
                        </div>
                      </td>
                      <td className="p-6">
                        <button 
                          onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                          className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                          title={u.is_admin ? 'Hạ cấp' : 'Thăng cấp Admin'}
                        >
                          {u.is_admin ? <UserMinus size={18} /> : <UserCheck size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-slate-400">
      {icon}
      <span>{label}: {value}</span>
    </div>
  );
}

function MetricCard({ title, value, subtitle }: any) {
  return (
    <div className="card p-6">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{title}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function NavCard({ href, icon, title, desc }: any) {
  return (
    <Link href={href} className="card p-6 border border-white/10 hover:border-indigo-500/40 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="text-lg font-black text-white">{title}</div>
      <div className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</div>
    </Link>
  );
}
