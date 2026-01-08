
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Search, Phone, MapPin, Instagram, 
  Facebook, Twitter, ChevronRight, Star, Heart, 
  ShieldCheck, Truck, Clock, ArrowRight, MessageCircle,
  Zap, ShoppingCart, X, Minus, Plus, Eye, ArrowUpRight,
  TrendingUp, Award, CheckCircle2, Menu, Sparkles, Gift, Flame
} from 'lucide-react';
import { Product, SystemSettings } from '../types';
import { CATEGORIES } from '../constants';

interface StorefrontViewProps {
  products: Product[];
  settings: SystemSettings;
}

interface WebsiteCartItem extends Product {
  quantity: number;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({ products, settings }) => {
  const { 
    businessName, adminWhatsApp, storefrontHeroTitle, storefrontHeroSubtitle, 
    storefrontPromoBanner, storefrontLocation, storefrontInstagram, 
    storefrontFacebook, storefrontTwitter, storefrontPromoTitle, 
    storefrontPromoHighlight, storefrontPromoDesc 
  } = settings;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [webCart, setWebCart] = useState<WebsiteCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  const addToWebCart = (product: Product) => {
    setWebCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromWebCart = (productId: string) => {
    setWebCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateWebQty = (productId: string, delta: number) => {
    setWebCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const cartTotal = webCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = webCart.reduce((sum, item) => sum + item.quantity, 0);

  const cleanWhatsAppNumber = adminWhatsApp.startsWith('0') 
    ? `233${adminWhatsApp.substring(1)}` 
    : adminWhatsApp.replace(/\+/g, '');

  const generateWhatsAppMessage = () => {
    const itemsList = webCart.map(item => `${item.quantity}x ${item.name} (GH₵${(item.price * item.quantity).toFixed(2)})`).join('%0A');
    const message = `Hello ${businessName}! I'd like to place an order:%0A%0A${itemsList}%0A%0A*Total: GH₵${cartTotal.toFixed(2)}*%0A%0APlease confirm availability.`;
    return `https://wa.me/${cleanWhatsAppNumber}?text=${message}`;
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">
      
      {/* Top Announcement Banner */}
      {showAnnouncement && storefrontPromoBanner && (
        <div className="bg-indigo-600 text-white py-2 px-4 relative z-[110] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] text-center">
               🚀 <span className="hidden sm:inline">Limited Time:</span> {storefrontPromoBanner} ⚡
            </p>
            <button 
              onClick={() => setShowAnnouncement(false)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors absolute right-4"
              aria-label="Close announcement"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Navigation */}
      <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${(showAnnouncement && storefrontPromoBanner) ? 'top-[32px]' : 'top-0'} ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl py-3 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <span className={`font-black uppercase tracking-tighter text-xl transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                {businessName}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-10">
              {['Catalog', 'Featured', 'About', 'Contact'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-colors relative group">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 md:gap-6">
               <button 
                 onClick={() => setIsCartOpen(true)}
                 className="relative p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                 aria-label="View shopping bag"
               >
                 <ShoppingCart size={20} />
                 {cartCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-in zoom-in">
                     {cartCount}
                   </span>
                 )}
               </button>
               <button className="lg:hidden p-2.5 text-slate-600 dark:text-slate-300" aria-label="Open menu">
                 <Menu size={24} />
               </button>
               <a 
                 href={`https://wa.me/${cleanWhatsAppNumber}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="hidden sm:flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all hover:brightness-110"
               >
                 <MessageCircle size={16} />
                 Live Support
               </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 md:pt-56 md:pb-40 overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-left duration-700">
              <Zap size={14} className="fill-indigo-600 dark:fill-indigo-400" /> Premium Quality • Node Accra-01
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter animate-in slide-in-from-left duration-1000 delay-100">
              {storefrontHeroTitle.split(' ').slice(0, -2).join(' ')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400">{storefrontHeroTitle.split(' ').slice(-2).join(' ')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0 animate-in slide-in-from-left duration-1000 delay-200">
              {storefrontHeroSubtitle}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
               <a href="#catalog" className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all flex items-center gap-3 hover:bg-indigo-700">
                 Explore Catalog <ArrowRight size={20} />
               </a>
               <button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xl shadow-black/5">
                 Watch Film
               </button>
            </div>
          </div>

          <div className="flex-1 relative animate-in zoom-in duration-1000 delay-300">
             <div className="relative z-10 w-full max-w-md mx-auto aspect-square rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.2)] dark:shadow-indigo-500/10 group">
                <img src={products[0]?.image || "https://picsum.photos/seed/shop/800/800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10">
                   <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Editor's Choice</p>
                   <h2 className="text-white text-3xl font-black tracking-tight">{products[0]?.name || "Artisan Goods"}</h2>
                </div>
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-[2rem] -rotate-12 blur-3xl opacity-20 animate-pulse"></div>
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-10 animate-pulse delay-700"></div>
          </div>
        </div>

        <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </header>

      {/* Features Bar */}
      <div className="bg-white dark:bg-slate-950 py-8 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                <Truck size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">Fast Logistics</p>
                <p className="text-[11px] text-slate-500 font-medium">Same-day regional delivery</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">Certified Origin</p>
                <p className="text-[11px] text-slate-500 font-medium">100% genuine quality goods</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                <Star size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">Top Rated</p>
                <p className="text-[11px] text-slate-500 font-medium">Over 5,000 happy customers</p>
              </div>
           </div>
        </div>
      </div>

      {/* Mid-Page Promotion */}
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 overflow-hidden relative group border border-white/5 shadow-2xl">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 transition-all group-hover:opacity-40"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl space-y-4 text-center md:text-left">
                   <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Flame size={12} className="fill-rose-500" /> Hot Offer
                   </div>
                   <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{storefrontPromoTitle} <br/> <span className="text-indigo-400">{storefrontPromoHighlight}</span></h2>
                   <p className="text-slate-400 font-medium leading-relaxed">{storefrontPromoDesc}</p>
                </div>
                <div className="shrink-0">
                   <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'})} className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-3">
                      Shop Now <ArrowRight size={18} />
                   </button>
                </div>
             </div>
             
             <div className="absolute bottom-[-20px] left-8 opacity-[0.05] group-hover:translate-y-[-20px] transition-transform duration-1000">
                <Gift size={120} className="text-white" />
             </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors" id="featured">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Trend Report</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Featured Arrivals</h2>
            </div>
            <button className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
              View All Trends <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {featuredProducts.map(p => (
              <div key={p.id} className="group relative">
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                   <img src={p.image} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt={p.name} />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                   <div className="absolute top-4 right-4">
                      <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-lg active:scale-90">
                        <Heart size={18} />
                      </button>
                   </div>
                   <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <button 
                        onClick={() => setQuickViewProduct(p)}
                        className="bg-white text-slate-950 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95"
                      >
                        <Eye size={14} /> Quick Look
                      </button>
                      <button 
                        onClick={() => addToWebCart(p)}
                        className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90"
                      >
                        <Plus size={20} />
                      </button>
                   </div>
                </div>
                <div className="mt-6 px-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{p.category}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black">4.9</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{p.name}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">GH₵{p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors" id="catalog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Full Collection</h2>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-80">
               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
               <input 
                 type="text" 
                 placeholder="Search Essentials..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] py-4 pl-12 pr-6 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
               />
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map(p => (
              <div key={p.id} className="group flex flex-col bg-white dark:bg-slate-800 rounded-[3rem] p-4 border border-white dark:border-slate-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500">
                 <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-700 mb-6">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                    <button 
                      onClick={() => addToWebCart(p)}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-indigo-600 hover:text-white active:scale-90"
                    >
                      <Plus size={24} />
                    </button>
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute top-4 left-4 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg">Limited Stock</span>
                    )}
                 </div>
                 <div className="px-4 pb-4 space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{p.brand}</p>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex-1">{p.name}</h3>
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                       <p className="text-xl font-black text-indigo-600">GH₵{p.price.toFixed(2)}</p>
                       <button 
                         onClick={() => setQuickViewProduct(p)}
                         className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                       >
                         <Eye size={18} />
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-40 text-center opacity-30">
               <ShoppingBag size={80} className="mx-auto mb-8 text-slate-300" />
               <p className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">No Results Found</p>
               <p className="text-sm font-medium mt-3">Try different keywords or browse all categories.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Truck size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white">Regional Delivery</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">Fast, reliable logistics across the Accra node and surrounding regions.</p>
              </div>
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white">Secure Payments</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">Verified transactions through our regional point-of-sale infrastructure.</p>
              </div>
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Award size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white">Certified Goods</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">100% genuine products sourced from authorized regional distributors.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Improved Footer with Social Proof */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-5 space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <ShoppingBag size={24} />
                </div>
                <span className="font-black text-3xl uppercase tracking-tighter">{businessName}</span>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
                Pioneering the next generation of retail in Ghana. Intelligence driven, customer centered, regionally focused.
              </p>
              
              {/* Refined Social Links Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80">Follow Our Journey</p>
                <div className="flex gap-5">
                  {storefrontInstagram && (
                    <a 
                      href={`https://instagram.com/${storefrontInstagram.replace('@','')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer border border-white/10 group"
                      aria-label="Instagram Profile"
                    >
                      <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {storefrontFacebook && (
                    <a 
                      href={storefrontFacebook.startsWith('http') ? storefrontFacebook : `https://${storefrontFacebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer border border-white/10 group"
                      aria-label="Facebook Page"
                    >
                      <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {storefrontTwitter && (
                    <a 
                      href={`https://twitter.com/${storefrontTwitter.replace('@','')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer border border-white/10 group"
                      aria-label="Twitter Profile"
                    >
                      <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Navigation</h4>
               <ul className="space-y-5">
                 {['Our Mission', 'Catalog', 'Logistics Hub', 'Sustainability', 'Regional Nodes'].map(link => (
                   <li key={link}><a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">{link}</a></li>
                 ))}
               </ul>
            </div>

            <div className="md:col-span-4 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Hub Contact</h4>
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-indigo-600 mt-1 shrink-0" size={22} />
                    <p className="text-sm font-bold text-slate-400 leading-relaxed">
                      {storefrontLocation}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-600">
                      <Phone size={18} />
                    </div>
                    <p className="text-sm font-black text-slate-300">+{adminWhatsApp}</p>
                  </div>
               </div>
               <div className="pt-8">
                  <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] relative group">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Operating Hours</p>
                     <p className="text-xl font-black text-white uppercase mb-1">Mon - Sat</p>
                     <p className="text-xs font-bold text-slate-400 uppercase">08:00 AM - 08:00 PM GMT</p>
                     <CheckCircle2 className="absolute top-8 right-8 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" size={32} />
                  </div>
               </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">© 2024 {businessName.toUpperCase()} RETAIL INFRASTRUCTURE</p>
            </div>
            <div className="flex items-center gap-4">
               <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/10">v8.4 Stable</span>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Node Sync Active</p>
               </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mb-40"></div>
      </footer>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                       <ShoppingCart size={24} />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">Shopping Cart</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{webCart.length} Unique Items</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsCartOpen(false)}
                   className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100"
                 >
                    <X size={28} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                 {webCart.length > 0 ? webCart.map(item => (
                   <div key={item.id} className="flex gap-6 p-4 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                         <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                         <div>
                            <h4 className="font-black text-slate-900 dark:text-white truncate text-base">{item.name}</h4>
                            <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">{item.brand}</p>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                               <button onClick={() => updateWebQty(item.id, -1)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Minus size={16} /></button>
                               <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">{item.quantity}</span>
                               <button onClick={() => updateWebQty(item.id, 1)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Plus size={16} /></button>
                            </div>
                            <button onClick={() => removeFromWebCart(item.id)} className="text-[10px] font-black uppercase text-rose-500 hover:underline">Remove</button>
                         </div>
                      </div>
                      <div className="text-right flex flex-col justify-between py-1">
                         <p className="font-black text-slate-900 dark:text-white text-lg">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                   </div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                      <ShoppingBag size={80} className="text-slate-300 mb-6" />
                      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Cart Is Empty</p>
                      <p className="text-sm font-medium mt-2">Discover premium goods in our collection.</p>
                   </div>
                 )}
              </div>

              <div className="p-8 bg-slate-900 text-white space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <span>Bag Subtotal</span>
                       <span>GH₵{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <span>Estimated Tax</span>
                       <span>Included</span>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Estimated Total</p>
                          <p className="text-3xl font-black">GH₵{cartTotal.toFixed(2)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                            <Truck size={14} /> Regional Delivery Active
                          </p>
                       </div>
                    </div>
                 </div>
                 <a 
                   href={generateWhatsAppMessage()}
                   target="_blank"
                   rel="noopener noreferrer"
                   className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${webCart.length > 0 ? 'bg-[#25D366] text-white hover:brightness-110 shadow-green-500/20' : 'bg-white/10 text-white/20 pointer-events-none'}`}
                 >
                    <MessageCircle size={20} /> Checkout via WhatsApp
                 </a>
                 <p className="text-[9px] text-center text-slate-500 font-medium leading-relaxed italic">
                   "Final availability and delivery costs will be confirmed by our hub team via secure messaging link."
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row relative animate-in zoom-in-95 duration-500 border border-white/10">
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-8 right-8 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all active:scale-90"
              >
                <X size={24} />
              </button>

              <div className="flex-1 relative aspect-square md:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-800">
                 <img src={quickViewProduct.image} className="w-full h-full object-cover" alt="" />
                 <div className="absolute bottom-8 left-8">
                    <div className="bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3 text-white">
                       <Award size={18} className="text-amber-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Authentic Quality</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-8 md:p-16 flex flex-col justify-center space-y-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">{quickViewProduct.category}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {quickViewProduct.sku}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{quickViewProduct.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                       Sourced from {quickViewProduct.brand}, this premium {quickViewProduct.category.toLowerCase()} represents the pinnacle of regional production and artisan craftsmanship.
                    </p>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-end gap-2">
                       <p className="text-5xl font-black text-indigo-600 tracking-tighter">GH₵{quickViewProduct.price.toFixed(2)}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase mb-2">VAT Inclusive</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => { addToWebCart(quickViewProduct); setQuickViewProduct(null); }}
                         className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-indigo-700"
                       >
                         <ShoppingCart size={18} /> Add To Bag
                       </button>
                       <a 
                         href={`https://wa.me/${cleanWhatsAppNumber}?text=I'm interested in ${quickViewProduct.name} (GH₵${quickViewProduct.price.toFixed(2)})`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-3"
                       >
                         <MessageCircle size={18} /> Buy Now
                       </a>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${quickViewProduct.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{quickViewProduct.stock > 0 ? 'In Stock at Hub' : 'Out of Stock'}</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</p>
                       <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Accra Region, GH</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        html {
          scroll-behavior: smooth;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
