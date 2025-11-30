
export enum Size {
  M = 'M',
  L = 'L'
}

export enum SugarLevel {
  Regular = '正常糖',
  Less = '少糖 (7分)',
  Half = '半糖 (5分)',
  Quarter = '微糖 (3分)',
  None = '無糖',
}

export enum IceLevel {
  Regular = '正常冰',
  Less = '少冰',
  Micro = '微冰',
  None = '去冰',
  Hot = '溫熱',
}

export interface Topping {
  id: string; 
  name: string;
  price: number;
}

export interface Product {
  id: string;
  category: string;
  name: string;
  priceM: number; // 若為 0 或 null 代表該尺寸不提供
  priceL: number; // 若為 0 或 null 代表該尺寸不提供
  description?: string;
  hasHot: boolean;  // 對應試算表 "Hot" 欄位
  hasCold: boolean; // 對應試算表 "Cold" 欄位
  image?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: Size;
  sugar: SugarLevel;
  ice: IceLevel;
  toppings: Topping[];
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface OrderData {
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
  orderDate: string;
  status: 'pending' | 'submitted' | 'failed';
}

export interface StoreData {
  isOpen: boolean;
  storeName: string;
  menu: any[]; // 原始資料，會在前端轉換成 Product
}

export type ViewMode = 'PUBLIC' | 'ADMIN';

// --- MenuLens Specific Types ---

export enum AppStatus {
  IDLE = 'idle',
  CAPTURING = 'capturing',
  PROCESSING = 'processing',
  REVIEW = 'review',
  ERROR = 'error'
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price_medium: number | null;
  price_large: number | null;
  description: string | null;
  hot_available: boolean;
  cold_available: boolean;
}

export interface ToppingItem {
  id: string;
  name: string;
  price: number;
}

export interface ParsedMenu {
  items: MenuItem[];
  toppings: ToppingItem[];
}

export interface ProcessingError {
  title: string;
  message: string;
}

export interface UserProfile {
  username: string;
  role: string;
}