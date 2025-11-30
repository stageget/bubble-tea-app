
import React, { useState, useEffect } from 'react';
import { Product, Size, SugarLevel, IceLevel, Topping, CartItem } from '../types';
import { X, Plus, Minus, Check, Coffee } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  availableToppings: Topping[];
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, availableToppings }) => {
  const [size, setSize] = useState<Size>(Size.L);
  const [sugar, setSugar] = useState<SugarLevel>(SugarLevel.Regular);
  const [ice, setIce] = useState<IceLevel>(IceLevel.Regular);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  // 當產品開啟時，重置狀態並設定預設值
  useEffect(() => {
    if (isOpen && product) {
      // 1. 智慧判斷預設尺寸 (如果沒有中杯，就選大杯)
      if (product.priceM > 0) {
        setSize(Size.M);
      } else if (product.priceL > 0) {
        setSize(Size.L);
      }
      
      setSugar(SugarLevel.Regular);
      
      // 2. 智慧判斷預設溫度
      // 如果只能做熱的，預設熱飲；否則預設正常冰
      if (!product.hasCold && product.hasHot) {
        setIce(IceLevel.Hot);
      } else {
        setIce(IceLevel.Regular);
      }
      
      setSelectedToppings([]);
      setQuantity(1);
      setNote('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // 取得目前選定尺寸的價格
  const basePrice = size === Size.M ? product.priceM : product.priceL;
  
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = basePrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const handleToppingToggle = (topping: Topping) => {
    if (selectedToppings.find(t => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      product,
      size,
      sugar,
      ice,
      toppings: selectedToppings,
      quantity,
      subtotal: totalPrice,
      note
    };
    onAddToCart(cartItem);
    onClose();
  };

  // 過濾可用的溫度選項
  const availableIceLevels = Object.values(IceLevel).filter(level => {
    if (level === IceLevel.Hot) return product.hasHot; // 只有 hasHot=true 才能選溫熱
    return product.hasCold; // 其他冰塊選項需要 hasCold=true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header Image */}
        <div className="h-48 w-full relative bg-gray-100 flex items-center justify-center">
           {product.image ? (
              <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                 e.currentTarget.style.display = 'none';
              }}
            />
           ) : (
             <Coffee size={64} className="text-gray-300" />
           )}
         
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-gray-700 transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
             <h2 className="text-2xl font-bold text-white">{product.name}</h2>
             <p className="text-white/90 text-sm mt-1">{product.description}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Size Selection */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">尺寸 Size</h3>
            <div className="flex gap-3">
              {/* 中杯按鈕 */}
              <button 
                onClick={() => product.priceM > 0 && setSize(Size.M)}
                disabled={product.priceM <= 0}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all relative overflow-hidden
                  ${product.priceM <= 0 
                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                    : size === Size.M 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                中杯 (M) 
                {product.priceM > 0 ? (
                  <span className="block text-xs mt-1 opacity-70">${product.priceM}</span>
                ) : (
                  <span className="block text-xs mt-1 text-red-400">N/A</span>
                )}
              </button>

              {/* 大杯按鈕 */}
              <button 
                onClick={() => product.priceL > 0 && setSize(Size.L)}
                disabled={product.priceL <= 0}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all relative overflow-hidden
                  ${product.priceL <= 0 
                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                    : size === Size.L 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                大杯 (L) 
                {product.priceL > 0 ? (
                  <span className="block text-xs mt-1 opacity-70">${product.priceL}</span>
                ) : (
                   <span className="block text-xs mt-1 text-red-400">N/A</span>
                )}
              </button>
            </div>
          </section>

          {/* Ice */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">溫度 Temperature</h3>
            {availableIceLevels.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableIceLevels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setIce(l)}
                    className={`py-2 px-2 text-sm rounded-lg border transition-all ${ice === l ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">此飲品無法調整溫度</p>
            )}
          </section>

          {/* Sugar */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">甜度 Sugar</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(SugarLevel).map((l) => (
                <button
                  key={l}
                  onClick={() => setSugar(l)}
                  className={`py-2 px-2 text-sm rounded-lg border transition-all ${sugar === l ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </section>

          {/* Toppings */}
          {availableToppings.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">加料 Toppings</h3>
              <div className="space-y-2">
                {availableToppings.map((topping) => {
                  const isSelected = selectedToppings.some(t => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      onClick={() => handleToppingToggle(topping)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <span className={isSelected ? 'text-brand-900 font-medium' : 'text-gray-700'}>{topping.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">+${topping.price}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

           {/* Note */}
           <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">備註 Note</h3>
            <input 
              type="text" 
              placeholder="例如：珍珠分開放、要吸管..."
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => quantity > 1 && setQuantity(q => q - 1)}
              className="p-3 hover:bg-white rounded-md transition-colors text-gray-600 disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus size={18} />
            </button>
            <span className="w-8 text-center font-bold text-lg text-gray-800">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="p-3 hover:bg-white rounded-md transition-colors text-gray-600"
            >
              <Plus size={18} />
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-brand-200 flex items-center justify-between"
          >
            <span>加入購物車</span>
            <span>${totalPrice}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductModal;
