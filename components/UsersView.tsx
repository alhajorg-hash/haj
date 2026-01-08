import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, Mail, Search, CheckCircle, XCircle, 
  ShieldCheck, UserCog, Edit3, Trash2, X, ShieldAlert, Save,
  Lock, Settings as SettingsIcon, Package, BarChart3, Receipt, 
  Truck, LayoutDashboard, BrainCircuit, Undo2, Warehouse as WarehouseIcon,
  Users as CustomersIcon, Wand2, ClipboardList, SquareUser, Scale
} from 'lucide-react';
import { User, UserRole, SystemSettings } from '../types';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  isAdmin: boolean;
}

const ROLE_CONFIG: Record<UserRole, { icon: any, color: string, bg: string, darkBg: string }> = {
  Admin: { icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'dark:bg-indigo-500/10' },
  Manager: { icon: UserCog, color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-500/10' },
  Cashier: { icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50', darkBg: 'dark:bg-slate-800' },
};

export const UsersView: React.FC<UsersViewProps> = ({ users, setUsers, settings, onSaveSettings, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Cashier',
    status: 'Active'
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      });
    } else {
      setFormData({ name: '', email: '', role: 'Cashier', status: 'Active' });
    }
  }, [editingUser]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: formData.name!,
        email: formData.email!,
        role: (formData.role as UserRole) || u.role,
        status: (formData.status as 'Active' | 'Inactive') || u.status,
      } : u));
    } else {
      const staffMember: User = {
        id: `u-${Date.now()}`,
        name: formData.name!,
        email: formData.email!,
        role: (formData.role as UserRole) || 'Cashier',
        status: (formData.status as 'Active' | 'Inactive') || 'Active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name!)}&background=random&size=100`
      };
      setUsers(prev => [...prev, staffMember]);
    }

    handleCloseModal();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Permanently remove this staff member?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Staff & Permissions</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Control regional system access and user roles.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Invite Staff
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
          <div key={role} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${config.bg} ${config.darkBg} ${config.color} rounded-2xl flex items-center justify-center`}>
              <config.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{users.filter(u => u.role === role).length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role} Account</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none" 
            />
          </div>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{users.length} Active Profiles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Member</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase ${ROLE_CONFIG[user.role].color} ${ROLE_CONFIG[user.role].bg} ${ROLE_CONFIG[user.role].darkBg}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-400'}`}>
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18} /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden border dark:border-slate-800 animate-bounce-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                  {editingUser ? <UserCog size={20} /> : <UserPlus size={20} />}
                </div>
                <h3 className="font-black text-slate-800 dark:text-white">
                  {editingUser ? 'Update Staff Member' : 'Invite Team Member'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="user-input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="user-input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <select value={formData.role} onChange={e => setFormData(p => ({...p, role: e.target.value as UserRole}))} className="user-input-field">
                      {Object.keys(ROLE_CONFIG).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData(p => ({...p, status: e.target.value as 'Active' | 'Inactive'}))} className="user-input-field">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98]">
                {editingUser ? 'Save Changes' : 'Invite Staff'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .user-input-field {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          padding: 0.875rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .user-input-field:focus { border-color: #6366f1; background: #fff; }
        .dark .user-input-field { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .dark .user-input-field:focus { background: #0f172a; }
      `}</style>
    </div>
  );
};