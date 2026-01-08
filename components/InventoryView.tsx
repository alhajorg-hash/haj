import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Package, Plus, Search, Edit3, Trash2, Filter, AlertCircle, 
  CheckCircle, XCircle, Barcode, Printer, X, Image as ImageIcon, 
  Tag, Hash, Building2, Coins, Layers, Download, Upload, FileSpreadsheet,
  FileText, ShieldAlert, Wand2, Sparkles, RefreshCw, CheckSquare, Square,
  MoreHorizontal, ArrowUpCircle, Layers3, Save, TrendingUp, Wallet, ArrowRightLeft, Banknote, Camera, ShoppingCart, DollarSign
} from 'lucide-react';
import { Product, UserRole } from '../types';
import { CATEGORIES } from '../constants';
import { exportInventoryToExcel } from '../services/exportService';
import { generateProductImage } from '../services/geminiService';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  userRole?: UserRole;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ products, setProducts, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkUpdateType, setBulkUpdateType] = useState<'stock' | 'category' | null>(null);
  const [bulkUpdateValue, setBulkUpdateValue] = useState<string>('');

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = userRole === 'Cashier';

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', category: CATEGORIES[1], stock: 0, price: 0, costPrice: 0, brand: '', image: '', sku: ''
  });

  useEffect(() => {
    if (editingProduct) setProductForm(editingProduct);
    else setProductForm({ name: '', category: CATEGORIES[1], stock: 0, price: 0, costPrice: 0, brand: '', image: '', sku: '' });
  }, [editingProduct]);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400', icon: <XCircle size={12} /> };
    if (stock <= 5) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400', icon: <AlertCircle size={12} /> };
    return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400', icon: <CheckCircle size={12} /> };
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && getStockStatus(p.stock).label === statusFilter;
  });

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBulkUpdate = () => {
    if (isReadOnly || !bulkUpdateType || !bulkUpdateValue) return;
    setProducts(prev => prev.map(p => {
      if (selectedIds.has(p.id)) {
        if (bulkUpdateType === 'stock') return { ...p, stock: Number(bulkUpdateValue) };
        if (bulkUpdateType === 'category') return { ...p, category: bulkUpdateValue };
      }
      return p;
    }));
    setIsBulkUpdateModalOpen(false);
    setSelectedIds(new Set());
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? (productForm as Product) : p));
    } else {
      const p: Product = { ...productForm as Product, id: Date.now().toString(), sku: productForm.sku || `SKU-${Date.now()}`, image: productForm.image || `https://picsum.photos/seed/${Date.now()}/400/400` };
      setProducts(prev => [p, ...prev]);
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:gap-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Master Catalog</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Inventory management node Accra-Gateway.</p>
        </div>
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2">
             {selectedIds.size > 0 && (
               <button onClick={() => setIsBulkUpdateModalOpen(true)} className="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-xl font-bold text-sm border border-amber-100 dark:border-amber-800 animate-in zoom-in"><RefreshCw size={18} className="inline mr-2" /> Bulk Edit</button>
             )}
            <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"><Plus size={18} /> New Product</button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search product name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-10">
                  <button onClick={handleSelectAll} className="p-1">{selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-300" />}</button>
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Detail</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MSRP</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(product.id)} className={`p-1 transition-colors ${selectedIds.has(product.id) ? 'text-indigo-600' : 'text-slate-300 dark:text-slate-700'}`}>{selectedIds.has(product.id) ? <CheckSquare size={18} /> : <Square size={18} />}</button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <img src={product.image} className="w-12 h-12 rounded-xl object-cover bg-slate-50 border dark:border-slate-700" alt="" />
                      <div className="min-w-0"><p className="font-bold text-slate-800 dark:text-slate-100 truncate">{product.name}</p><p className="text-[10px] font-black text-slate-400 uppercase">{product.sku}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400">GH₵{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 font-black dark:text-white">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${getStockStatus(product.stock).color.includes('rose') ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                       {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => setProducts(p => p.filter(it => it.id !== product.id))} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isBulkUpdateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-white/10 animate-bounce-in">
            <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><RefreshCw size={20} /></div><h3 className="font-black text-slate-800 dark:text-white">Bulk Stock Update</h3></div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Field</label>
                  <select value={bulkUpdateType || ''} onChange={e => setBulkUpdateType(e.target.value as any)} className="form-input-custom">
                    <option value="">Select Option...</option>
                    <option value="stock">Absolute Stock Level</option>
                    <option value="category">Department Category</option>
                  </select>
               </div>
               {bulkUpdateType && (
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</label>
                   {bulkUpdateType === 'category' ? (
                     <select value={bulkUpdateValue} onChange={e => setBulkUpdateValue(e.target.value)} className="form-input-custom">{CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}</select>
                   ) : (
                     <input type="number" value={bulkUpdateValue} onChange={e => setBulkUpdateValue(e.target.value)} className="form-input-custom" placeholder="New stock count..." />
                   )}
                 </div>
               )}
               <div className="flex gap-3">
                 <button onClick={() => setIsBulkUpdateModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-xs uppercase">Cancel</button>
                 <button onClick={handleBulkUpdate} disabled={!bulkUpdateValue} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl disabled:opacity-30">Apply to {selectedIds.size}</button>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input-custom { width: 100%; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 1rem; padding: 0.875rem 1.25rem; font-size: 0.875rem; font-weight: 700; color: #020617; outline: none; transition: all 0.2s ease; }
        .dark .form-input-custom { background: #1e293b; border-color: #334155; color: #ffffff; }
        .form-input-custom:focus { border-color: #6366f1; background: #fff; }
        .dark .form-input-custom:focus { background: #0f172a; }
      `}</style>
    </div>
  );
};