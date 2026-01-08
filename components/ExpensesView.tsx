
import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Plus, Filter, Calendar, FileText, ChevronRight, X, CheckCircle, Tag, AlignLeft, Receipt, Download, RefreshCw, Trash2, Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Expense } from '../types';
import { exportExpensesToExcel } from '../services/exportService';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onUpdateExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES = ['All', 'Operational', 'Utilities', 'Marketing', 'Salaries', 'Maintenance'];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Filtering States
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({
    start: '',
    end: ''
  });

  const [formData, setFormData] = useState<Partial<Expense>>({
    title: '',
    category: 'Operational',
    amount: 0,
    note: ''
  });

  // Derived filtered data
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
      const matchesSearch = exp.title.toLowerCase().includes(filterSearch.toLowerCase()) || 
                           (exp.note || '').toLowerCase().includes(filterSearch.toLowerCase());
      
      let matchesDate = true;
      if (filterDateRange.start) {
        matchesDate = matchesDate && exp.date >= new Date(filterDateRange.start).getTime();
      }
      if (filterDateRange.end) {
        matchesDate = matchesDate && exp.date <= (new Date(filterDateRange.end).getTime() + 86400000);
      }

      return matchesCategory && matchesSearch && matchesDate;
    }).sort((a, b) => b.date - a.date);
  }, [expenses, filterCategory, filterSearch, filterDateRange]);

  const totalFilteredSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  }, [filteredExpenses]);

  const resetFilters = () => {
    setFilterCategory('All');
    setFilterSearch('');
    setFilterDateRange({ start: '', end: '' });
  };

  // Update form data when editingExpense changes
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title,
        category: editingExpense.category,
        amount: editingExpense.amount,
        note: editingExpense.note
      });
      setIsModalOpen(true);
    } else {
      setFormData({ title: '', category: 'Operational', amount: 0, note: '' });
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    if (editingExpense) {
      const updated: Expense = {
        ...editingExpense,
        title: formData.title!,
        category: formData.category || 'Operational',
        amount: Number(formData.amount),
        note: formData.note || ''
      };
      onUpdateExpense(updated);
    } else {
      const newExpense: Expense = {
        id: `e-${Date.now()}`,
        title: formData.title!,
        category: formData.category || 'Operational',
        amount: Number(formData.amount),
        date: Date.now(),
        note: formData.note || ''
      };
      onAddExpense(newExpense);
    }

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({ title: '', category: 'Operational', amount: 0, note: '' });
  };

  const handleDelete = () => {
    if (editingExpense && confirm("Are you sure you want to delete this expense record?")) {
      onDeleteExpense(editingExpense.id);
      handleCloseModal();
    }
  };

  const handleExport = () => {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);
    setTimeout(() => {
      exportExpensesToExcel(filteredExpenses);
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Ghana Expense Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor operational costs in GHS.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm border ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Filter size={18} /> 
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {(filterCategory !== 'All' || filterDateRange.start || filterDateRange.end || filterSearch) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
            className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Record Expense
          </button>
        </div>
      </div>

      {/* Collapsible Filter Bar */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Keywords</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Title, notes..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 dark:text-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
              <input 
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange(p => ({ ...p, start: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
              <div className="flex gap-2">
                <input 
                  type="date"
                  value={filterDateRange.end}
                  onChange={(e) => setFilterDateRange(p => ({ ...p, end: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 dark:text-white"
                />
                <button 
                  onClick={resetFilters}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                  title="Reset Filters"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="p-6 md:p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Filtered Spend Total</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">GH₵{totalFilteredSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] font-bold text-emerald-600/60 uppercase mt-1">Based on active filters</p>
        </div>
        <div className="p-6 md:p-8 bg-rose-50 dark:bg-rose-500/10 rounded-[2rem] border border-rose-100 dark:border-rose-500/20 shadow-sm">
          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Records Found</p>
          <p className="text-2xl md:text-3xl font-black text-rose-900 dark:text-rose-50 tracking-tight">{filteredExpenses.length}</p>
          <p className="text-[10px] font-bold text-rose-600/60 uppercase mt-1">Operational transactions</p>
        </div>
        <div className="p-6 md:p-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Avg. Expense Size</p>
          <p className="text-2xl md:text-3xl font-black text-indigo-900 dark:text-indigo-50 tracking-tight">
            GH₵{(filteredExpenses.length > 0 ? totalFilteredSpend / filteredExpenses.length : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] font-bold text-indigo-600/60 uppercase mt-1">Filtered average</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
             <h3 className="font-black text-slate-800 dark:text-slate-100">Regional Expense Ledger</h3>
             <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest">{filteredExpenses.length} ENTRIES</span>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting || filteredExpenses.length === 0}
            className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline disabled:opacity-30 transition-all"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
            {isExporting ? 'Generating...' : 'Export Ledger'}
          </button>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
          {filteredExpenses.length > 0 ? filteredExpenses.map(exp => (
            <div 
              key={exp.id} 
              onClick={() => setEditingExpense(exp)}
              className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-300 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shadow-sm transition-colors shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{exp.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(exp.date).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{exp.category}</span>
                    {exp.note && <span className="italic truncate max-w-[150px]">• {exp.note}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-6 ml-4">
                <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">GH₵{(exp.amount ?? 0).toFixed(2)}</p>
                <ChevronRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-400 hidden sm:block" />
              </div>
            </div>
          )) : (
            <div className="py-20 text-center opacity-30">
              <FileText size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-bold text-slate-800 dark:text-slate-100">No matching expenses found</p>
              <button onClick={resetFilters} className="mt-4 text-indigo-600 text-xs font-black uppercase hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Record/Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-transparent dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white">{editingExpense ? 'Edit Expense' : 'Record Expense'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Records</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Tag size={12} /> Expense Title *
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Electricity Bill August" 
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <DollarSign size={12} /> Amount (GHS) *
                  </label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={formData.amount || ''}
                    onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <AlignLeft size={12} /> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  >
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <AlignLeft size={12} /> Notes (Optional)
                </label>
                <textarea 
                  placeholder="Provide additional details..." 
                  value={formData.note}
                  onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
                  className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                {editingExpense && (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/30"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> {editingExpense ? 'Save Changes' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
