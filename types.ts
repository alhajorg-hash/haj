
export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number; // Selling Price
  costPrice: number; // Cost Price
  stock: number;
  image: string;
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  dueDate?: number; 
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: 'Cash' | 'Card' | 'Digital' | 'Credit';
  customerId?: string;
  isSettlement?: boolean; // New: Identifies debt repayment transactions
}

export interface ShopTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  creditBalance: number;
  lastVisit: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: number;
  note: string;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: number;
  amount: number;
  status: 'Pending' | 'Received' | 'Cancelled';
  items?: CartItem[]; 
}

export interface PayrollRecord {
  id: string;
  userId: string;
  userName: string;
  role: string;
  department: string;
  baseSalary: number;
  allowances: number; 
  overtimeHours: number; 
  overtimePay: number; 
  salesVolume: number; // New: Monthly sales attributed to staff
  commissionRate: number; // New: Percentage of sales
  commissionEarnings: number; // New: Calculated GH₵ amount
  bonus: number;
  deductions: number;
  ssnit: number; 
  paye: number;  
  status: 'Paid' | 'Pending';
  month: string;
  paymentDate?: number;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Momo';
  reference?: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  twoFactorEnabled?: boolean;
  loginNotificationsEnabled?: boolean;
}

export interface AppReturn {
  id: string;
  type: 'Sales' | 'Purchase';
  referenceId: string; 
  date: number;
  amount: number;
  items: { productId: string; name: string; quantity: number; price: number }[];
  status: 'Pending' | 'Completed' | 'Rejected';
  reason?: string;
}

export interface SystemSettings {
  businessName: string;
  adminWhatsApp: string;
  managerAccessToUsers: boolean;
  managerAccessToInventory: boolean;
  managerAccessToReports: boolean;
  managerAccessToPnL: boolean;
  managerAccessToExpenses: boolean;
  managerAccessToPurchases: boolean;
  managerAccessToCustomers: boolean;
  managerAccessToWarehouse: boolean;
  managerAccessToAiAssistant: boolean;
  managerAccessToCreativeStudio: boolean;
  managerAccessToOpsBoard: boolean;
  managerAccessToReturns: boolean;
  cashierAccessToInventory: boolean;
  allowTransactionDeletion: boolean;
  lockSystemCurrency: boolean;
  baseCurrency: string;
  primaryLanguage: string;
  // Storefront Customization
  storefrontHeroTitle: string;
  storefrontHeroSubtitle: string;
  storefrontPromoBanner: string;
  storefrontLocation: string;
  storefrontInstagram: string;
  storefrontFacebook: string;
  storefrontTwitter: string;
  storefrontPromoTitle: string;
  storefrontPromoHighlight: string;
  storefrontPromoDesc: string;
}

export type ViewState = 
  | 'dashboard' 
  | 'pos' 
  | 'inventory' 
  | 'reports' 
  | 'ai-assistant' 
  | 'board' 
  | 'customers' 
  | 'warehouse' 
  | 'expenses' 
  | 'purchases' 
  | 'users' 
  | 'returns' 
  | 'pnl' 
  | 'profile' 
  | 'settings'
  | 'image-generator'
  | 'credit-ledger'
  | 'payroll'
  | 'storefront';
