import React, { useState, useMemo, useEffect } from 'react';
import { 
  Banknote, Plus, Search, FileText, CheckCircle2, 
  Printer, X, Clock, Wallet, TrendingUp, AlertCircle, 
  ArrowRight, ShieldCheck, CircleUser, DollarSign,
  Download, CreditCard, Smartphone, CheckCircle, Zap,
  QrCode, MoreHorizontal, ChevronDown, Landmark,
  BarChart3, PieChart, Users, ArrowUpRight, BadgeCheck,
  Undo2, Percent, TrendingUpDown
} from 'lucide-react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { User, PayrollRecord, Expense } from '../types';

interface PayrollViewProps {
  users: User[];
  payroll: PayrollRecord[];
  setPayroll: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  onAddExpense: (e: Expense) => void;
  businessName: string;
}

// Statutory Constants for Ghana
const SSNIT_RATE = 0.055; 
const OVERTIME_RATE_PER_HOUR = 25.50; // Fixed simulation rate
const PAYE_FREE_ZONE = 402;

export const PayrollView: React.FC<PayrollViewProps> = ({ users, payroll, setPayroll, onAddExpense, businessName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [activeView, setActiveView] = useState<'ledger' | 'analytics'>('ledger');

  // Handle automatic return to ledger after print dialog is closed
  useEffect(() => {
    const handleAfterPrint = () => {
      setSelectedRecord(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const calculateFinancials = (base: number, allowances: number, overtimeHours: number, commissionEarnings: number, bonus: number) => {
    const gross = (base || 0) + (allowances || 0) + ((overtimeHours || 0) * OVERTIME_RATE_PER_HOUR) + (commissionEarnings || 0) + (bonus || 0);
    const ssnit = gross * SSNIT_RATE;
    const taxable = Math.max(0, gross - ssnit - PAYE_FREE_ZONE);
    let paye = 0;
    if (taxable > 0) paye = taxable * 0.175; // 17.5% effective simulation tier
    return { ssnit, paye, overtimePay: (overtimeHours || 0) * OVERTIME_RATE_PER_HOUR, gross };
  };

  const currentPayroll = useMemo(() => {
    return users.map(user => {
      const record = payroll.find(r => r.userId === user.id && r.month === selectedMonth);
      
      // If record exists, normalize it to ensure all fields are present (safety for persistent data)
      if (record) return {
        ...record,
        baseSalary: record.baseSalary ?? 0,
        allowances: record.allowances ?? 0,
        overtimeHours: record.overtimeHours ?? 0,
        overtimePay: record.overtimePay ?? 0,
        salesVolume: record.salesVolume ?? 0,
        commissionRate: record.commissionRate ?? 0,
        commissionEarnings: record.commissionEarnings ?? 0,
        bonus: record.bonus ?? 0,
        deductions: record.deductions ?? 0,
        ssnit: record.ssnit ?? 0,
        paye: record.paye ?? 0
      } as PayrollRecord;

      const baseSalary = user.role === 'Admin' ? 6200 : user.role === 'Manager' ? 4500 : 2500;
      const allowances = baseSalary * 0.15; // 15% standard regional allowance
      const { ssnit, paye, overtimePay } = calculateFinancials(baseSalary, allowances, 0, 0, 0);

      return {
        id: `pay-${user.id}-${selectedMonth}`,
        userId: user.id,
        userName: user.name,
        role: user.role,
        department: user.role === 'Admin' ? 'Executive' : 'Operations',
        baseSalary,
        allowances,
        overtimeHours: 0,
        overtimePay,
        salesVolume: 0,
        commissionRate: user.role === 'Cashier' ? 2 : 0, // 2% default for cashiers
        commissionEarnings: 0,
        bonus: 0,
        deductions: 0,
        ssnit,
        paye,
        status: 'Pending',
        month: selectedMonth,
        paymentDate: undefined,
        paymentMethod: 'Bank Transfer'
      } as PayrollRecord;
    });
  }, [users, payroll, selectedMonth]);

  const filtered = currentPayroll.filter(p => 
    p.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const netTotal = currentPayroll.reduce((sum, p) => 
      sum + ((p.baseSalary ?? 0) + (p.allowances ?? 0) + (p.bonus ?? 0) + (p.overtimePay ?? 0) + (p.commissionEarnings ?? 0) - (p.deductions ?? 0) - (p.ssnit ?? 0) - (p.paye ?? 0)), 0);
    const grossTotal = currentPayroll.reduce((sum, p) => sum + ((p.baseSalary ?? 0) + (p.allowances ?? 0) + (p.bonus ?? 0) + (p.overtimePay ?? 0) + (p.commissionEarnings ?? 0)), 0);
    const totalCommissions = currentPayroll.reduce((sum, p) => sum + (p.commissionEarnings ?? 0), 0);
    const paid = currentPayroll.filter(p => p.status === 'Paid').reduce((sum, p) => 
      sum + ((p.baseSalary ?? 0) + (p.allowances ?? 0) + (p.bonus ?? 0) + (p.overtimePay ?? 0) + (p.commissionEarnings ?? 0) - (p.deductions ?? 0) - (p.ssnit ?? 0) - (p.paye ?? 0)), 0);
    const pendingCount = currentPayroll.filter(p => p.status === 'Pending').length;
    const progress = netTotal > 0 ? (paid / netTotal) * 100 : 0;

    const chartData = [
      { name: 'Basic', amount: currentPayroll.reduce((s,p) => s + (p.baseSalary ?? 0), 0) },
      { name: 'Allowances', amount: currentPayroll.reduce((s,p) => s + (p.allowances ?? 0), 0) },
      { name: 'Comm.', amount: totalCommissions },
      { name: 'Overtime', amount: currentPayroll.reduce((s,p) => s + (p.overtimePay ?? 0), 0) }
    ];

    return { netTotal, grossTotal, paid, pendingCount, progress, chartData, totalCommissions };
  }, [currentPayroll]);

  const handleUpdateRecord = (id: string, field: keyof PayrollRecord, value: any) => {
    setPayroll(prev => {
      const existingIdx = prev.findIndex(r => r.id === id);
      const record = currentPayroll.find(r => r.id === id)!;
      let updatedRecord = { ...record, [field]: value };

      // Recalculate commission if volume or rate changes
      if (field === 'salesVolume' || field === 'commissionRate') {
        updatedRecord.commissionEarnings = (Number(updatedRecord.salesVolume || 0) * Number(updatedRecord.commissionRate || 0)) / 100;
      }

      if (['baseSalary', 'allowances', 'overtimeHours', 'salesVolume', 'commissionRate', 'bonus'].includes(field)) {
        const { ssnit, paye, overtimePay } = calculateFinancials(
            Number(updatedRecord.baseSalary || 0), 
            Number(updatedRecord.allowances || 0), 
            Number(updatedRecord.overtimeHours || 0),
            Number(updatedRecord.commissionEarnings || 0),
            Number(updatedRecord.bonus || 0)
        );
        updatedRecord = { ...updatedRecord, ssnit, paye, overtimePay };
      }

      if (existingIdx >= 0) {
        const newPayroll = [...prev];
        newPayroll[existingIdx] = updatedRecord;
        return newPayroll;
      } else {
        return [...prev, updatedRecord];
      }
    });
  };

  const handleProcessPayment = (record: PayrollRecord) => {
    if (record.status === 'Paid') return;
    const net = (record.baseSalary ?? 0) + (record.allowances ?? 0) + (record.bonus ?? 0) + (record.overtimePay ?? 0) + (record.commissionEarnings ?? 0) - (record.deductions ?? 0) - (record.ssnit ?? 0) - (record.paye ?? 0);
    
    const updatedRecord: PayrollRecord = {
      ...record,
      status: 'Paid',
      paymentDate: Date.now(),
      reference: `SAL-${Date.now().toString().slice(-6)}-${record.userId.slice(-2)}`
    };

    setPayroll(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        const n = [...prev]; n[idx] = updatedRecord; return n;
      }
      return [...prev, updatedRecord];
    });

    onAddExpense({
      id: `pay-exp-${Date.now()}`,
      title: `Payroll: ${record.userName}`,
      category: 'Salaries',
      amount: net,
      date: Date.now(),
      note: `Disbursement Ref: ${updatedRecord.reference}`
    });
  };

  const handlePrintRecord = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Landmark size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Enterprise Payroll Hub</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Global workforce compensation and regional statutory compliance.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm">
           <button 
             onClick={() => setActiveView('ledger')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'ledger' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             Ledger
           </button>
           <button 
             onClick={() => setActiveView('analytics')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
             Analytics
           </button>
           <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
           <select 
             value={selectedMonth} 
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="bg-transparent text-xs font-black text-slate-700 dark:text-slate-200 outline-none pr-4 cursor-pointer uppercase tracking-widest"
           >
             {[0, 1, 2, 3].map(i => {
                const d = new Date(); d.setMonth(d.getMonth() - i);
                const val = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                return <option key={val} value={val}>{val}</option>;
             })}
           </select>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricBox label="Monthly Liability" value={`GH₵${stats.netTotal.toLocaleString()}`} icon={<Wallet className="text-indigo-600" />} sub={`Gross: GH₵${stats.grossTotal.toLocaleString()}`} />
        <MetricBox label="Performance Comm." value={`GH₵${stats.totalCommissions.toLocaleString()}`} icon={<TrendingUpDown className="text-emerald-600" />} sub="Sales Commissions Pool" />
        <MetricBox label="Pending Payouts" value={stats.pendingCount.toString()} icon={<Clock className="text-amber-600" />} sub="Active Staff awaiting pay" />
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl flex flex-col justify-between group overflow-hidden relative">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Disbursement Progress</p>
              <p className="text-3xl font-black">{stats.progress.toFixed(0)}%</p>
           </div>
           <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden relative z-10">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
           </div>
           <Zap className="absolute right-[-10px] bottom-[-10px] text-white/5 group-hover:text-indigo-500/20 transition-all" size={100} />
        </div>
      </div>

      {activeView === 'ledger' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px] transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff, department or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="flex items-center gap-3">
               <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                  <Download size={20} />
               </button>
               <button 
                 onClick={() => confirm(`Authorize disbursement for ${stats.pendingCount} staff members?`) && currentPayroll.filter(p => p.status === 'Pending').forEach(handleProcessPayment)}
                 disabled={stats.pendingCount === 0}
                 className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 disabled:opacity-50"
               >
                 <BadgeCheck size={18} /> Process Monthly Payroll
               </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/20 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Identification</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Earnings (GH₵)</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Performance (GH₵)</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statutory</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Disbursement</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-100 dark:border-indigo-800">
                          {record.userName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-slate-100 text-sm">{record.userName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{record.department} • {record.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-slate-400 uppercase w-10">Base:</span>
                           <input type="number" value={record.baseSalary} disabled={record.status === 'Paid'} onChange={(e) => handleUpdateRecord(record.id, 'baseSalary', parseFloat(e.target.value))} className="ledger-input" />
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-slate-400 uppercase w-10">Allow:</span>
                           <input type="number" value={record.allowances} disabled={record.status === 'Paid'} onChange={(e) => handleUpdateRecord(record.id, 'allowances', parseFloat(e.target.value))} className="ledger-input text-emerald-600" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-center gap-2">
                             <span className="text-[8px] font-black text-slate-400 uppercase">Sales Vol:</span>
                             <input type="number" value={record.salesVolume} disabled={record.status === 'Paid'} onChange={(e) => handleUpdateRecord(record.id, 'salesVolume', parseFloat(e.target.value))} className="ledger-input w-20 bg-emerald-50/30" />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                             <span className="text-[8px] font-black text-slate-400 uppercase">Comm %:</span>
                             <input type="number" value={record.commissionRate} disabled={record.status === 'Paid'} onChange={(e) => handleUpdateRecord(record.id, 'commissionRate', parseFloat(e.target.value))} className="ledger-input w-12" />
                             <span className="text-[10px] font-black text-emerald-600">GH₵{(record.commissionEarnings ?? 0).toFixed(0)}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-rose-500 flex justify-between"><span>SSNIT:</span> <span>-{(record.ssnit ?? 0).toFixed(2)}</span></p>
                          <p className="text-[9px] font-bold text-rose-500 flex justify-between"><span>PAYE:</span> <span>-{(record.paye ?? 0).toFixed(2)}</span></p>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <p className="font-black text-slate-900 dark:text-white text-lg">GH₵{((record.baseSalary ?? 0) + (record.allowances ?? 0) + (record.bonus ?? 0) + (record.overtimePay ?? 0) + (record.commissionEarnings ?? 0) - (record.deductions ?? 0) - (record.ssnit ?? 0) - (record.paye ?? 0)).toFixed(2)}</p>
                       <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mt-1 ${record.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                         {record.status}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => setSelectedRecord(record)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><FileText size={18} /></button>
                         {record.status === 'Paid' ? (
                            <button onClick={() => handlePrintRecord(record)} className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-900/50"><Printer size={18} /></button>
                         ) : (
                            <button onClick={() => handleProcessPayment(record)} className="h-10 px-5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-indigo-700">Pay</button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><BarChart3 size={20} className="text-indigo-600" /> Cost Distribution</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedMonth}</span>
             </div>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                 </ComposedChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
             <div>
                <h3 className="text-xl font-black mb-6">Regional Net Impact</h3>
                <div className="space-y-6">
                   <ImpactRow label="Total Basic Salaries" value={stats.chartData[0].amount} color="bg-indigo-500" />
                   <ImpactRow label="Allowances & Perks" value={stats.chartData[1].amount} color="bg-emerald-500" />
                   <ImpactRow label="Sales Commissions" value={stats.totalCommissions} color="bg-teal-500" />
                   <ImpactRow label="Overtime Disbursements" value={stats.chartData[3].amount} color="bg-amber-500" />
                   <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Net</p>
                      <p className="text-4xl font-black text-white">GH₵{stats.netTotal.toLocaleString()}</p>
                   </div>
                </div>
             </div>
             <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Enterprise Payslip Modal / Receipt Template */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 print:p-0">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10 print:rounded-none print:shadow-none print:max-w-none print:h-screen">
              <div id="receipt-printable-area" className="p-10 space-y-10 bg-white dark:bg-slate-900 relative">
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-30deg]">
                    <h1 className="text-8xl font-black uppercase">Verified</h1>
                 </div>
                 
                 <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                       <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{businessName}</h1>
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Corporate Payroll Division</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pay Period</p>
                       <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{selectedRecord.month}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative z-10">
                    <div className="space-y-4">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Employee Name</p><p className="text-sm font-bold text-slate-800 dark:text-white">{selectedRecord.userName}</p></div>
                       <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Department</p><p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{selectedRecord.department}</p></div>
                    </div>
                    <div className="space-y-4 text-right">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Payment ID</p><p className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{selectedRecord.reference || 'SYSTEM_PENDING'}</p></div>
                       <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Method</p><p className="text-xs font-bold text-slate-800 dark:text-white">{selectedRecord.paymentMethod}</p></div>
                    </div>
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Gross Earnings</h4>
                       <PayslipRow label="Basic Salary" value={selectedRecord.baseSalary} />
                       <PayslipRow label="Housing & Transport Allowances" value={selectedRecord.allowances} isPositive />
                       {selectedRecord.commissionEarnings > 0 && <PayslipRow label={`Sales Commission (${selectedRecord.commissionRate}%)`} value={selectedRecord.commissionEarnings} isPositive />}
                       <PayslipRow label={`Overtime (${selectedRecord.overtimeHours ?? 0} hrs)`} value={selectedRecord.overtimePay} isPositive />
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Deductions & Taxes</h4>
                       <PayslipRow label="SSNIT Employee (5.5%)" value={selectedRecord.ssnit} isNegative />
                       <PayslipRow label="PAYE Tax Deduction" value={selectedRecord.paye} isNegative />
                       {selectedRecord.deductions > 0 && <PayslipRow label="Other Deductions" value={selectedRecord.deductions} isNegative />}
                    </div>

                    <div className="pt-8 border-t-4 border-double border-slate-100 dark:border-slate-800 flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">NET PAYABLE AMOUNT</p>
                          <p className="text-[9px] font-bold text-slate-400">Total bank transfer amount in GHS</p>
                       </div>
                       <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">GH₵{((selectedRecord.baseSalary ?? 0) + (selectedRecord.allowances ?? 0) + (selectedRecord.bonus ?? 0) + (selectedRecord.overtimePay ?? 0) + (selectedRecord.commissionEarnings ?? 0) - (selectedRecord.deductions ?? 0) - (selectedRecord.ssnit ?? 0) - (selectedRecord.paye ?? 0)).toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="pt-10 flex items-center justify-between opacity-50 relative z-10">
                    <div className="max-w-[250px]">
                       <p className="text-[8px] font-medium text-slate-400 leading-relaxed">
                         Issued by GeminiPOS Corporate Node. This is an official digital representation of payment.
                       </p>
                    </div>
                    <QrCode size={48} className="text-slate-300 dark:text-slate-600" />
                 </div>
              </div>

              <div className="p-8 bg-slate-900 flex gap-4 print:hidden">
                 <button onClick={() => setSelectedRecord(null)} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <Undo2 size={16} /> Return to Ledger
                 </button>
                 <button 
                    onClick={() => { window.print(); }} 
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                 >
                    <Printer size={18} /> Print & Close
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .ledger-input {
          width: 80px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
          font-size: 11px;
          font-weight: 800;
          color: #1e293b;
          outline: none;
        }
        .dark .ledger-input {
          background: #1e293b;
          border-color: #334155;
          color: #f1f5f9;
        }
        .ledger-input:focus {
          border-color: #6366f1;
        }
      `}</style>
    </div>
  );
};

const MetricBox = ({ label, value, icon, sub }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
    <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">{value}</p>
    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{sub}</p>
  </div>
);

const ImpactRow = ({ label, value, color }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
      <p className="text-xs font-bold text-slate-400">{label}</p>
    </div>
    <p className="text-sm font-black">GH₵{value.toLocaleString()}</p>
  </div>
);

const PayslipRow = ({ label, value, isPositive, isNegative }: { label: string, value: number, isPositive?: boolean, isNegative?: boolean }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="font-bold text-slate-600 dark:text-slate-400">{label}</span>
    <span className={`font-black font-mono ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
      {isPositive ? '+ ' : isNegative ? '- ' : ''}GH₵{(value ?? 0).toFixed(2)}
    </span>
  </div>
);