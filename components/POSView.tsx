import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Minus, Trash2, ShoppingBag, CreditCard, 
  Banknote, QrCode, Scan, X, Search, Tag, UserPlus, 
  ChevronUp, Wallet, Phone, CircleUser, Printer, 
  ShoppingCart, AlertCircle, Check, Camera, Pause, Play
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
  const [heldCart, setHeldCart] = useState<CartItem[] | null>(null);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [quickCustomer, setQuickCustomer] = useState({ name: '', phone: '' });

  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(() => { alert("Camera failed."); setIsScannerOpen(false); });
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [isScannerOpen]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = isTaxExempt ? 0 : subtotal * 0.15; // 15% Standard Simulation
  const total = Math.max(0, subtotal + tax - discountValue);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    setHeldCart([...cart]);
    clearCart();
  };

  const handleResumeCart = () => {
    if (!heldCart) return;
    heldCart.forEach(item => {
      for (let i = 0; i < item.quantity; i++) addToCart(item);
    });
    setHeldCart(null);
  };

  const handleCheckout = (method: Transaction['paymentMethod']) => {
    if (cart.length === 0) return;
    const tx: Transaction = {
      id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: Date.now(),
      items: [...cart],
      total,
      tax,
      discount: discountValue,
      paymentMethod: method,
      customerId: selectedCustomerId || undefined,
      isSettlement: false
    };
    onCheckout(tx);
    setLastTransaction(tx);
    setShowSuccess(true);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    clearCart();
    setSelectedCustomerId(null);
    setDiscountValue(0);
  };

  return (
    <div className="flex h-full flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-2 md:gap-4 shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Scan or search catalog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-950 dark:text-white outline-none shadow-sm" />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="bg-indigo-600 text-white px-6 rounded-2xl shadow-xl hover:bg-indigo-700"><Scan size={20} /></button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-800'}`}>{cat}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-20">
              {filteredProducts.map(product => {
                const cartQty = cart.find(i => i.id === product.id)?.quantity || 0;
                return (
                  <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`group text-left bg-white dark:bg-slate-900 rounded-3xl p-2 border transition-all relative ${cartQty > 0 ? 'border-indigo-600 ring-2 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800'} ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-800">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {cartQty > 0 && <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] flex items-center justify-center"><Check className="text-indigo-600" size={32} strokeWidth={4} /></div>}
                    </div>
                    <div className="px-2 pb-2">
                      <h3 className="font-bold text-[11px] text-slate-800 dark:text-slate-100 line-clamp-1 uppercase">{product.name}</h3>
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">GH₵{product.price.toFixed(2)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl relative z-10">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><ShoppingBag size={20} /></div>
             <h2 className="font-black text-sm dark:text-white uppercase tracking-widest">Cart Summary</h2>
           </div>
           {heldCart ? (
             <button onClick={handleResumeCart} className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase"><Play size={12} /> Resume Held</button>
           ) : (
             <button onClick={handleHoldCart} disabled={cart.length === 0} className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase disabled:opacity-0"><Pause size={12} /> Hold Cart</button>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
              <ShoppingCart size={48} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Cart Empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-white" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[11px] text-slate-800 dark:text-white truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus size={10} /></button>
                      <span className="w-6 text-center text-[10px] font-black dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus size={10} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="font-black text-xs text-slate-800 dark:text-white">GH₵{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-900 dark:bg-black text-white space-y-4">
          <div className="space-y-1.5 text-xs font-medium text-slate-400">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-white">GH₵{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
              <span>Tax (15%)</span>
              <button onClick={() => setIsTaxExempt(!isTaxExempt)} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${isTaxExempt ? 'bg-amber-600 text-white' : 'bg-white/10 text-slate-500'}`}>{isTaxExempt ? 'Exempted' : 'Exempt'}</button>
              <span className="text-white">GH₵{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-white/5">
              <span className="text-indigo-400 text-[10px] font-black uppercase">Total Due</span>
              <span className="text-2xl font-black text-white">GH₵{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => handleCheckout('Cash')} disabled={cart.length === 0} className="py-3 bg-white/10 rounded-xl font-black text-[10px] uppercase hover:bg-white/20"><Banknote size={16} className="mx-auto mb-1" /> Cash</button>
             <button onClick={() => handleCheckout('Card')} disabled={cart.length === 0} className="py-3 bg-white/10 rounded-xl font-black text-[10px] uppercase hover:bg-white/20"><CreditCard size={16} className="mx-auto mb-1" /> Card</button>
          </div>
          <button onClick={() => handleCheckout('Digital')} disabled={cart.length === 0} className="w-full py-4 bg-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 active:scale-95 flex items-center justify-center gap-2">
            <QrCode size={18} /> Process Checkout
          </button>
        </div>
      </div>

      {/* Modals */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
           <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden relative border border-white/10">
              <button onClick={() => setIsScannerOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white z-10"><X size={32} /></button>
              <div className="p-8 aspect-video relative flex items-center justify-center">
                 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-3xl" />
                 <div className="absolute inset-0 border-2 border-indigo-500/50 m-12 rounded-2xl animate-pulse"></div>
              </div>
              <div className="p-8 text-center"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning for Barcode Data...</p></div>
           </div>
        </div>
      )}

      {showSuccess && lastTransaction && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center animate-bounce-in w-full max-w-sm text-center border border-white/10">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
                <Check size={40} strokeWidth={4} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Verified</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase mt-1 mb-8">Ref: {lastTransaction.id}</p>
              <div className="w-full space-y-4">
                <button onClick={() => window.print()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"><Printer size={18} /> Print Receipt</button>
                <button onClick={closeSuccess} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase">Next Sale</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};