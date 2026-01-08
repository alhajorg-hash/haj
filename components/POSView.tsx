import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Minus, Trash2, CheckCircle2, ShoppingBag, CreditCard, 
  Banknote, QrCode, Scan, X, Search, Tag, UserPlus, ChevronUp, Wallet, Phone, User as UserCircle, Printer, WifiOff, Calendar, Percent, Check, ShoppingCart, AlertCircle, ShieldCheck, ChevronDown, Info, Eye, List, ArrowRight, Camera
} from 'lucide-react';
import { Product, CartItem, Transaction, Customer } from '../types';
import { CATEGORIES } from '../constants';

interface POSViewProps {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: (t: Transaction) => void;
  clearCart: () => void;
  onQuickAddCustomer?: (name: string, phone: string) => void;
  businessName: string;
}

export const POSView: React.FC<POSViewProps> = ({ 
  products, customers, cart, addToCart, updateQuantity, removeFromCart, onCheckout, clearCart, onQuickAddCustomer, businessName 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [showTopPreview, setShowTopPreview] = useState(false);
  const [showFloatingPreview, setShowFloatingPreview] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({ name: '', phone: '' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Advanced Manual Discount State
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  const [creditDueDate, setCreditDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Handle Scanner Activation
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      if (isScannerOpen) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
          console.error("Camera access denied", e);
          alert("Could not access camera for scanning.");
          setIsScannerOpen(false);
        }
      }
    };
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [isScannerOpen]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId), 
  [customers, selectedCustomerId]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = isTaxExempt ? 0 : subtotal * 0.08;
  
  const calculatedDiscountAmount = useMemo(() => {
    if (discountType === 'percent') return (subtotal * discountValue) / 100;
    return discountValue;
  }, [subtotal, discountValue, discountType]);

  const total = Math.max(0, subtotal + tax - calculatedDiscountAmount);

  const handleCheckout = (method: Transaction['paymentMethod']) => {
    if (cart.length === 0) return;
    if (method === 'Credit' && !selectedCustomerId) {
      alert("BNPL requires a registered customer.");
      return;
    }

    const transaction: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      timestamp: Date.now(),
      dueDate: method === 'Credit' ? new Date(creditDueDate).getTime() : undefined,
      items: [...cart],
      total,
      tax,
      discount: calculatedDiscountAmount,
      paymentMethod: method,
      customerId: selectedCustomerId || undefined,
      isSettlement: false
    };

    setLastTransaction(transaction);
    onCheckout(transaction);
    setShowSuccess(true);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setDiscountValue(0);
    setIsEditingDiscount(false);
    setSelectedCustomerId(null);
    setIsCartMobileOpen(false);
    setLastTransaction(null);
    setIsTaxExempt(false);
    clearCart();
  };

  const handlePrintReceipt = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    if (showSuccess && lastTransaction) handlePrintReceipt();
  }, [showSuccess, lastTransaction]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomer.name || !quickCustomer.phone) return;
    if (onQuickAddCustomer) onQuickAddCustomer(quickCustomer.name, quickCustomer.phone);
    setIsQuickAddOpen(false);
    setQuickCustomer({ name: '', phone: '' });
  };

  const CartItemsList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
            <ShoppingCart size={32} />
          </div>
          <p className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-widest">Cart is empty</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-2 font-medium">Select items from the catalog.</p>
        </div>
      ) : (
        cart.map(item => (
          <div key={item.id} className="flex gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-700 border dark:border-slate-600">
              <img src={item.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-indigo-600"><Minus size={10} /></button>
                  <span className="w-6 text-center text-[10px] font-black text-slate-800 dark:text-slate-200">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-indigo-600"><Plus size={10} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800 dark:text-slate-100">GH₵{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const CheckoutFooter = () => (
    <div className="p-5 md:p-6 bg-slate-900 dark:bg-slate-950 text-white rounded-t-3xl shadow-2xl transition-colors duration-300">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-400"><span>Subtotal</span><span>GH₵{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between items-center text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className={isTaxExempt ? 'text-orange-400 flex items-center gap-1' : 'text-slate-400'}>Tax {isTaxExempt ? '(Exempt)' : '(8%)'}</span>
            <button onClick={() => setIsTaxExempt(!isTaxExempt)} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase transition-all ${isTaxExempt ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500 hover:text-slate-300'}`}>{isTaxExempt ? 'Enable Tax' : 'Exempt'}</button>
          </div>
          <span className={isTaxExempt ? 'text-orange-400' : 'text-slate-400'}>GH₵{tax.toFixed(2)}</span>
        </div>
        <div 
          className="flex justify-between items-center text-xs font-medium cursor-pointer"
          onClick={() => setIsEditingDiscount(!isEditingDiscount)}
        >
          <span className="flex items-center gap-1 text-indigo-400"><Tag size={12} /> Discount</span>
          <span className="text-emerald-400 font-bold">-GH₵{calculatedDiscountAmount.toFixed(2)}</span>
        </div>
        {isEditingDiscount && (
          <div className="mt-2 animate-in slide-in-from-top-1 p-2 bg-white/5 rounded-xl border border-white/10 space-y-2">
             <div className="flex items-center gap-1">
               <button onClick={() => setDiscountType('fixed')} className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase ${discountType === 'fixed' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>Fixed (GHS)</button>
               <button onClick={() => setDiscountType('percent')} className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase ${discountType === 'percent' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>Percent (%)</button>
             </div>
             <input type="number" value={discountValue || ''} onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-white/10 border-none rounded-lg py-2 px-3 text-xs font-bold text-white outline-none" placeholder="Enter discount..." />
          </div>
        )}
        <div className="flex justify-between items-end pt-2 border-t border-white/5">
          <span className="text-indigo-400 font-bold uppercase text-[9px]">Total Due</span>
          <span className="text-2xl font-black">GH₵{total.toFixed(2)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => handleCheckout('Card')} disabled={cart.length === 0} className="flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><CreditCard size={18} /><span className="text-[10px] font-black uppercase">Card</span></button>
        <button onClick={() => handleCheckout('Cash')} disabled={cart.length === 0} className="flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Banknote size={18} /><span className="text-[10px] font-black uppercase">Cash</span></button>
      </div>
      <div className="space-y-2">
        <button onClick={() => handleCheckout('Digital')} disabled={cart.length === 0} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all active:scale-95 shadow-lg shadow-indigo-900/40"><QrCode size={16} /> Pay Digital</button>
        {selectedCustomerId && (
          <button onClick={() => handleCheckout('Credit')} disabled={cart.length === 0} className="w-full py-2.5 bg-rose-600 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-lg shadow-rose-900/40"><Wallet size={14} /> Buy Now, Pay Later</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full relative overflow-hidden flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 relative z-[100] shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 cursor-pointer relative" onMouseEnter={() => setShowTopPreview(true)} onMouseLeave={() => setShowTopPreview(false)}>
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600"><ShoppingCart size={14} /></div>
                <div className="flex flex-col"><span className="text-[9px] font-black text-indigo-600 uppercase mb-0.5">Session Cart</span><span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">{cart.length} items</span></div>
             </div>
             <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
             <div className="flex flex-col"><p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Subtotal</p><p className="text-xs font-black text-slate-800 dark:text-slate-100">GH₵{subtotal.toFixed(2)}</p></div>
          </div>
          <div className="flex items-center gap-3">
             {selectedCustomer ? (
               <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[8px] font-black">{selectedCustomer.name[0]}</div>
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase">{selectedCustomer.name}</span>
                  <button onClick={() => setSelectedCustomerId(null)} className="text-indigo-300 hover:text-indigo-600"><X size={12} /></button>
               </div>
             ) : (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                 <AlertCircle size={12} className="text-slate-300" /><span className="text-[9px] font-black text-slate-400 uppercase">Guest Session</span>
               </div>
             )}
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-2 md:gap-4 shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Scan code or search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-950 dark:text-white outline-none shadow-sm transition-all" />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="bg-indigo-600 text-white px-6 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95"><Scan size={20} /></button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}>{cat}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-24 md:pb-6">
              {filteredProducts.map(product => {
                const cartQty = getCartQuantity(product.id);
                return (
                  <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`group text-left bg-white dark:bg-slate-900 rounded-3xl p-2.5 border transition-all duration-300 relative ${cartQty > 0 ? 'border-indigo-600' : 'border-slate-100 dark:border-slate-800'} ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-800 border border-transparent group-hover:border-indigo-100 transition-colors">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      {cartQty > 0 && <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] flex flex-col items-center justify-center"><Check className="text-indigo-600" size={32} strokeWidth={4} /><p className="text-[10px] font-black text-indigo-600 uppercase mt-2">{cartQty} in Cart</p></div>}
                    </div>
                    <div className="px-1">
                      <h3 className="font-black text-[11px] md:text-sm text-slate-800 dark:text-slate-100 line-clamp-1 uppercase mb-1">{product.name}</h3>
                      <p className="text-xs md:text-base font-black text-indigo-600">GH₵{product.price.toFixed(2)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-[45] animate-in slide-in-from-bottom-8 flex items-center gap-3">
             <button onClick={() => setShowFloatingPreview(!showFloatingPreview)} className={`p-5 rounded-full shadow-2xl transition-all ${showFloatingPreview ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white'}`}><Eye size={24} /></button>
             <button onClick={() => setIsCartMobileOpen(true)} className="bg-slate-900 dark:bg-indigo-600 text-white pl-8 pr-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-8 group active:scale-[0.98] transition-all relative">
                <div className="flex items-center gap-4">
                  <ShoppingCart size={24} />
                  <div className="text-left"><p className="text-[9px] font-black uppercase opacity-60">Total Bill</p><p className="text-lg font-black tracking-tighter">GH₵{total.toFixed(2)}</p></div>
                </div>
                <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform opacity-50" />
             </button>
          </div>
        )}
      </div>

      <div className="hidden md:flex w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-10 transition-all duration-500">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50"><ShoppingBag size={24} /></div>
            <div><h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Transaction</h2><p className="text-[10px] font-bold text-slate-400 uppercase">Node 01</p></div>
          </div>
          <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full text-xs font-black">{cart.length} items</span>
        </div>
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex gap-2">
            <select value={selectedCustomerId || ''} onChange={(e) => setSelectedCustomerId(e.target.value || null)} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-bold text-slate-950 dark:text-white outline-none">
              <option value="">Guest Session</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setIsQuickAddOpen(true)} className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-100"><UserPlus size={20} /></button>
          </div>
        </div>
        <CartItemsList />
        <CheckoutFooter />
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3"><Camera className="text-indigo-600" /><h3 className="font-black text-slate-800 dark:text-white">Barcode Scanner</h3></div>
                <button onClick={() => setIsScannerOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
             </div>
             <div className="p-8 aspect-video bg-black flex items-center justify-center relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-indigo-500/50 m-12 rounded-2xl animate-pulse"></div>
             </div>
             <div className="p-8 text-center"><p className="text-xs font-bold text-slate-400 uppercase">Align barcode within frame for automatic detection.</p></div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-bounce-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20"><UserPlus size={24} /></div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">New Profile</h3>
              </div>
              <button onClick={() => setIsQuickAddOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleQuickAddSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input required type="text" value={quickCustomer.name} onChange={e => setQuickCustomer(p => ({...p, name: e.target.value}))} placeholder="e.g. Kwame Mensah" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-950 dark:text-white outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Link</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input required type="tel" value={quickCustomer.phone} onChange={e => setQuickCustomer(p => ({...p, phone: e.target.value}))} placeholder="+233..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-950 dark:text-white outline-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsQuickAddOpen(false)} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && lastTransaction && (
        <>
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-lg px-6 print:hidden">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center animate-bounce-in w-full max-w-sm text-center border border-white/10">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
                <Check size={40} strokeWidth={4} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Verified & Logged</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-8">Disbursement completed successfully</p>
              <div className="w-full space-y-4">
                <button onClick={handlePrintReceipt} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"><Printer size={20} /> Print Receipt</button>
                <button onClick={closeSuccess} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 active:scale-95">Next Operation</button>
              </div>
            </div>
          </div>

          <div id="receipt-printable-area" className="hidden print:block">
            <div className="receipt-container">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold uppercase">{businessName}</h1>
                <p className="text-sm">Regional Intelligence Hub</p>
                <div className="border-b border-black border-dashed my-3"></div>
              </div>
              <div className="mb-6 text-[12px] leading-tight">
                <p><span className="font-bold">TX REF:</span> {lastTransaction.id}</p>
                <p><span className="font-bold">TIMESTAMP:</span> {new Date(lastTransaction.timestamp).toLocaleString()}</p>
                <p><span className="font-bold">METHOD:</span> {lastTransaction.paymentMethod}</p>
              </div>
              <div className="border-b border-black border-dashed mb-3"></div>
              <div className="space-y-2 text-[12px]">
                {lastTransaction.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-6">
                    <span className="flex-1">{item.quantity}x {item.name}</span>
                    <span className="font-mono">{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-b border-black border-dashed my-3"></div>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span>Sub-Total</span><span className="font-mono">GH₵{(lastTransaction.total - lastTransaction.tax).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>VAT (8.0%)</span><span className="font-mono">GH₵{lastTransaction.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[16px] mt-2 pt-2 border-t border-black border-double">
                  <span>GRAND TOTAL</span>
                  <span className="font-mono">GH₵{lastTransaction.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-center mt-10">
                <p className="font-bold text-[14px]">Thank You for Trading!</p>
                <div className="mt-6 flex flex-col items-center gap-2">
                   <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${lastTransaction.id}&scale=1&rotate=N&includetext=false`} alt="Security Code" className="h-12 w-auto" />
                   <p className="text-[9px] opacity-70 font-mono tracking-[0.3em]">{lastTransaction.id}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};