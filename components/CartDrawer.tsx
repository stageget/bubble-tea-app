import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onSubmitOrder: (customerName: string, customerPhone: string) => void;
  isSubmitting: boolean;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemoveItem,
  onSubmitOrder,
  isSubmitting
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('請填寫姓名與電話');
      return;
    }
    onSubmitOrder(name, phone);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900">您的訂單</h2>
            <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {items.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={64} className="opacity-20" />
              <p>購物車是空的</p>
              <button onClick={onClose} className="text-brand-600 font-medium hover:underline">
                去點餐
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                {/* Qty Badge */}
                <div className="flex flex-col items-center justify-center space-y-1">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                     x{item.quantity}
                   </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate">{item.product.name}</h3>
                    <span className="font-bold text-gray-900">${item.subtotal}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.size} / {item.ice} / {item.sugar}
                  </p>
                  {item.toppings.length > 0 && (
                     <p className="text-xs text-brand-600 mt-1">
                       + {item.toppings.map(t => t.name).join(', ')}
                     </p>
                  )}
                  {item.note && (
                    <p className="text-xs text-gray-400 mt-1 italic">
                      註: {item.note}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors self-center p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="bg-white border-t border-gray-100 p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 pb-safe">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium">總金額 Total</span>
            <span className="text-2xl font-bold text-brand-600">${totalAmount}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">取餐人姓名 Name</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="王小明"
                className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-base text-black placeholder-gray-400"
                style={{ fontSize: '16px' }} 
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">手機號碼 Phone</label>
              <input 
                required
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-base text-black placeholder-gray-400"
                style={{ fontSize: '16px' }}
              />
            </div>

            <button 
              type="submit"
              disabled={items.length === 0 || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg
                ${items.length === 0 || isSubmitting 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-brand-600 hover:bg-brand-700 hover:scale-[1.02] shadow-brand-200'}`}
            >
              {isSubmitting ? '送出訂單中...' : '送出訂單 Checkout'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CartDrawer;