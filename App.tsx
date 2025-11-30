import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, OrderData, Topping, MenuItem, ToppingItem } from './types';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import MenuScanner from './components/MenuScanner';
import { submitOrder, getStoreData } from './services/googleSheetService';
import { ShoppingBag, Coffee, CheckCircle, Store, AlertCircle, RefreshCw, ScanLine } from 'lucide-react';

const App: React.FC = () => {
  // --- App State ---
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // --- Store Data State ---
  const [storeName, setStoreName] = useState('飲料點餐');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // --- UI State ---
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // --- MenuLens State ---
  const [showScanner, setShowScanner] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getStoreData();
      if (data) {
        // 1. Set Store Info
        setStoreName(data.storeName || '飲料點餐');
        setIsStoreOpen(data.isOpen);

        // 2. Process Menu Items
        const rawMenu = data.menu || [];
        
        const _products: Product[] = [];
        const _toppings: Topping[] = [];
        const _categoriesSet = new Set<string>();

        rawMenu.forEach((item, index) => {
          // Fallback ID if missing
          const id = item.id || `p-${index}`;
          // 確保價格為數字，若為 undefined/null 轉為 0
          const safeItem: Product = { 
            ...item, 
            id,
            priceM: Number(item.priceM) || 0,
            priceL: Number(item.priceL) || 0
          };

          if (safeItem.category === '加料') {
            _toppings.push({
              id: safeItem.id,
              name: safeItem.name,
              price: safeItem.priceM 
            });
          } else {
            _products.push(safeItem);
            if (safeItem.category) {
              _categoriesSet.add(safeItem.category);
            }
          }
        });

        setProducts(_products);
        setToppings(_toppings);
        
        const catArray = Array.from(_categoriesSet);
        setCategories(catArray);
        if (catArray.length > 0) {
          setSelectedCategory(catArray[0]);
        }
      }
    } catch (err) {
      setErrorMsg('無法連接伺服器，請稍後再試。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportMenu = (items: MenuItem[], newToppings: ToppingItem[]) => {
    // 轉換 MenuLens 的資料格式為 Bubble Tea App 的格式
    const newProducts: Product[] = items.map(i => ({
      id: i.id,
      category: i.category,
      name: i.name,
      description: i.description || '',
      priceM: i.price_medium || 0,
      priceL: i.price_large || 0,
      hasHot: i.hot_available,
      hasCold: i.cold_available,
      image: undefined
    }));
    
    const toppingsList: Topping[] = newToppings.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price
    }));

    setProducts(newProducts);
    setToppings(toppingsList);
    
    const cats = Array.from(new Set(newProducts.map(p => p.category)));
    setCategories(cats);
    if(cats.length > 0) setSelectedCategory(cats[0]);
  };

  const handleScannerClose = () => {
      setShowScanner(false);
      fetchData(); // Refresh data on close
  };

  const displayedProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter(item => item.category === selectedCategory);
  }, [selectedCategory, products]);

  // --- Handlers ---

  const handleAddToCart = (item: CartItem) => {
    setCartItems([...cartItems, item]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleSubmitOrder = async (name: string, phone: string) => {
    setIsSubmitting(true);
    const order: OrderData = {
      customerName: name,
      customerPhone: phone,
      items: cartItems,
      totalAmount: cartItems.reduce((acc, item) => acc + item.subtotal, 0),
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    const success = await submitOrder(order);
    setIsSubmitting(false);

    if (success) {
      setOrderComplete(true);
      setCartItems([]);
      setIsCartOpen(false);
    } else {
      alert("訂單送出失敗，請稍後再試。");
    }
  };

  // --- Renders ---

  // 1. Loading Screen
  if (loading) {
    return (
       <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center gap-4">
         <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
         <p className="text-brand-800 font-bold animate-pulse">載入菜單中...</p>
       </div>
    )
  }

  // 2. Error Screen
  if (errorMsg && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-sm w-full text-center">
           <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertCircle size={32} />
           </div>
           <h2 className="text-xl font-bold text-gray-900 mb-2">連線錯誤</h2>
           <p className="text-gray-500 mb-6">{errorMsg}</p>
           <button 
             onClick={fetchData}
             className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
           >
             重試
           </button>
        </div>
      </div>
    );
  }

  // 3. Store Closed Screen
  if (!isStoreOpen) {
     return (
       <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-10 rounded-3xl shadow-lg max-w-sm w-full">
           <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
             <Store size={40} />
           </div>
           <h1 className="text-2xl font-bold text-gray-900 mb-2">尚未開放點餐</h1>
           <p className="text-gray-500 mb-6">目前店家尚未開始營業，請稍後再試。</p>
           <button 
             onClick={fetchData}
             className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
           >
             <RefreshCw size={18} /> 重試
           </button>
         </div>
       </div>
     )
  }

  // 4. Order Success Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">訂購成功！</h1>
          <p className="text-gray-600 mb-8">您的訂單已送出。</p>
          <button 
            onClick={() => setOrderComplete(false)}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg hover:bg-brand-700 transition-colors"
          >
            回到菜單
          </button>
        </div>
      </div>
    );
  }

  // 5. Main Ordering Interface
  return (
    <div className="min-h-screen bg-[#fcfbf9] pb-24 relative">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm">
        
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Coffee size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800 tracking-tight leading-none">{storeName}</h1>
              {isStoreOpen && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">● 營業中</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowScanner(true)}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                title="MenuLens Admin"
            >
                <ScanLine size={24} />
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors"
            >
              <ShoppingBag size={24} />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border border-white">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories Scroll */}
        <div className="max-w-4xl mx-auto overflow-x-auto no-scrollbar pb-1">
          <div className="flex px-4 gap-4 py-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                  ${selectedCategory === cat 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          {selectedCategory}
          <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
            {displayedProducts.length} items
          </span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedProducts.map((product) => {
             const displayPrice = product.priceM > 0 ? product.priceM : product.priceL;
             
             return (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] duration-200"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 relative">
                  {product.image ? (
                    <img 
                    src={product.image} 
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-brand-50');
                    }}
                  />
                  ) : (
                    <Coffee size={32} className="opacity-30" />
                  )}
                  {/* Hot/Cold Badges */}
                  <div className="absolute top-1 left-1 flex flex-col gap-1">
                    {product.hasHot && <span className="w-2 h-2 rounded-full bg-red-400 shadow-sm" title="可做熱飲"></span>}
                    {product.hasCold && <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm" title="可做冷飲"></span>}
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mt-1">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-brand-600 text-lg">
                      {displayPrice > 0 ? `$${displayPrice}` : '暫無販售'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                      <PlusIcon />
                    </div>
                  </div>
                </div>
              </div>
             )
          })}
        </div>
        
        {displayedProducts.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            此分類暫無商品
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-300 text-sm">
        <p>© 2024 {storeName}</p>
      </footer>

      {/* Floating Cart Button (Mobile Only) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20 flex justify-center pointer-events-none">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="pointer-events-auto w-full max-w-sm bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-300 group hover:bg-black transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {cartItems.length}
                </div>
                <span className="font-bold">檢視購物車</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="font-bold text-lg">${cartItems.reduce((acc, item) => acc + item.subtotal, 0)}</span>
                 <ShoppingBag size={18} className="text-gray-400 group-hover:text-white transition-colors"/>
              </div>
            </button>
        </div>
      )}

      {/* Modals */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        availableToppings={toppings}
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      {showScanner && (
        <MenuScanner 
          onClose={handleScannerClose} 
          onImport={handleImportMenu}
          initialStoreName={storeName}
        />
      )}
    </div>
  );
};

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

export default App;