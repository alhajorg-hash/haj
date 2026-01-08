
import React, { useMemo, useState } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';
import { DollarSign, ShoppingBag, Package, AlertTriangle, ArrowRight, TrendingUp, History, BrainCircuit, ListTodo, Wallet, CreditCard, ShoppingCart, Printer, Target, BarChart4 } from 'lucide-react';
import { Product, Transaction, ViewState, ShopTask, Customer } from '../types';

interface DashboardViewProps {
  transactions: Transaction[];
  products: Product[];
  tasks: ShopTask[];
  setView: (view: ViewState) => void;
  customers?: Customer[];
  businessName: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ transactions, products, tasks, setView, customers = [], businessName }) => {
  const [printTx, setPrintTx] = useState<Transaction | null>(null);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    
    // SALES & REVENUE (Excluding debt settlements)
    const todayTrans = transactions.filter(t => new Date(t.timestamp).toLocaleDateString() === today && !t.isSettlement);
    const todayRevenue = todayTrans.reduce((sum, t) => sum + t.total, 0);
    
    const todayCost = todayTrans.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + ((item.costPrice || 0) * item.quantity), 0);
    }, 0);

    const allSalesTrans = transactions.filter(t => !t.isSettlement);
    const totalSalesAllTime = allSalesTrans.reduce((sum, t) => sum + t.total, 0);
    const totalCostAllTime = allSalesTrans.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + ((item.costPrice || 0) * item.quantity), 0);
    }, 0);

    const lowStockCount = products.filter(p => p.stock <= 5).length;
    const totalDebt = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    const chartData = last7Days.map(date => {
      const dailySales = transactions.filter(t => new Date(t.timestamp).toLocaleDateString() === date && !t.isSettlement);
      const rev = dailySales.reduce((sum, t) => sum + t.total, 0);
      return { name: date.split('/').slice(0, 2).join('/'), revenue: rev, orders: dailySales.length };
    });

    const debtors = customers
      .filter(c => c.creditBalance > 0)
      .sort((a, b) => b.creditBalance - a.creditBalance)
      .slice(0, 4);

    return { 
      todayRevenue, 
      todayCost,
      totalSalesAllTime,
      totalCostAllTime,
      todayOrders: todayTrans.length, 
      lowStockCount, 
      totalDebt, 
      chartData, 
      debtors,
      recentTransactions: [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
      lowStockProducts: products.filter(p => p.stock <= 5).slice(0, 4),
      pendingTasks: tasks.filter(t => t.status !== 'done').slice(0, 3)
    };
  }, [transactions, products, tasks, customers]);

  const handlePrint = (tx: Transaction) => {
    setPrintTx(tx);
    setTimeout(() => {
      window.print();
      setPrintTx(null);
    }, 100);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">Store Performance</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Consolidated financial overview for Ghana node.</p>
        </div>
        <button 
          onClick={() => setView('pos')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          New Transaction
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <SummaryCard label="Today's Sales" value={`GH₵${stats.todayRevenue.toLocaleString()}`} icon={<DollarSign className="text-emerald-600 dark:text-emerald-400" />} bg="bg-emerald-50 dark:bg-emerald-500/10" />
        <SummaryCard label="Today's Cost" value={`GH₵${stats.todayCost.toLocaleString()}`} icon={<History className="text-slate-600 dark:text-slate-400" />} bg="bg-slate-100 dark:bg-slate-800" />
        <SummaryCard label="BNPL Receivables" value={`GH₵${stats.totalDebt.toLocaleString()}`} icon={<Wallet className="text-rose-600 dark:text-rose-400" />} bg="bg-rose-50 dark:bg-rose-500/10" highlight={stats.totalDebt > 0} />
        <SummaryCard label="Daily Orders" value={stats.todayOrders.toString()} icon={<ShoppingBag className="text-indigo-600 dark:text-indigo-400" />} bg="bg-indigo-50 dark:bg-indigo-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-indigo-600 text-white p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden transition-colors duration-300">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-indigo-200" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Total Sales Volume</span>
              </div>
              <p className="text-4xl font-black mb-2">GH₵{stats.totalSalesAllTime.toLocaleString()}</p>
              <p className="text-xs font-bold opacity-70">Total gross value of all retail transactions processed.</p>
           </div>
           <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden transition-colors duration-300">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart4 size={20} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Purchase Cost</span>
              </div>
              <p className="text-4xl font-black mb-2">GH₵{stats.totalCostAllTime.toLocaleString()}</p>
              <p className="text-xs font-bold opacity-70">Cumulative investment in sold inventory items.</p>
           </div>
           <div className="absolute bottom-[-20px] right-[-20px] w-48 h-48 bg-slate-800 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" /> Revenue Trend (Accrual)
            </h3>
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: 'currentColor'}} className="text-slate-400 dark:text-slate-500" />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: 'currentColor'}} className="text-slate-400 dark:text-slate-500" hide={window.innerWidth < 640} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'currentColor'}} className="text-white dark:text-slate-900" />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.05} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2"><History size={20} className="text-indigo-600 dark:text-indigo-400" /> Recent Activity</h3>
              <button onClick={() => setView('reports')} className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {stats.recentTransactions.length > 0 ? stats.recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-lg shrink-0">{tx.isSettlement ? '🤝' : tx.paymentMethod === 'Card' ? '💳' : tx.paymentMethod === 'Cash' ? '💵' : tx.paymentMethod === 'Credit' ? '🕒' : '📱'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{tx.id}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{tx.isSettlement ? 'Debt Settlement' : new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-black text-xs shrink-0 ${tx.isSettlement ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {tx.isSettlement ? '+' : ''}GH₵{tx.total.toFixed(2)}
                      </p>
                      {tx.paymentMethod === 'Credit' && <span className="text-[8px] font-black text-rose-500 dark:text-rose-400 uppercase">Credit Issued</span>}
                      {tx.isSettlement && <span className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase">Balance Repaid</span>}
                    </div>
                    <button 
                      onClick={() => handlePrint(tx)}
                      className="p-2 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Print Receipt"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              )) : <p className="py-8 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase italic">No activity recorded today</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2"><Wallet size={18} className="text-rose-500 dark:text-rose-400" /> BNPL Watchlist</h3>
              <button onClick={() => setView('credit-ledger')} className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase hover:underline">Manage</button>
            </div>
            <div className="space-y-4">
              {stats.debtors.length > 0 ? stats.debtors.map(debtor => (
                <div key={debtor.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-black">{debtor.name[0]}</div>
                    <p className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{debtor.name}</p>
                  </div>
                  <p className="font-black text-xs text-rose-600 dark:text-rose-400">GH₵{debtor.creditBalance.toFixed(0)}</p>
                </div>
              )) : <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase py-4 text-center">No outstanding debts</p>}
            </div>
          </div>

          <div className="bg-indigo-600 dark:bg-indigo-700 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/10 relative overflow-hidden transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit size={18} className="text-indigo-200 dark:text-indigo-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 dark:text-indigo-300">AI Logic</span>
              </div>
              <p className="text-sm font-bold leading-relaxed mb-4">Gemini AI identified {stats.debtors.length} high-priority BNPL collections for this week.</p>
              <button onClick={() => setView('ai-assistant')} className="bg-white/10 hover:bg-white/20 w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2">Ask Gemini <ArrowRight size={14} /></button>
            </div>
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-500 dark:bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-orange-500 dark:text-orange-400" /> Action Required</h3>
            <div className="space-y-4">
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0"><img src={p.image} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{p.name}</p><p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase">{p.stock} units left</p></div>
                </div>
              ))}
              <button onClick={() => setView('inventory')} className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-50 dark:border-indigo-500/10 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10">Manage Inventory</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Printable Receipt */}
      {printTx && (
        <div id="receipt-printable-area" className="hidden print:block printable-area">
          <div className="receipt-container">
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold uppercase tracking-tight">{businessName}</h1>
              <p className="text-sm">Regional Sales Node</p>
              <div className="border-b border-black border-dashed my-2"></div>
            </div>
            <div className="mb-4 text-[11px] leading-tight">
              <p><span className="font-bold">Order ID:</span> {printTx.id}</p>
              <p><span className="font-bold">Date:</span> {new Date(printTx.timestamp).toLocaleString()}</p>
              <p><span className="font-bold">Nature:</span> {printTx.isSettlement ? 'DEBT REPAYMENT' : 'RETAIL SALE'}</p>
              <p><span className="font-bold">Payment:</span> {printTx.paymentMethod}</p>
              {printTx.dueDate && (
                 <p><span className="font-bold">DUE DATE:</span> {new Date(printTx.dueDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="border-b border-black border-dashed mb-2"></div>
            <div className="space-y-1 text-[11px]">
              {printTx.items.length > 0 ? printTx.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <span className="flex-1">{item.quantity}x {item.name}</span>
                  <span className="font-mono">{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              )) : (
                <div className="text-center py-2 italic font-bold uppercase">Settlement Payment</div>
              )}
            </div>
            <div className="border-b border-black border-dashed my-2"></div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">GH₵{(printTx.total - printTx.tax + printTx.discount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (8%)</span><span className="font-mono">GH₵{printTx.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-[14px] mt-1 pt-1 border-t border-black border-double">
                <span>TOTAL</span>
                <span className="font-mono">GH₵{printTx.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="font-bold text-[12px]">Thank You!</p>
              <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${printTx.id}&scale=1&rotate=N&includetext=false`} alt="Barcode" className="h-10 w-auto mt-4 mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; icon: React.ReactNode; bg: string; highlight?: boolean }> = ({ label, value, icon, bg, highlight }) => (
  <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md ${highlight ? 'ring-2 ring-rose-500/10 dark:ring-rose-500/20 border-rose-100 dark:border-rose-900/50' : ''}`}>
    <div className={`w-10 h-10 md:w-12 md:h-12 ${bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 shrink-0`}>{icon}</div>
    <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 truncate w-full">{label}</p>
    <p className="text-sm md:text-2xl font-black text-slate-800 dark:text-slate-100 truncate w-full">{value}</p>
  </div>
);
