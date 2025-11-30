
import React, { useState, useEffect } from 'react';
import { Camera, Upload, Loader2, ChefHat, Image as ImageIcon, Lock, User, KeyRound, ArrowRight, X, Save, Store, AlertTriangle } from 'lucide-react';
import { AppStatus, MenuItem, ToppingItem, ProcessingError, UserProfile } from '../types';
import { parseMenuImage } from '../services/geminiService';
import { updateStoreMenu } from '../services/googleSheetService';
import CameraView from './CameraView';
import ResultsTable from './ResultsTable';

interface MenuScannerProps {
  onClose: () => void;
  onImport: (items: MenuItem[], toppings: ToppingItem[]) => void;
  initialStoreName?: string;
}

const MenuScanner: React.FC<MenuScannerProps> = ({ onClose, onImport, initialStoreName }) => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Scanning State
  const [image, setImage] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [toppings, setToppings] = useState<ToppingItem[]>([]);
  const [error, setError] = useState<ProcessingError | null>(null);

  // Store Meta
  const [storeName, setStoreName] = useState(initialStoreName || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-fill store name if provided
  useEffect(() => {
    if (initialStoreName) {
        setStoreName(initialStoreName);
    }
  }, [initialStoreName]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser({
          username: data.username,
          role: data.role || "Administrator"
        });
      } else {
        setAuthError(data.message || "Login failed");
      }
    } catch (error) {
       console.error("Login error:", error);
       setAuthError("Network error. Please try again.");
    } finally {
       setIsLoggingIn(false);
    }
  };

  const handleImageCapture = (base64Image: string) => {
    setImage(base64Image);
    processImage(base64Image);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64Image: string) => {
    const base64Data = base64Image.split(',')[1];
    
    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const result = await parseMenuImage(base64Data);
      setMenuItems(result.items);
      setToppings(result.toppings);
      setStatus(AppStatus.REVIEW);
    } catch (err: any) {
      setError({
        title: "Processing Failed",
        message: err.message || "Something went wrong while analyzing the menu."
      });
      setStatus(AppStatus.ERROR);
    }
  };

  const resetApp = () => {
    setStatus(AppStatus.IDLE);
    setImage(null);
    setMenuItems([]);
    setToppings([]);
    setError(null);
  };

  // 1. Trigger the confirmation modal
  const handleSyncClick = () => {
    if (!storeName.trim()) {
        alert("Please enter the Shop Name (店家名稱) first.");
        return;
    }
    
    if (menuItems.length === 0) {
        alert("No menu data found. Please scan a menu first.");
        return;
    }

    setShowConfirmModal(true);
  };

  // 2. Perform the actual sync
  const performSync = async () => {
    setShowConfirmModal(false); // Close modal
    setIsSyncing(true);
    
    try {
        // 1. Update local view
        onImport(menuItems, toppings);
        
        // 2. Update cloud (Google Sheets) via Proxy
        const result = await updateStoreMenu(storeName, menuItems, toppings);
        
        if (result.success) {
            alert(`✅ ${result.message}`);
            onClose();
        } else {
            alert(`❌ Update Failed: ${result.message}`);
        }
    } catch (e) {
        console.error(e);
        alert("Unexpected error during sync.");
    } finally {
        setIsSyncing(false);
    }
  };

  // --- LOGIN VIEW ---
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-200 rounded-full">
            <X size={24}/>
        </button>
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-slate-100">
          <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-brand-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h1>
          <p className="text-slate-500 mb-8">
            Please sign in to access MenuLens.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {authError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                {authError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-xs text-slate-400">
            <p>Admin credentials are configured in Vercel.</p>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col font-sans overflow-auto animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <ChefHat size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MenuLens</h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">AI Drink Menu Digitizer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={handleSyncClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSyncing}
            >
                {isSyncing ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                {isSyncing ? 'Syncing...' : 'Update Shop Menu'}
            </button>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2 text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user.role}</p>
              <p className="text-xs text-slate-500">{user.username}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
              title="Close"
            >
               <span className="text-sm font-medium hidden md:inline">Exit</span>
               <X size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Step 1: Idle */}
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="text-center max-w-lg mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Digitize Your Drink Menu</h2>
              <p className="text-lg text-slate-600">
                Update your Bubble Tea shop's menu in seconds. Take a photo, review the data, and click "Update Shop Menu".
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button 
                onClick={() => setStatus(AppStatus.CAPTURING)}
                className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-brand-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="p-4 bg-brand-50 text-brand-600 rounded-full mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Camera size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Take Photo</h3>
              </button>

              <label className="cursor-pointer group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-brand-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Upload size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload File</h3>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Capturing */}
        {status === AppStatus.CAPTURING && (
          <div className="flex flex-col items-center animate-fade-in">
             <h2 className="text-xl font-semibold mb-6 text-slate-800">Position the menu within the frame</h2>
             <CameraView 
                onCapture={handleImageCapture} 
                onCancel={() => setStatus(AppStatus.IDLE)} 
             />
          </div>
        )}

        {/* Step 3: Processing */}
        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg border border-slate-100">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-800">Analyzing Menu...</h3>
            <p className="mt-2 text-slate-500">Gemini AI is reading the items, prices, and extra toppings.</p>
            
            {image && (
              <div className="mt-8 w-48 h-64 rounded-lg overflow-hidden border border-slate-200 shadow-md opacity-50 grayscale">
                <img src={image} alt="Processing" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {status === AppStatus.REVIEW && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Store Info Input Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                       <Store size={24} />
                   </div>
                   <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Shop Name (店家名稱)</label>
                       <input 
                           type="text" 
                           placeholder="Ex: 幸福堂-台北店"
                           value={storeName}
                           onChange={(e) => setStoreName(e.target.value)}
                           className="w-full sm:w-64 p-2 border-b-2 border-slate-200 focus:border-brand-500 outline-none font-bold text-slate-900 bg-transparent transition-colors placeholder:font-normal"
                       />
                   </div>
               </div>
               <div className="text-sm text-slate-400 hidden sm:block max-w-xs text-right">
                   This name will be used to create/update the sheet: <br/> "飲料菜單-{storeName || '...'}"
               </div>
            </div>

            {/* Mobile Sync Button */}
             <button 
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="md:hidden w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
                {isSyncing ? <Loader2 className="animate-spin"/> : <Save size={20} />}
                Update Shop Menu
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Preview */}
                <div className="lg:w-1/3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <ImageIcon size={18} />
                    Original Image
                    </h3>
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={image!} alt="Captured Menu" className="w-full h-auto object-contain max-h-[70vh]" />
                    </div>
                    <div className="mt-4 flex justify-center">
                    <button 
                        onClick={resetApp}
                        className="text-sm text-slate-500 hover:text-slate-800 underline"
                    >
                        Scan Another Menu
                    </button>
                    </div>
                </div>
                </div>

                {/* Right: Results */}
                <div className="lg:w-2/3">
                <ResultsTable 
                    items={menuItems} 
                    setItems={setMenuItems} 
                    toppings={toppings}
                    setToppings={setToppings}
                    onReset={resetApp} 
                />
                </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && error && (
          <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500 animate-fade-in">
            <h3 className="text-lg font-bold text-red-600 mb-2">{error.title}</h3>
            <p className="text-slate-600 mb-6">{error.message}</p>
            <div className="flex justify-end gap-3">
               <button 
                onClick={resetApp}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Go Home
              </button>
              <button 
                onClick={() => processImage(image!)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
             <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
                 <div className="flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                         <AlertTriangle size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Update?</h3>
                     <p className="text-slate-600 mb-6">
                         You are about to update the menu for <span className="font-bold text-slate-800">"{storeName}"</span>. 
                         <br/><br/>
                         This will overwrite the existing data in your Google Sheet.
                     </p>
                     <div className="flex gap-3 w-full">
                         <button 
                             onClick={() => setShowConfirmModal(false)}
                             className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                         >
                             Cancel
                         </button>
                         <button 
                             onClick={performSync}
                             className="flex-1 py-3 px-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
                         >
                             Update
                         </button>
                     </div>
                 </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default MenuScanner;
