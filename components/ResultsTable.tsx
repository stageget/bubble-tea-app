import React, { useState } from 'react';
import { MenuItem, ToppingItem } from '../types';
import { Download, FileJson, Trash2, Edit2, Check, X, Plus } from 'lucide-react';

interface ResultsTableProps {
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  toppings: ToppingItem[];
  setToppings: React.Dispatch<React.SetStateAction<ToppingItem[]>>;
  onReset: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ items, setItems, toppings, setToppings, onReset }) => {
  // Drink State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});

  // Topping State
  const [editingToppingId, setEditingToppingId] = useState<string | null>(null);
  const [editToppingForm, setEditToppingForm] = useState<Partial<ToppingItem>>({});

  const handleDownloadCSV = () => {
    // Part 1: Drinks
    const headers = ['Category', 'Name', 'Price (M)', 'Price (L)', 'Description', 'Hot', 'Cold'];
    const drinksCsv = items.map(item => [
      `"${item.category}"`,
      `"${item.name}"`,
      item.price_medium || '',
      item.price_large || '',
      `"${item.description || ''}"`,
      item.hot_available ? 'Yes' : 'No',
      item.cold_available ? 'Yes' : 'No'
    ].join(','));

    // Part 2: Toppings (Appended at bottom with a specific category)
    const toppingsCsv = toppings.map(t => [
      `"Toppings/Add-ons"`, // Category
      `"${t.name}"`,        // Name
      t.price,              // Price (M column used for single price)
      '',                   // Price L (Empty)
      `"Add-on item"`,      // Description
      'No',                 // Hot
      'No'                  // Cold
    ].join(','));

    const csvContent = [
      headers.join(','),
      ...drinksCsv,
      ...toppingsCsv
    ].join('\n');

    // Add BOM (\uFEFF) to ensure Excel opens UTF-8 CSVs with Chinese characters correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'menu_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const data = {
      menu_items: items,
      add_ons: toppings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'menu_export.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Drink Handlers ---
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      setItems(prev => prev.map(item => 
        item.id === editingId ? { ...item, ...editForm } as MenuItem : item
      ));
      setEditingId(null);
    }
  };

  const handleEditChange = (field: keyof MenuItem, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // --- Topping Handlers ---
  const deleteTopping = (id: string) => {
    setToppings(prev => prev.filter(t => t.id !== id));
  };

  const startEditTopping = (item: ToppingItem) => {
    setEditingToppingId(item.id);
    setEditToppingForm({ ...item });
  };

  const cancelEditTopping = () => {
    setEditingToppingId(null);
    setEditToppingForm({});
  };

  const saveEditTopping = () => {
    if (editingToppingId && editToppingForm) {
      setToppings(prev => prev.map(item => 
        item.id === editingToppingId ? { ...item, ...editToppingForm } as ToppingItem : item
      ));
      setEditingToppingId(null);
    }
  };

  const addNewTopping = () => {
    const newTopping: ToppingItem = {
      id: crypto.randomUUID(),
      name: 'New Topping',
      price: 0
    };
    setToppings(prev => [...prev, newTopping]);
    startEditTopping(newTopping);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Menu Data</h2>
          <p className="text-sm text-slate-500">
            {items.length} Drinks, {toppings.length} Toppings detected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <X size={16} />
            Start Over
          </button>
          <button 
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors border border-indigo-200"
          >
            <FileJson size={16} />
            JSON
          </button>
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      {/* DRINKS TABLE */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-700 pl-1">Beverages</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 min-w-[120px]">Category</th>
                  <th className="px-4 py-3 min-w-[150px]">Name</th>
                  <th className="px-4 py-3 w-[100px]">Price (M)</th>
                  <th className="px-4 py-3 w-[100px]">Price (L)</th>
                  <th className="px-4 py-3 hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 w-[80px]">Props</th>
                  <th className="px-4 py-3 w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isEditing = editingId === item.id;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editForm.category || ''}
                            onChange={(e) => handleEditChange('category', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : item.category}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editForm.name || ''}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : item.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editForm.price_medium || ''}
                            onChange={(e) => handleEditChange('price_medium', parseFloat(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        ) : item.price_medium}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {isEditing ? (
                           <input 
                            type="number" 
                            value={editForm.price_large || ''}
                            onChange={(e) => handleEditChange('price_large', parseFloat(e.target.value))}
                            className="w-full p-1 border rounded"
                          />
                        ) : item.price_large}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs truncate">
                         {isEditing ? (
                           <input 
                            type="text" 
                            value={editForm.description || ''}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : item.description}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                               <label className="text-xs cursor-pointer"><input type="checkbox" checked={editForm.hot_available} onChange={e => handleEditChange('hot_available', e.target.checked)} /> H</label>
                               <label className="text-xs cursor-pointer"><input type="checkbox" checked={editForm.cold_available} onChange={e => handleEditChange('cold_available', e.target.checked)} /> C</label>
                            </div>
                          ) : (
                            <>
                              {item.hot_available && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium" title="Hot">H</span>}
                              {item.cold_available && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium" title="Cold">C</span>}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                              <button onClick={cancelEdit} className="p-1 text-slate-500 hover:bg-slate-100 rounded"><X size={16} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(item)} className="p-1 text-brand-600 hover:bg-brand-50 rounded"><Edit2 size={16} /></button>
                              <button onClick={() => deleteItem(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                   <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                         No drink items found.
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TOPPINGS TABLE */}
      <div className="space-y-2">
        <div className="flex justify-between items-center pl-1">
          <h3 className="text-lg font-bold text-slate-700">Add-ons / Toppings (加料)</h3>
          <button 
            onClick={addNewTopping}
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium px-2 py-1 hover:bg-brand-50 rounded transition-colors"
          >
            <Plus size={16} /> Add Topping
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 w-[60%]">Topping Name</th>
                  <th className="px-4 py-3 w-[20%]">Price</th>
                  <th className="px-4 py-3 w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {toppings.map((item) => {
                  const isEditing = editingToppingId === item.id;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editToppingForm.name || ''}
                            onChange={(e) => setEditToppingForm(prev => ({...prev, name: e.target.value}))}
                            className="w-full p-1 border rounded"
                            placeholder="e.g., Pearls"
                          />
                        ) : item.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editToppingForm.price || ''}
                            onChange={(e) => setEditToppingForm(prev => ({...prev, price: parseFloat(e.target.value)}))}
                            className="w-full p-1 border rounded"
                          />
                        ) : `+${item.price}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={saveEditTopping} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                              <button onClick={cancelEditTopping} className="p-1 text-slate-500 hover:bg-slate-100 rounded"><X size={16} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditTopping(item)} className="p-1 text-brand-600 hover:bg-brand-50 rounded"><Edit2 size={16} /></button>
                              <button onClick={() => deleteTopping(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                 {toppings.length === 0 && (
                   <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">
                         No toppings found. Click 'Add Topping' to create one.
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResultsTable;