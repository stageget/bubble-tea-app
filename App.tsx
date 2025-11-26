
import React, { useState, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS } from './constants';
import { Product, CartItem, OrderData } from './types';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import { submitOrder } from './services/googleSheetService';
import { ShoppingBag, Coffee, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Filter products based on category
  const displayedProducts = useMemo(() => {
    return MENU_ITEMS.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

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
      // 這裡的錯誤通常是網路問題或伺服器錯誤
      alert("訂單送出失敗，請稍後再試。");
    }
  };

  // Success Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">訂購成功！</h1>
          <p className="text-gray-600 mb-8">您的訂單已送出，我們將盡快為您製作美味飲品。</p>
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

  return (
    <div className="min-h-screen bg-[#fcfbf9] pb-24 relative">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 select-none"
          >
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Coffee size={20} />
            </div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">Bubble Tea</h1>
          </div>
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

        {/* Categories Scroll */}
        <div className="max-w-4xl mx-auto overflow-x-auto no-scrollbar pb-1">
          <div className="flex px-4 gap-4 py-2 min-w-max">
            {CATEGORIES.map((cat) => (
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
          {displayedProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] duration-200"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between flex-1 py-1">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-brand-600 text-lg">${product.priceM}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                    <PlusIcon />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-300 text-sm">
        <p>© 2024 Bubble Tea Shop</p>
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
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
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
