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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkUpdateType, setBulkUpdateType] = useState<'stock' | 'category' | null>(null);
  const [bulkUpdateValue, setBulkUpdateValue] = useState<string>('');

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: CATEGORIES[1],
    stock: 0,
    price: 0,
    costPrice: 0,
    brand: '',
    image: '',
    sku: ''
  });

  const isReadOnly = userRole === 'Cashier';

  useEffect(() => {
    if (editingProduct) {
      setProductForm(editingProduct);
    } else {
      setProductForm({
        name: '',
        category: CATEGORIES[1],
        stock: 0,
        price: 0,
        costPrice: 0,
        brand: '',
        image: '',
        sku: ''
      });
    }
  }, [editingProduct]);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', dot: 'bg-rose-500', icon: <XCircle size={12} /> };
    if (stock <= 5) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20', dot: 'bg-orange-500', icon: <AlertCircle size={12} /> };
    return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', dot: 'bg-emerald-500', icon: <CheckCircle size={12} /> };
  };

  const statusCounts = useMemo(() => {
    return {
      all: products.length,
      inStock: products.filter(p => p.stock > 5).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
      outOfStock: products.filter(p => p.stock <= 0).length,
    };
  }, [products]);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    const status = getStockStatus(p.stock).label;
    return matchesSearch && status === statusFilter;
  });

  const valuation = useMemo(() => {
    return products.reduce((acc, p) => {
      acc.cost += (p.costPrice || 0) * p.stock;
      acc.retail += p.price * p.stock;
      return acc;
    }, { cost: 0, retail: 0 });
  }, [products]);

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (isReadOnly) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected items?`)) {
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    }
  };

  const applyBulkUpdate = () => {
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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportInventoryToExcel(products);
      setIsExporting(false);
    }, 800);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!productForm.name || !productForm.price || !productForm.sku) return;
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? (productForm as Product) : p));
    } else {
      const productToAdd: Product = {
        id: Date.now().toString(),
        name: productForm.name!,
        category: productForm.category || 'General',
        brand: productForm.brand || 'Local Brand',
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice) || 0,
        stock: Number(productForm.stock) || 0,
        sku: productForm.sku.toUpperCase(),
        image: productForm.image || `https://picsum.photos/seed/${productForm.sku}/400/400`,
      };
      setProducts(prev => [productToAdd, ...prev]);
    }
    setIsProductModalOpen(false);
  };

  const handleAiImageGen = async () => {
    if (!productForm.name || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const prompt = `Professional studio photo of ${productForm.name} for a retail catalog, clean lighting, high resolution`;
      const url = await generateProductImage(prompt);
      if (url) setProductForm(prev => ({ ...prev, image: url }));
    } catch (e) {
      alert("AI generation failed. Please check connection.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col gap-6 md:gap-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Inventory & Products</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor stock levels and regional catalogs.</p>
        </div>
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 md:gap-3">
             {selectedIds.size > 0 && (
              <button onClick={() => setIsBulkUpdateModalOpen(true)} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl font-bold text-sm border border-indigo-100 dark:border-indigo-800 shadow-sm animate-in zoom-in"><RefreshCw size={18} /> Bulk Update</button>
            )}
            <button onClick={handleExport} disabled={isExporting} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"><Download size={18} /> Export</button>
            <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-indigo-700 shadow-lg transition-all"><Plus size={18} /> Add Product</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <SummaryCard label="Total Cost" value={isReadOnly ? '---' : `GH₵${valuation.cost.toLocaleString()}`} icon={<Wallet size={24} />} bg="bg-slate-900 dark:bg-slate-800 text-white" />
        <SummaryCard label="Retail Value" value={`GH₵${valuation.retail.toLocaleString()}`} icon={<TrendingUp size={24} />} bg="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800" />
        <SummaryCard label="Gross Profit" value={isReadOnly ? '---' : `GH₵${(valuation.retail - valuation.cost).toLocaleString()}`} icon={<Banknote size={24} />} bg="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatusPill active={statusFilter === 'All'} onClick={() => setStatusFilter('All')} label="Total" count={statusCounts.all} icon={<Package size={18} />} color="indigo" />
        <StatusPill active={statusFilter === 'In Stock'} onClick={() => setStatusFilter('In Stock')} label="Healthy" count={statusCounts.inStock} icon={<CheckCircle size={18} />} color="emerald" />
        <StatusPill active={statusFilter === 'Low Stock'} onClick={() => setStatusFilter('Low Stock')} label="Low" count={statusCounts.lowStock} icon={<AlertCircle size={18} />} color="orange" />
        <StatusPill active={statusFilter === 'Out of Stock'} onClick={() => setStatusFilter('Out of Stock')} label="Out" count={statusCounts.outOfStock} icon={<XCircle size={18} />} color="rose" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-950 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 w-10">
                  {!isReadOnly && <button onClick={handleSelectAll} className="p-1 text-slate-400">{selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}</button>}
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Selling Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                {!isReadOnly && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(product => {
                const status = getStockStatus(product.stock);
                const isSelected = selectedIds.has(product.id);
                return (
                  <tr key={product.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${isSelected ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      {!isReadOnly && <button onClick={() => toggleSelect(product.id)} className={`p-1 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 dark:text-slate-700'}`}>{isSelected ? <CheckSquare size={18} /> : <Square size={18} />}</button>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border dark:border-slate-700"><img src={product.image} className="w-full h-full object-cover" alt="" /></div>
                        <div className="min-w-0"><p className="font-bold text-slate-800 dark:text-slate-100 truncate">{product.name}</p><p className="text-[10px] font-black text-slate-400 uppercase">{product.sku}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400">GH₵{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4"><div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</div></td>
                    <td className="px-6 py-4 font-black dark:text-white">{product.stock}</td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"><Edit3 size={18} /></button>
                          <button onClick={() => setProducts(p => p.filter(it => it.id !== product.id))} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {isBulkUpdateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-white/10 animate-bounce-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><RefreshCw size={20} /></div>
              <h3 className="font-black text-slate-800 dark:text-white">Bulk Update</h3>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Field</label>
                  <select value={bulkUpdateType || ''} onChange={e => setBulkUpdateType(e.target.value as any)} className="form-input-custom">
                    <option value="">Select Field...</option>
                    <option value="stock">Stock Level</option>
                    <option value="category">Category</option>
                  </select>
               </div>
               {bulkUpdateType && (
                 <div className="space-y-2 animate-in slide-in-from-top-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Value</label>
                   {bulkUpdateType === 'category' ? (
                     <select value={bulkUpdateValue} onChange={e => setBulkUpdateValue(e.target.value)} className="form-input-custom">
                        {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   ) : (
                     <input type="number" value={bulkUpdateValue} onChange={e => setBulkUpdateValue(e.target.value)} className="form-input-custom" placeholder="Enter new stock..." />
                   )}
                 </div>
               )}
               <div className="flex gap-3">
                 <button onClick={() => setIsBulkUpdateModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-xs uppercase">Cancel</button>
                 <button onClick={applyBulkUpdate} disabled={!bulkUpdateValue} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl disabled:opacity-30">Apply to {selectedIds.size}</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit/Add Modal */}
      {isProductModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-transparent dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center"><Package size={20} /></div>
                <h3 className="font-black text-slate-800 dark:text-white">{editingProduct ? 'Edit Item' : 'New Catalog Entry'}</h3>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Item Name" icon={<Tag size={14} />}>
                  <input required value={productForm.name} onChange={e => setProductForm(p => ({...p, name: e.target.value}))} className="form-input-custom" placeholder="e.g. Arabica Roast" />
                </FormGroup>
                <FormGroup label="SKU / Barcode" icon={<Barcode size={14} />}>
                  <input required value={productForm.sku} onChange={e => setProductForm(p => ({...p, sku: e.target.value}))} className="form-input-custom uppercase" placeholder="BEV-001" />
                </FormGroup>
                <FormGroup label="Cost Price (GH₵)" icon={<Wallet size={14} />}>
                  <input required type="number" step="0.01" value={productForm.costPrice} onChange={e => setProductForm(p => ({...p, costPrice: Number(e.target.value)}))} className="form-input-custom" />
                </FormGroup>
                <FormGroup label="Selling Price (GH₵)" icon={<ShoppingCart size={14} />}>
                  <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(p => ({...p, price: Number(e.target.value)}))} className="form-input-custom" />
                </FormGroup>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Camera size={12} /> Product Image</label>
                <div className="flex gap-2">
                  <input value={productForm.image} onChange={e => setProductForm(prev => ({ ...prev, image: e.target.value }))} className="form-input-custom flex-1" placeholder="Image URL..." />
                  <button type="button" onClick={() => uploadInputRef.current?.click()} className="px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl font-black text-[10px] uppercase border border-indigo-100 dark:border-indigo-800"><Upload size={14} /></button>
                  <button 
                    type="button" 
                    onClick={handleAiImageGen} 
                    disabled={isGeneratingImage || !productForm.name}
                    className="px-6 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/20 disabled:opacity-30 flex items-center gap-2"
                  >
                    {isGeneratingImage ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />} 
                    AI Gen
                  </button>
                </div>
                <input type="file" ref={uploadInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                {productForm.image && (
                   <div className="mt-4 w-32 h-32 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md animate-in fade-in">
                      <img src={productForm.image} className="w-full h-full object-cover" alt="Preview" />
                   </div>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Confirm & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-input-custom {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          padding: 0.875rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #020617;
          outline: none;
          transition: all 0.2s ease;
        }
        .dark .form-input-custom {
          background: #1e293b;
          border-color: #334155;
          color: #ffffff;
        }
        .form-input-custom:focus {
          border-color: #6366f1;
          background: #fff;
        }
        .dark .form-input-custom:focus {
          background: #0f172a;
        }
      `}</style>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, bg }: { label: string, value: string, icon: any, bg: string }) => (
  <div className={`${bg} p-6 rounded-3xl shadow-sm transition-all hover:shadow-md flex items-center gap-5`}>
    <div className="w-12 h-12 flex items-center justify-center opacity-60">{icon}</div>
    <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p><p className="text-2xl font-black">{value}</p></div>
  </div>
);

const StatusPill = ({ active, onClick, label, count, icon, color }: any) => (
  <button onClick={onClick} className={`p-4 rounded-2xl border transition-all text-left ${active ? `bg-${color}-600 border-${color}-600 text-white shadow-lg` : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}>
    <div className="flex items-center justify-between mb-1"><span className={`opacity-70 ${active ? 'text-white' : ''}`}>{icon}</span><span className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</span></div>
    <p className="text-xl font-black">{count}</p>
  </button>
);

const FormGroup = ({ label, icon, children }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">{icon} {label}</label>
    {children}
  </div>
);