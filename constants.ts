import { Product, Topping } from './types';

export const CATEGORIES = [
  "原茶系列",
  "醇奶茶系列",
  "鮮果特調",
  "濃醇拿鐵"
];

export const TOPPINGS: Topping[] = [
  { id: 't1', name: '波霸珍珠', price: 10 },
  { id: 't2', name: '椰果', price: 10 },
  { id: 't3', name: '仙草凍', price: 10 },
  { id: 't4', name: '統一布丁', price: 15 },
  { id: 't5', name: '寒天晶球', price: 15 },
];

// Replicating a typical beverage menu structure
export const MENU_ITEMS: Product[] = [
  // Original Tea
  {
    id: 'p1',
    category: '原茶系列',
    name: '高山金萱茶',
    description: '嚴選高山茶葉，口感清爽回甘',
    priceM: 30,
    priceL: 35,
    image: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: 'p2',
    category: '原茶系列',
    name: '錫蘭紅茶',
    description: '經典斯里蘭卡紅茶，茶香濃郁',
    priceM: 30,
    priceL: 35,
    image: 'https://picsum.photos/400/400?random=2'
  },
  {
    id: 'p3',
    category: '原茶系列',
    name: '茉莉綠茶',
    description: '清新茉莉花香，解膩首選',
    priceM: 30,
    priceL: 35,
    image: 'https://picsum.photos/400/400?random=3'
  },
  
  // Milk Tea
  {
    id: 'p4',
    category: '醇奶茶系列',
    name: '經典珍珠奶茶',
    description: '香濃奶茶搭配Q彈波霸珍珠',
    priceM: 50,
    priceL: 60,
    image: 'https://picsum.photos/400/400?random=4'
  },
  {
    id: 'p5',
    category: '醇奶茶系列',
    name: '布丁奶茶',
    description: '滑嫩統一布丁融入奶茶',
    priceM: 55,
    priceL: 65,
    image: 'https://picsum.photos/400/400?random=5'
  },
  {
    id: 'p6',
    category: '醇奶茶系列',
    name: '仙草凍奶茶',
    description: '手工嫩仙草，口感豐富',
    priceM: 50,
    priceL: 60,
    image: 'https://picsum.photos/400/400?random=6'
  },

  // Fruit Tea
  {
    id: 'p7',
    category: '鮮果特調',
    name: '鮮柚綠茶',
    description: '新鮮葡萄柚果肉，酸甜清爽',
    priceM: 60,
    priceL: 70,
    image: 'https://picsum.photos/400/400?random=7'
  },
  {
    id: 'p8',
    category: '鮮果特調',
    name: '百香雙響炮',
    description: '百香果汁搭配珍珠與椰果',
    priceM: 55,
    priceL: 65,
    image: 'https://picsum.photos/400/400?random=8'
  },

  // Latte (Fresh Milk)
  {
    id: 'p9',
    category: '濃醇拿鐵',
    name: '紅茶拿鐵',
    description: '錫蘭紅茶加入鮮乳',
    priceM: 55,
    priceL: 65,
    image: 'https://picsum.photos/400/400?random=9'
  },
  {
    id: 'p10',
    category: '濃醇拿鐵',
    name: '黑糖珍珠鮮奶',
    description: '手炒黑糖紋路，濃郁奶香 (甜度固定)',
    priceM: 65,
    priceL: 75,
    image: 'https://picsum.photos/400/400?random=10'
  },
];
