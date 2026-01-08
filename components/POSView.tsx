
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Minus, Trash2, CheckCircle2, ShoppingBag, CreditCard, 
  Banknote, QrCode, Scan, X, Search, Tag, UserPlus, ChevronUp, Wallet, Phone, User as UserCircle, Printer, WifiOff, Calendar, Percent, Check, ShoppingCart, AlertCircle, ShieldCheck, ChevronDown, Info, Eye, List, ArrowRight
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
  
  const productGridRef = useRef<HTMLDivElement>(null);
  
  // Advanced Manual Discount State
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [creditDueDate, setCreditDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);
  
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
    if (discountType === 'percent') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [subtotal, discountValue, discountType]);

  const total = Math.max(0, subtotal + tax - calculatedDiscountAmount);

  const handleCheckout = (method: Transaction['paymentMethod']) => {
    if (cart.length === 0) return;
    
    if (method === 'Credit' && !selectedCustomerId) {
      alert("BNPL requires a registered customer. Please select or register a customer first.");
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
    if (showSuccess && lastTransaction) {
      handlePrintReceipt();
    }
  }, [showSuccess, lastTransaction]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomer.name || !quickCustomer.phone) return;
    if (onQuickAddCustomer) {
      onQuickAddCustomer(quickCustomer.name, quickCustomer.phone);
    }
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
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-2 font-medium">Select items from the catalog to begin processing a sale.</p>
        </div>
      ) : (
        cart.map(item => (
          <div key={item.id} className="flex gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group shadow-sm">
            <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
              <img src={item.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"><Minus size={10} /></button>
                  <span className="w-6 text-center text-[10px] font-black text-slate-800 dark:text-slate-200">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"><Plus size={10} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400"><Trash2 size={14} /></button>
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
    <div className="p-5 md:p-6 bg-slate-900 dark:bg-slate-950 text-white rounded-t-3xl md:rounded-t-[2.5rem] shadow-2xl transition-colors duration-300">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-400">
          <span>Subtotal</span>
          <span>GH₵{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className={isTaxExempt ? 'text-orange-400 flex items-center gap-1' : 'text-slate-400'}>
              Tax {isTaxExempt ? '(Exempted)' : '(8%)'}
              {isTaxExempt && <Info size={10} />}
            </span>
            <button 
              onClick={() => setIsTaxExempt(!isTaxExempt)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase transition-all ${isTaxExempt ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500 hover:text-slate-300'}`}
            >
              {isTaxExempt ? 'Enable Tax' : 'Exempt'}
            </button>
          </div>
          <span className={isTaxExempt ? 'text-orange-400' : 'text-slate-400'}>GH₵{tax.toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
           <div 
             className="flex justify-between items-center text-xs font-medium cursor-pointer group"
             onClick={() => setIsEditingDiscount(!isEditingDiscount)}
           >
              <span className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <Tag size={12} /> Discount
              </span>
              <div className="flex items-center gap-2">
                 <span className="text-emerald-400 font-bold">-GH₵{calculatedDiscountAmount.toFixed(2)}</span>
                 <button className="text-[10px] text-white/30 group-hover:text-white/60 font-black uppercase">Edit</button>
              </div>
           </div>
           
           {isEditingDiscount && (
             <div className="mt-2 animate-in slide-in-from-top-1 duration-200 p-2 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${discountType === 'fixed' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    Fixed (GHS)
                  </button>
                  <button 
                    onClick={() => setDiscountType('percent')}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${discountType === 'percent' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    Percent (%)
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    {discountType === 'fixed' ? 'GH₵' : '%'}
                  </div>
                  <input 
                    type="number"
                    step="0.01"
                    autoFocus
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white/10 border-none rounded-lg py-2 pl-10 pr-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder={discountType === 'fixed' ? "0.00" : "0"}
                    onBlur={() => { if(discountValue >= 0) setIsEditingDiscount(false); }}
                    onKeyDown={(e) => { if(e.key === 'Enter') setIsEditingDiscount(false); }}
                  />
                </div>
             </div>
           )}
        </div>

        <div className="flex justify-between items-end pt-2">
          <span className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">Total Due Now</span>
          <span className="text-2xl font-black">GH₵{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => handleCheckout('Card')} disabled={cart.length === 0} className="flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-20 transition-all"><CreditCard size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Card</span></button>
        <button onClick={() => handleCheckout('Cash')} disabled={cart.length === 0} className="flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-20 transition-all"><Banknote size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Cash</span></button>
      </div>

      <div className="space-y-2">
        {selectedCustomerId ? (
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">BNPL Terms</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full">
                <Calendar size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">Payment Due Date</span>
              </div>
            </div>
            <input 
              type="date"
              value={creditDueDate}
              onChange={(e) => setCreditDueDate(e.target.value)}
              className="w-full bg-slate-800 dark:bg-slate-900 border-none rounded-lg py-2 px-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button 
              onClick={() => handleCheckout('Credit')} 
              disabled={cart.length === 0} 
              className="w-full py-2.5 bg-rose-600 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase transition-all active:scale-95 disabled:opacity-20 shadow-lg shadow-rose-900/40"
            >
              <Wallet size={14} /> Buy Now, Pay Later
            </button>
          </div>
        ) : (
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
             <AlertCircle size={14} className="text-slate-500" />
             <p className="text-[9px] font-bold text-slate-400 leading-tight uppercase">Select customer for Credit/BNPL</p>
          </div>
        )}
        <button onClick={() => handleCheckout('Digital')} disabled={cart.length === 0} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all active:scale-95 disabled:opacity-20 shadow-lg shadow-indigo-900/40"><QrCode size={16} /> Pay Digital</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full relative overflow-hidden flex-col md:flex-row bg-white dark:bg-slate-950">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Modernized Session Summary Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 relative z-[100] shadow-sm">
          <div className="flex items-center gap-4">
             <div 
               className="flex items-center gap-2 group cursor-pointer relative"
               onMouseEnter={() => setShowTopPreview(true)}
               onMouseLeave={() => setShowTopPreview(false)}
             >
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <ShoppingCart size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Session Cart</span>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter leading-none">{cart.length} unique items</span>
                </div>
                
                {/* Visual Glassmorphism Popover - Shifted Right to not cover input */}
                {showTopPreview && cart.length > 0 && (
                  <div className="absolute top-full left-0 md:left-4 mt-3 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 z-[200] p-5 animate-in zoom-in-95 slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-slate-800 pb-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Itemized View</p>
                       <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black">ACTIVE</span>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                       {cart.map(item => (
                         <div key={item.id} className="flex items-center gap-3 group/item">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 shrink-0">
                               <img src={item.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">{item.quantity} x GH₵{item.price.toFixed(2)}</p>
                            </div>
                            <p className="text-[10px] font-black text-slate-900 dark:text-white shrink-0">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                         </div>
                       ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Current Load</p>
                       <p className="text-sm font-black text-indigo-600">GH₵{subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                )}
             </div>
             <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
             <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Running Total</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">GH₵{subtotal.toFixed(2)}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             {selectedCustomer ? (
               <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-all hover:scale-[1.02]">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[8px] font-black">
                     {selectedCustomer.name[0]}
                  </div>
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">{selectedCustomer.name}</span>
                  <button onClick={() => setSelectedCustomerId(null)} className="text-indigo-300 hover:text-indigo-600 transition-colors"><X size={12} /></button>
               </div>
             ) : (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                 <AlertCircle size={12} className="text-slate-300" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Guest Session</span>
               </div>
             )}
             <button 
                onClick={() => setIsCartMobileOpen(true)}
                className="md:hidden flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 transition-transform active:scale-95"
             >
               View Cart <ChevronDown size={12} />
             </button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-2 md:gap-4 shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Scan code or search inventory..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 md:py-4 pl-11 pr-4 text-xs md:text-sm text-slate-950 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-sm transition-all duration-300"
              />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="bg-indigo-600 text-white px-6 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/10 flex items-center justify-center transition-all hover:bg-indigo-700 active:scale-95"><Scan size={20} /></button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div ref={productGridRef} className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-24 md:pb-6">
              {filteredProducts.map(product => {
                const cartQty = getCartQuantity(product.id);
                const isSelected = cartQty > 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`group text-left bg-white dark:bg-slate-900 rounded-3xl p-2.5 md:p-3.5 border transition-all duration-300 relative ${isSelected ? 'border-indigo-600 dark:border-indigo-500 shadow-[0_20px_40px_rgba(79,70,229,0.1)] ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 bg-indigo-50/5 dark:bg-indigo-900/5 scale-[0.98]' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1'} ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-800 border border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] animate-in fade-in duration-300">
                          <div className="absolute top-3 right-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in-75 duration-300 ring-4 ring-white dark:ring-slate-900 z-20">
                            <Check size={18} strokeWidth={4} />
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 py-1.5 bg-indigo-600/90 backdrop-blur-md text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg z-20 text-center animate-bounce-in">
                            {cartQty} Selected
                          </div>
                        </div>
                      )}

                      {product.stock <= 5 && product.stock > 0 && <span className="absolute top-3 left-3 bg-orange-500 text-white text-[8px] font-black px-2.5 py-1 rounded-lg uppercase shadow-lg z-10 animate-pulse">Low Stock</span>}
                    </div>
                    <div className="px-1">
                      <h3 className="font-black text-[11px] md:text-sm text-slate-800 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Standard Rate</span>
                           <span className="text-xs md:text-base font-black text-slate-950 dark:text-white">GH₵{product.price.toFixed(2)}</span>
                        </div>
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg'}`}>
                          <Plus size={18} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Quick Navigation Summary (Dynamic Action Bar) */}
        {cart.length > 0 && (
          <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-[45] animate-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
             {/* Floating Preview Panel (The Dynamic Drawer) */}
             {showFloatingPreview && (
               <div className="mb-6 w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 p-6 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ring-1 ring-white/20">
                  <div className="flex items-center justify-between mb-5">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Live Cart Edit</p>
                     </div>
                     <button 
                       onClick={() => setShowFloatingPreview(false)} 
                       className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                     >
                       <X size={16} />
                     </button>
                  </div>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                     {cart.map(item => (
                       <div key={item.id} className="flex items-center gap-4 bg-slate-50/50 dark:bg-white/5 p-3 rounded-2xl group/item relative overflow-hidden border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                             <img src={item.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="min-w-0 flex-1">
                             <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-tighter">{item.name}</p>
                             <p className="text-[10px] font-black text-indigo-600 font-black">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          
                          {/* Mini Actions in Preview */}
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-100 dark:border-slate-700 shadow-sm">
                             <button 
                               onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                               className="p-1 hover:text-indigo-600 transition-colors text-slate-950 dark:text-white"
                             >
                               <Minus size={12} />
                             </button>
                             <span className="w-5 text-center text-[10px] font-black text-slate-950 dark:text-white">{item.quantity}</span>
                             <button 
                               onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                               className="p-1 hover:text-indigo-600 transition-colors text-slate-950 dark:text-white"
                             >
                               <Plus size={12} />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sub-Total</p>
                           <p className="text-xl font-black text-slate-950 dark:text-white">GH₵{subtotal.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => { if(confirm("Discard all items?")) { clearCart(); setShowFloatingPreview(false); } }}
                          className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                        >
                          Empty Cart
                        </button>
                     </div>
                     <button 
                        onClick={() => {
                          setShowFloatingPreview(false);
                          if (window.innerWidth < 768) setIsCartMobileOpen(true);
                          else document.getElementById('desktop-cart-sidebar')?.classList.add('ring-8', 'ring-indigo-600/10');
                        }}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all hover:bg-indigo-700"
                     >
                       Full Breakdown <ArrowRight size={14} />
                     </button>
                  </div>
               </div>
             )}

             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFloatingPreview(!showFloatingPreview)}
                  className={`p-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all active:scale-90 ${showFloatingPreview ? 'bg-indigo-600 text-white rotate-180' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-indigo-50'}`}
                  title="Quick View Items"
                >
                  {showFloatingPreview ? <ChevronDown size={24} /> : <Eye size={24} />}
                </button>

                <button 
                  onClick={() => {
                    if (window.innerWidth < 768) setIsCartMobileOpen(true);
                    else {
                        document.getElementById('desktop-cart-sidebar')?.classList.add('ring-4', 'ring-indigo-600/20');
                        setTimeout(() => document.getElementById('desktop-cart-sidebar')?.classList.remove('ring-4', 'ring-indigo-600/20'), 1000);
                    }
                  }}
                  className="bg-slate-900 dark:bg-indigo-600 text-white pl-8 pr-10 py-5 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-8 group active:scale-[0.98] transition-all hover:shadow-indigo-500/20 relative border border-white/5"
                >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <ShoppingBag size={24} />
                        </div>
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 group-hover:scale-125 transition-transform animate-bounce-in">{cart.length}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.2em] leading-none mb-1.5">Proceed to Checkout</p>
                        <p className="text-lg font-black tracking-tighter leading-none flex items-baseline gap-1">
                          <span className="text-xs font-bold text-indigo-400">GH₵</span>
                          {total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform opacity-50" />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Desktop Cart Sidebar (Enhanced visual impact) */}
      <div id="desktop-cart-sidebar" className="hidden md:flex w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-10 transition-all duration-500 relative">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Transaction</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Node 01</p>
            </div>
          </div>
          <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-black">{cart.length} items</span>
        </div>
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex gap-2">
            <select value={selectedCustomerId || ''} onChange={(e) => setSelectedCustomerId(e.target.value || null)} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-bold text-slate-950 dark:text-white outline-none appearance-none transition-colors">
              <option value="">Guest Session</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setIsQuickAddOpen(true)} className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all" title="Register New Customer"><UserPlus size={20} /></button>
          </div>
          {selectedCustomer && (
            <div className={`p-3 rounded-2xl border flex items-center justify-between animate-in fade-in duration-500 ${selectedCustomer.creditBalance > 0 ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-900/50 dark:text-rose-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-900/50 dark:text-emerald-400'}`}>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <Wallet size={14} />
                 </div>
                 <div>
                   <span className="text-[8px] font-black uppercase block leading-none opacity-60">Balance Due</span>
                   <span className="font-black text-xs">GH₵{selectedCustomer.creditBalance.toFixed(2)}</span>
                 </div>
               </div>
               {cart.length > 0 && (
                 <div className="text-right border-l border-current/10 pl-3">
                    <span className="text-[8px] font-black uppercase block leading-none opacity-60">Session Total</span>
                    <span className="font-black text-xs">GH₵{(selectedCustomer.creditBalance + total).toFixed(2)}</span>
                 </div>
               )}
            </div>
          )}
        </div>
        <CartItemsList />
        <CheckoutFooter />
      </div>

      {/* Cart Mobile Modal */}
      {isCartMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[3rem] flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-8 duration-500 shadow-[0_-20px_60px_rgba(0,0,0,0.3)] border-t border-white/10">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button onClick={() => setIsCartMobileOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={24} /></button>
              <h2 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] text-xs">Checkout Summary</h2>
              <button onClick={() => { if(confirm("Clear this entire order?")) { clearCart(); setIsCartMobileOpen(false); } }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 dark:border-rose-500/20 px-3 py-1 rounded-full">Reset</button>
            </div>
            
            <div className="p-5 bg-slate-50 dark:bg-slate-800/30 flex flex-col gap-3 shrink-0">
              <div className="flex gap-2">
                <select value={selectedCustomerId || ''} onChange={(e) => setSelectedCustomerId(e.target.value || null)} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-950 dark:text-white outline-none">
                  <option value="">Guest (Standard)</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => setIsQuickAddOpen(true)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm"><UserPlus size={24} /></button>
              </div>
            </div>

            <CartItemsList />
            <CheckoutFooter />
          </div>
        </div>
      )}

      {/* MODALS inherit the visual polish and fixed text contrast */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-white/10 animate-bounce-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  <UserPlus size={24} />
                </div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">New Profile</h3>
              </div>
              <button onClick={() => setIsQuickAddOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleQuickAddSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                  <input required type="text" value={quickCustomer.name} onChange={e => setQuickCustomer(p => ({...p, name: e.target.value}))} placeholder="e.g. Kwame Mensah" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Link</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                  <input required type="tel" value={quickCustomer.phone} onChange={e => setQuickCustomer(p => ({...p, phone: e.target.value}))} placeholder="+233..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsQuickAddOpen(false)} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <>
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-lg px-6 print:hidden">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center animate-bounce-in w-full max-w-sm text-center border border-white/10">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 animate-pulse-slow">
                <Check size={40} strokeWidth={4} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Verified & Logged</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-8">Disbursement completed successfully</p>
              
              <div className="w-full space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-2">
                   <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                     <Printer size={14} /> Thermal Printer Ready
                   </p>
                </div>
                <button onClick={handlePrintReceipt} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20 active:scale-95"><Printer size={20} /> Print Duplicate</button>
                <button onClick={closeSuccess} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Next Operation</button>
              </div>
            </div>
          </div>

          {lastTransaction && (
            <div id="receipt-printable-area" className="hidden print:block printable-area">
              <div className="receipt-container">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase tracking-tight">{businessName}</h1>
                  <p className="text-sm">Regional Intelligence Hub</p>
                  <p className="text-[10px]">Accra Gateway Node</p>
                  <div className="border-b border-black border-dashed my-3"></div>
                </div>
                
                <div className="mb-6 text-[12px] leading-tight">
                  <p><span className="font-bold">TX REF:</span> {lastTransaction.id}</p>
                  <p><span className="font-bold">TIMESTAMP:</span> {new Date(lastTransaction.timestamp).toLocaleString()}</p>
                  <p><span className="font-bold">TAX STATUS:</span> {isTaxExempt ? 'EXEMPTED' : 'VAT INCLUSIVE (8%)'}</p>
                  <p><span className="font-bold">METHOD:</span> {lastTransaction.paymentMethod === 'Credit' ? 'CREDIT / BNPL AGREEMENT' : lastTransaction.paymentMethod}</p>
                  {lastTransaction.dueDate && (
                    <div className="mt-3 p-2 border border-black border-double text-center">
                       <p className="font-bold uppercase text-[10px]">PAYMENT DUE BY:</p>
                       <p className="text-sm font-bold">{new Date(lastTransaction.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
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
                  <div className="flex justify-between"><span>Sub-Total</span><span className="font-mono">GH₵{(lastTransaction.total - lastTransaction.tax + lastTransaction.discount).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>VAT (8.0%)</span><span className="font-mono">GH₵{lastTransaction.tax.toFixed(2)}</span></div>
                  {lastTransaction.discount > 0 && (
                    <div className="flex justify-between"><span>Discount Applied</span><span className="font-mono">-GH₵{lastTransaction.discount.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-[16px] mt-2 pt-2 border-t border-black border-double">
                    <span>GRAND TOTAL</span>
                    <span className="font-mono">GH₵{lastTransaction.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center mt-10">
                  <p className="font-bold text-[14px]">Thank You for Trading!</p>
                  <div className="mt-6 flex flex-col items-center gap-2">
                     <img 
                        src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${lastTransaction.id}&scale=1&rotate=N&includetext=false`}
                        alt="Security Code"
                        className="h-12 w-auto"
                      />
                     <p className="text-[9px] opacity-70 font-mono tracking-[0.3em]">{lastTransaction.id}</p>
                  </div>
                  <p className="text-[10px] mt-6 italic">Visit geminipos.com for e-records</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
