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
  name: string;
  category: string;
  description?: string;
  priceM: number;
  priceL?: number; // Optional if only one size exists
  isSoldOut?: boolean;
  image?: string;
}

export interface CartItem {
  id: string; // Unique ID for the cart line item (timestamp + random)
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
