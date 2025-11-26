import React, { useState, useEffect } from 'react';
import { Product, Size, SugarLevel, IceLevel, Topping, CartItem } from '../types';
import { TOPPINGS } from '../constants';
import { X, Plus, Minus, Check } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [size, setSize] = useState<Size>(Size.L);
  const [sugar, setSugar] = useState<SugarLevel>(SugarLevel.Regular);
  const [ice, setIce] = useState<IceLevel>(IceLevel.Regular);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSize(Size.L);
      setSugar(SugarLevel.Regular);
      setIce(IceLevel.Regular);
      setSelectedToppings([]);
      setQuantity(1);
      setNote('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const basePrice = size === Size.M ? product.priceM : (product.priceL || product.priceM);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header Image */}
        <div className="h-48 w-full relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-gray-700 transition-colors"
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
          
          {/* Size */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">尺寸 Size</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setSize(Size.M)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${size === Size.M ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                中杯 (M) <span className="block text-xs mt-1 text-gray-500">${product.priceM}</span>
              </button>
              {product.priceL && (
                <button 
                  onClick={() => setSize(Size.L)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${size === Size.L ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  大杯 (L) <span className="block text-xs mt-1 text-gray-500">${product.priceL}</span>
                </button>
              )}
            </div>
          </section>

          {/* Ice */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">冰塊 Ice</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(IceLevel).map((l) => (
                <button
                  key={l}
                  onClick={() => setIce(l)}
                  className={`py-2 px-2 text-sm rounded-lg border transition-all ${ice === l ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {l}
                </button>
              ))}
            </div>
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
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">加料 Toppings</h3>
            <div className="space-y-2">
              {TOPPINGS.map((topping) => {
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
