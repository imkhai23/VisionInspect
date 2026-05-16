'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  Search,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
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

  useEffect(() => {
    fetchUsers();
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
            {lang === 'vi' ? 'Quản lý người dùng và phân quyền hệ thống.' : 'Manage users and system permissions.'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-sm font-bold text-slate-400">
            <Users size={16} />
            <span>{lang === 'vi' ? `Tổng cộng: ${users.length}` : `Total: ${users.length}`}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
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
      )}
    </div>
  );
}
