
import React, { useState, useMemo } from 'react';
import { Wallet, Search, Phone, History, ArrowRight, UserCheck, X, CheckCircle2, AlertCircle, Clock, Calendar, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Printer, FileText, ListFilter, ClipboardCheck } from 'lucide-react';
import { Customer, Transaction } from '../types';

interface CreditLedgerViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  transactions: Transaction[];
  onSettleDebt: (customerId: string, amount: number, method: 'Cash' | 'Digital') => void;
  businessName: string;
}

export const CreditLedgerView: React.FC<CreditLedgerViewProps> = ({ customers, setCustomers, transactions, onSettleDebt, businessName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'debtors' | 'log'>('debtors');
  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'Digital'>('Cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPaymentTx, setLastPaymentTx] = useState<Transaction | null>(null);

  const debtors = useMemo(() => {
    return customers
      .filter(c => (c.creditBalance ?? 0) > 0 && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      ))
      .sort((a, b) => (b.creditBalance ?? 0) - (a.creditBalance ?? 0));
  }, [customers, searchTerm]);

  const allRepayments = useMemo(() => {
    return transactions
      .filter(t => t.isSettlement)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.creditBalance ?? 0), 0);
  }, [customers]);

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor || !settleAmount) return;

    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Generate a temporary ID for the receipt link
    const tempId = `PAY-${Date.now().toString().slice(-6)}`;
    
    onSettleDebt(selectedDebtor.id, amount, settleMethod);

    // Mock the transaction object for immediate printing
    const mockTx: Transaction = {
      id: tempId,
      timestamp: Date.now(),
      items: [],
      total: amount,
      tax: 0,
      discount: 0,
      paymentMethod: settleMethod,
      customerId: selectedDebtor.id,
      isSettlement: true
    };

    setLastPaymentTx(mockTx);
    setSettleAmount('');
    setSelectedDebtor(null);
    setShowSuccess(true);
  };

  const handlePrintReceipt = (tx: Transaction) => {
    setLastPaymentTx(tx);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const getDebtorHistory = (customerId: string) => {
    return transactions
      .filter(t => t.customerId === customerId && (t.paymentMethod === 'Credit' || t.isSettlement))
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  const getStatusBadge = (t: Transaction) => {
    if (t.isSettlement) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase border border-emerald-100 dark:border-emerald-800">
          <CheckCircle2 size={8} /> Repayment
        </span>
      );
    }

    if (!t.dueDate) return null;
    const now = Date.now();
    const isOverdue = now > t.dueDate;
    
    if (isOverdue) {
      const days = Math.floor((now - t.dueDate) / (1000 * 60 * 60 * 24));
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[8px] font-black uppercase border border-rose-100 dark:border-rose-800">
          <AlertTriangle size={8} /> {days}d Overdue
        </span>
      );
    }
    
    const daysLeft = Math.ceil((t.dueDate - now) / (1000 * 60 * 60 * 24));
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase border border-indigo-100 dark:border-indigo-800">
        <Clock size={8} /> {daysLeft}d Left
      </span>
    );
  };

  const getNextDueDate = (customerId: string) => {
    const txs = transactions.filter(t => t.customerId === customerId && t.paymentMethod === 'Credit' && t.dueDate);
    if (txs.length === 0) return null;
    const earliest = Math.min(...txs.map(t => t.dueDate!));
    return earliest;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Credit & Collections</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Verified tracking of BNPL accounts and historical settlement logs.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-6 py-3 rounded-3xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Accounts with Debt</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{debtors.length}</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 px-6 py-3 rounded-3xl">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Receivables</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">GH₵{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('debtors')}
          className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'debtors' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Active Debtors
          {activeTab === 'debtors' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'log' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Collection Log
          {activeTab === 'log' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
      </div>

      {activeTab === 'debtors' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by customer name or phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm font-black text-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-800 overflow-y-auto max-h-[600px] custom-scrollbar">
                {debtors.length > 0 ? debtors.map(c => {
                  const nextDue = getNextDueDate(c.id);
                  const isOverdue = nextDue && nextDue < Date.now();
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedDebtor(c)}
                      className={`p-5 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedDebtor?.id === c.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'} rounded-2xl border dark:border-slate-700 shadow-sm flex items-center justify-center font-black`}>
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{c.name}</h4>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                               <Phone size={10} /> {c.phone}
                             </div>
                             {nextDue && (
                               <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${isOverdue ? 'text-rose-500' : 'text-indigo-500'}`}>
                                 <Calendar size={10} /> {isOverdue ? 'Overdue' : 'Due'}: {new Date(nextDue).toLocaleDateString()}
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black ${isOverdue ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>GH₵{(c.creditBalance ?? 0).toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Active Debt</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-20 text-center opacity-30">
                    <UserCheck size={48} className="mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">All BNPL accounts cleared</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {selectedDebtor ? (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-black mb-1">{selectedDebtor.name}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Financial Ledger Profile</p>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Unpaid Balance</p>
                        <p className="text-3xl font-black">GH₵{(selectedDebtor.creditBalance ?? 0).toFixed(2)}</p>
                      </div>
                      <Wallet size={32} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
                </div>

                <div className="p-8 space-y-8 bg-white dark:bg-slate-900">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <History size={14} /> Account Activity History
                    </h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {getDebtorHistory(selectedDebtor.id).map(t => (
                        <div key={t.id} className={`p-4 rounded-2xl space-y-3 border ${t.isSettlement ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-900/50' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.isSettlement ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                  {t.isSettlement ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-800 dark:text-slate-100">{t.id}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.timestamp).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="text-right">
                               <p className={`font-black text-sm ${t.isSettlement ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                                 {t.isSettlement ? '-' : '+'} GH₵{(t.total ?? 0).toFixed(2)}
                               </p>
                               {getStatusBadge(t)}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSettle} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Process Repayment</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                         <button type="button" onClick={() => setSettleMethod('Cash')} className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${settleMethod === 'Cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>Cash</button>
                         <button type="button" onClick={() => setSettleMethod('Digital')} className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${settleMethod === 'Digital' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>Digital</button>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">GH₵</div>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          value={settleAmount}
                          onChange={(e) => setSettleAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-5 text-sm font-black text-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500/10 outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Confirm Repayment
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-full bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <AlertCircle size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest text-slate-400 leading-relaxed">Select an account<br/>to process BNPL settlement</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-500">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                    <ClipboardCheck size={20} />
                 </div>
                 <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Master Collection Log</h3>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{allRepayments.length} Verified Records</p>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/20 dark:bg-slate-800/20">
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Date</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                       <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {allRepayments.map(t => {
                       const customer = customers.find(c => c.id === t.customerId);
                       return (
                        <tr key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                           <td className="px-6 py-4"><span className="text-[10px] font-mono font-bold text-slate-400">{t.id}</span></td>
                           <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{customer?.name || 'Guest User'}</p>
                              <p className="text-[9px] text-slate-400 uppercase font-black">{customer?.phone}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{new Date(t.timestamp).toLocaleDateString()}</p>
                              <p className="text-[9px] text-slate-400 uppercase font-medium">{new Date(t.timestamp).toLocaleTimeString()}</p>
                           </td>
                           <td className="px-6 py-4"><p className="font-black text-emerald-600 dark:text-emerald-400">GH₵{(t.total ?? 0).toFixed(2)}</p></td>
                           <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[8px] font-black uppercase tracking-widest border dark:border-slate-700">{t.paymentMethod}</span></td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handlePrintReceipt(t)}
                                className="p-2 text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                              >
                                <Printer size={18} />
                              </button>
                           </td>
                        </tr>
                       );
                    })}
                    {allRepayments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-24 text-center">
                           <div className="flex flex-col items-center opacity-30">
                              <FileText size={48} className="mb-4 text-slate-300" />
                              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No repayment records found</p>
                           </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-6 print:hidden">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center animate-bounce-in w-full max-w-sm text-center border border-white/10">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
               <CheckCircle2 size={40} strokeWidth={4} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Ledger Updated</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Debt repayment successfully recorded.</p>
            
            <div className="w-full space-y-4">
              <button 
                onClick={() => lastPaymentTx && handlePrintReceipt(lastPaymentTx)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 active:scale-95"
              >
                <Printer size={18} /> Print Payment Receipt
              </button>
              <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Next Operation</button>
            </div>
          </div>
        </div>
      )}

      {/* Repayment Receipt Printable Template */}
      {lastPaymentTx && lastPaymentTx.isSettlement && (
        <div id="receipt-printable-area" className="hidden print:block printable-area">
          <div className="receipt-container">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase tracking-tight">{businessName}</h1>
              <p className="text-sm">Account Settlement Hub</p>
              <div className="border-b border-black border-dashed my-3"></div>
            </div>
            
            <div className="text-center mb-6 bg-black text-white p-2 font-bold uppercase tracking-widest">
               Acknowledgement of Payment
            </div>

            <div className="mb-6 text-[12px] leading-relaxed">
              <p><span className="font-bold">TX REF:</span> {lastPaymentTx.id}</p>
              <p><span className="font-bold">DATE:</span> {new Date(lastPaymentTx.timestamp).toLocaleString()}</p>
              <p><span className="font-bold">METHOD:</span> {lastPaymentTx.paymentMethod}</p>
              <p><span className="font-bold">ACCOUNT:</span> {customers.find(c => c.id === lastPaymentTx.customerId)?.name || 'Guest'}</p>
            </div>

            <div className="border-b border-black border-dashed mb-6"></div>

            <div className="space-y-4 text-[12px]">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold uppercase">Amount Paid</span>
                <span className="font-mono font-bold">GH₵{(lastPaymentTx.total ?? 0).toFixed(2)}</span>
              </div>
              
              <div className="bg-slate-100 p-3 text-center border border-black italic">
                This document confirms that the above amount has been applied to your outstanding credit balance.
              </div>
            </div>

            <div className="border-b border-black border-dashed my-6"></div>

            <div className="text-center mt-10">
              <p className="font-bold text-[14px]">Official Ledger Copy</p>
              <p className="text-[10px] mt-2 opacity-70">GeminiPOS Verification Node: Accra Gateway</p>
              <div className="mt-6 flex flex-col items-center gap-2">
                 <img 
                    src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${lastPaymentTx.id}&scale=1&rotate=N&includetext=false`}
                    alt="Security Code"
                    className="h-10 w-auto"
                  />
                 <p className="text-[8px] font-mono tracking-[0.3em]">{lastPaymentTx.id}</p>
              </div>
              <p className="text-[10px] mt-8 italic">Thank you for your business!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
