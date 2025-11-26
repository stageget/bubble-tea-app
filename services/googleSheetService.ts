import { OrderData } from '../types';

/**
 * ==========================================
 * 後端代理模式
 * 
 * 我們不再前端直接呼叫 Google Sheets。
 * 而是呼叫我們自己的後端 API (/api/order)，
 * 由 Vercel 後端去讀取環境變數 (GOOGLE_SCRIPT_URL) 並轉送資料。
 * ==========================================
 */

const STORAGE_KEY = 'google_script_url';

export const getStoredUrl = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const saveStoredUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY, url);
};

export const submitOrder = async (order: OrderData): Promise<boolean> => {
  
  console.log("🚀 準備發送訂單至後端 Proxy (/api/order)...");

  const payload = JSON.stringify(order);

  try {
    // 呼叫我們自己的後端 API
    // Vercel 會自動將 /api/order 路徑對應到 api/order.js 檔案
    const response = await fetch('/api/order', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 嘗試讀取錯誤訊息
      const errorData = await response.json().catch(() => ({}));
      console.error("Server Error:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ 訂單請求已發送成功", result);
    return true; 
  } catch (error) {
    console.error("❌ 訂單發送失敗:", error);
    return false;
  }
};
