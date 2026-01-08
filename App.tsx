import React, { useState, useEffect } from 'react';
import { 
  Product, Customer, CartItem, Transaction, ShopTask, ViewState, SystemSettings, User, Expense, Purchase, AppReturn, PayrollRecord, UserRole
} from './types';
import { INITIAL_PRODUCTS } from './constants';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { BoardView } from './components/BoardView';
import { CustomersView } from './components/CustomersView';
import { WarehouseView } from './components/WarehouseView';
import { ExpensesView } from './components/ExpensesView';
import { PurchasesView } from './components/PurchasesView';
import { UsersView } from './components/UsersView';
import { ReturnsView } from './components/ReturnsView';
import { PnLView } from './components/PnLView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { ImageGeneratorView } from './components/ImageGeneratorView';
import { CreditLedgerView } from './components/CreditLedgerView';
import { PayrollView } from './components/PayrollView';
import { StorefrontView } from './components/StorefrontView';
import { LoginView } from './components/LoginView';
import { 
  LayoutDashboard, ShoppingCart, Package, BarChart3, BrainCircuit, 
  ClipboardList, Users as UsersIcon, Warehouse as WarehouseIcon, 
  Receipt, Truck, Undo2, Scale, CircleUser, Banknote,
  Settings, Wand2, LogOut, Menu, X, MoreHorizontal, Wallet, Wifi, WifiOff, AlertCircle,
  Sun, Moon, Zap, Globe
} from 'lucide-react';

const MOCK_USERS: User[] = [
  { id: 'u-1', name: 'Alhaja S. Admin', email: 'alhajabusafian@gmail.com', role: 'Admin', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Alhaja+Admin&background=6366f1&color=fff', password: '12345678' },
  { id: 'u-2', name: 'Sarah Mensah', email: 'sarah.m@geminipos.com', role: 'Cashier', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=sarah', password: 'cashier123' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'Kwame Mensah', phone: '+233 24 123 4567', email: 'kwame@ghana.com', totalSpent: 450, creditBalance: 120, lastVisit: Date.now() - 86400000 },
  { id: 'c-2', name: 'Ama Serwaa', phone: '+233 50 987 6543', email: 'ama@ghana.com', totalSpent: 1200, creditBalance: 0, lastVisit: Date.now() - 172800000 }
];

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  CUSTOMERS: 'pos_customers',
  TRANSACTIONS: 'pos_transactions',
  TASKS: 'pos_tasks',
  EXPENSES: 'pos_expenses',
  PURCHASES: 'pos_purchases',
  USERS: 'pos_users',
  RETURNS: 'pos_returns',
  SETTINGS: 'pos_settings',
  THEME: 'pos_theme',
  PAYROLL: 'pos_payroll'
};

const safeParse = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => safeParse(STORAGE_KEYS.THEME, false));

  // Initialize state from LocalStorage or Defaults
  const [products, setProducts] = useState<Product[]>(() => safeParse(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(() => safeParse(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse(STORAGE_KEYS.TRANSACTIONS, []));
  const [tasks, setTasks] = useState<ShopTask[]>(() => safeParse(STORAGE_KEYS.TASKS, []));
  const [expenses, setExpenses] = useState<Expense[]>(() => safeParse(STORAGE_KEYS.EXPENSES, []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => safeParse(STORAGE_KEYS.PURCHASES, []));
  const [users, setUsers] = useState<User[]>(() => safeParse(STORAGE_KEYS.USERS, MOCK_USERS));
  const [returns, setReturns] = useState<AppReturn[]>(() => safeParse(STORAGE_KEYS.RETURNS, []));
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => safeParse(STORAGE_KEYS.PAYROLL, []));

  const [settings, setSettings] = useState<SystemSettings>(() => safeParse(STORAGE_KEYS.SETTINGS, {
    businessName: 'GeminiPOS Pro',
    adminWhatsApp: '0248074898',
    managerAccessToUsers: true,
    managerAccessToInventory: true,
    managerAccessToReports: true,
    managerAccessToPnL: true,
    managerAccessToExpenses: true,
    managerAccessToPurchases: true,
    managerAccessToCustomers: true,
    managerAccessToWarehouse: true,
    managerAccessToAiAssistant: true,
    managerAccessToCreativeStudio: true,
    managerAccessToOpsBoard: true,
    managerAccessToReturns: true,
    cashierAccessToInventory: true,
    allowTransactionDeletion: false,
    lockSystemCurrency: true,
    baseCurrency: 'GHS (GH₵)',
    primaryLanguage: 'English (Ghana)',
    storefrontHeroTitle: 'Shop The Future Now.',
    storefrontHeroSubtitle: 'Experience a new standard of retail. Curated essentials and artisan luxury, delivered directly from our regional distribution hub.',
    storefrontPromoBanner: 'Free Shipping on all orders over GH₵500 this weekend!',
    storefrontLocation: 'Independence Ave, Gateway Tower 01, Accra Central Business District, Ghana',
    storefrontInstagram: '',
    storefrontFacebook: '',
    storefrontTwitter: '',
    storefrontPromoTitle: 'Seasonal Clearance',
    storefrontPromoHighlight: 'Up to 40% Off.',
    storefrontPromoDesc: 'Refresh your inventory with our biggest sale of the year. High-turnover stock at liquidation prices for a limited period.'
  }));

  // Sync document title with business name
  useEffect(() => {
    document.title = `${settings.businessName} | Retail Intelligence`;
  }, [settings.businessName]);

  // Persistance Effects
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns)); }, [returns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payroll)); }, [payroll]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDarkMode));
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); setShowOfflineWarning(false); };
    const handleOffline = () => { 
      setIsOnline(false); 
      setShowOfflineWarning(true);
      setTimeout(() => setShowOfflineWarning(false), 3000);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const clearCart = () => setCart([]);

  const saveTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    
    // Decrease stock for physical item sales (not settlements)
    if (!transaction.isSettlement) {
      setProducts(prev => prev.map(p => {
        const itemInCart = transaction.items.find(i => i.id === p.id);
        return itemInCart ? { ...p, stock: p.stock - itemInCart.quantity } : p;
      }));
    }

    if (transaction.customerId) {
      setCustomers(prev => prev.map(c => c.id === transaction.customerId ? {
        ...c,
        // LTV Correction: Only increase totalSpent if it's a SALE, not a debt payment
        totalSpent: transaction.isSettlement ? c.totalSpent : c.totalSpent + transaction.total,
        // Debt Tracking: Increase for Credit, Decrease for Settlement
        creditBalance: transaction.paymentMethod === 'Credit' 
          ? c.creditBalance + transaction.total 
          : transaction.isSettlement 
            ? Math.max(0, c.creditBalance - transaction.total)
            : c.creditBalance,
        lastVisit: Date.now()
      } : c));
    }
  };

  const settleCustomerDebt = (customerId: string, amount: number, method: 'Cash' | 'Digital') => {
    const settlementTx: Transaction = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      timestamp: Date.now(),
      items: [], 
      total: amount,
      tax: 0,
      discount: 0,
      paymentMethod: method,
      customerId: customerId,
      isSettlement: true 
    };

    saveTransaction(settlementTx); // Reuse unified logic
  };

  const handleProcessReturn = (newReturn: AppReturn) => {
    setReturns(prev => [newReturn, ...prev]);
    setProducts(prev => prev.map(p => {
      const returnedItem = newReturn.items.find(i => i.productId === p.id);
      if (returnedItem) {
        const stockChange = newReturn.type === 'Sales' ? returnedItem.quantity : -returnedItem.quantity;
        return { ...p, stock: p.stock + stockChange };
      }
      return p;
    }));

    if (newReturn.type === 'Sales') {
      const transaction = transactions.find(t => t.id === newReturn.referenceId);
      if (transaction?.customerId) {
        setCustomers(prev => prev.map(c => c.id === transaction.customerId ? {
          ...c,
          creditBalance: transaction.paymentMethod === 'Credit' ? Math.max(0, c.creditBalance - newReturn.amount) : c.creditBalance,
          totalSpent: Math.max(0, c.totalSpent - newReturn.amount)
        } : c));
      }
    }
  };

  // RBAC Permission Check
  const hasAccess = (targetView: ViewState): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'Admin') return true; // Full access
    
    const cashierRestricted: ViewState[] = [
      'reports', 'ai-assistant', 'warehouse', 'expenses', 
      'purchases', 'users', 'pnl', 'payroll', 'settings', 'image-generator'
    ];
    
    if (role === 'Cashier') {
      return !cashierRestricted.includes(targetView);
    }
    
    if (role === 'Manager') {
      // Managers can't access Payroll or high-level global Settings usually
      return targetView !== 'payroll' && targetView !== 'settings';
    }
    
    return false;
  };

  const renderView = () => {
    // Structural guard for direct view state modification
    if (!hasAccess(view) && view !== 'dashboard' && view !== 'profile') {
      return <DashboardView transactions={transactions} products={products} tasks={tasks} setView={setView} customers={customers} businessName={settings.businessName} />;
    }

    switch (view) {
      case 'dashboard': return <DashboardView transactions={transactions} products={products} tasks={tasks} setView={setView} customers={customers} businessName={settings.businessName} />;
      case 'pos': return <POSView products={products} customers={customers} cart={cart} addToCart={addToCart} updateQuantity={(id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))} removeFromCart={id => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={saveTransaction} clearCart={clearCart} onQuickAddCustomer={(name, phone) => setCustomers(prev => [...prev, { id: `c-${Date.now()}`, name, phone, email: '', totalSpent: 0, creditBalance: 0, lastVisit: Date.now() }])} businessName={settings.businessName} />;
      case 'board': return <BoardView tasks={tasks} setTasks={setTasks} products={products} transactions={transactions} />;
      case 'inventory': return <InventoryView products={products} setProducts={setProducts} userRole={currentUser?.role} />;
      case 'customers': return <CustomersView customers={customers} setCustomers={setCustomers} transactions={transactions} onSettleDebt={settleCustomerDebt} />;
      case 'credit-ledger': return <CreditLedgerView customers={customers} setCustomers={setCustomers} transactions={transactions} onSettleDebt={settleCustomerDebt} businessName={settings.businessName} />;
      case 'reports': return <ReportsView transactions={transactions} businessName={settings.businessName} />;
      case 'ai-assistant': return <AIAssistantView products={products} transactions={transactions} isOnline={isOnline} />;
      case 'warehouse': return <WarehouseView />;
      case 'expenses': return <ExpensesView expenses={expenses} onAddExpense={e => setExpenses(prev => [e, ...prev])} onUpdateExpense={updated => setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))} onDeleteExpense={id => setExpenses(prev => prev.filter(e => e.id !== id))} />;
      case 'purchases': return <PurchasesView purchases={purchases} onAddPurchase={p => setPurchases(prev => [p, ...prev])} />;
      case 'users': return <UsersView users={users} setUsers={setUsers} settings={settings} onSaveSettings={setSettings} isAdmin={currentUser?.role === 'Admin'} />;
      case 'returns': return <ReturnsView returns={returns} transactions={transactions} purchases={purchases} onProcessReturn={handleProcessReturn} />;
      case 'pnl': return <PnLView transactions={transactions} expenses={expenses} purchases={purchases} isOnline={isOnline} />;
      case 'payroll': return <PayrollView users={users} payroll={payroll} setPayroll={setPayroll} onAddExpense={e => setExpenses(prev => [e, ...prev])} businessName={settings.businessName} />;
      case 'profile': return currentUser ? <ProfileView user={currentUser} onUpdate={setCurrentUser} /> : null;
      case 'settings': return <SettingsView initialSettings={settings} onSave={setSettings} />;
      case 'image-generator': return <ImageGeneratorView isOnline={isOnline} />;
      case 'storefront': return <StorefrontView products={products} settings={settings} />;
      default: return <DashboardView transactions={transactions} products={products} tasks={tasks} setView={setView} customers={customers} businessName={settings.businessName} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} businessName={settings.businessName} adminWhatsApp={settings.adminWhatsApp} mockUsers={users} setUsers={setUsers} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Terminal', icon: ShoppingCart },
    { id: 'storefront', label: 'Customer Site', icon: Globe },
    { id: 'credit-ledger', label: 'BNPL Ledger', icon: Wallet },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'payroll', label: 'Staff Payroll', icon: Banknote },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: BrainCircuit },
    { id: 'board', label: 'Ops Board', icon: ClipboardList },
    { id: 'customers', label: 'Customers', icon: UsersIcon },
    { id: 'warehouse', label: 'Warehouse', icon: WarehouseIcon },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'purchases', label: 'Purchases', icon: Truck },
    { id: 'users', label: 'Staff', icon: CircleUser },
    { id: 'returns', label: 'Returns', icon: Undo2 },
    { id: 'pnl', label: 'P&L', icon: Scale },
    { id: 'image-generator', label: 'Creative', icon: Wand2 },
  ];

  // Filter navigation items based on role permissions
  const allowedNavItems = navItems.filter(item => hasAccess(item.id as ViewState));

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300`}>
      {showOfflineWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
           <AlertCircle size={20} />
           <p className="font-bold text-sm">System Offline: Critical AI features suspended.</p>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={20} className="fill-white" />
            </div>
            <h1 className="font-black text-sm tracking-tight">{settings.businessName}</h1>
          </div>
          <button className="md:hidden p-1 text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {allowedNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id as ViewState); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          {currentUser.role === 'Admin' && (
            <button onClick={() => { setView('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${view === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
              <Settings size={18} /> Settings
            </button>
          )}
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        <header className="h-14 md:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setIsSidebarOpen(true)}><Menu size={20} /></button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOnline ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Cloud Neural Link' : 'Local Offline Node'}
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 md:gap-4 justify-end">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mb-0.5">{currentUser?.name}</p>
              <p className="text-[9px] md:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{currentUser?.role}</p>
            </div>
            <button onClick={() => setView('profile')} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all hover:ring-2 hover:ring-indigo-500/20">
              <img src={currentUser?.avatar} className="w-full h-full object-cover" alt="Profile" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
          {renderView()}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-[40] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-colors">
          {allowedNavItems.slice(0, 4).map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${view === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <item.icon size={20} strokeWidth={view === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex flex-col items-center gap-1 min-w-[64px] text-slate-400 dark:text-slate-500`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;