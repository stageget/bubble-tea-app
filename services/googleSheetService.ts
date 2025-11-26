import { OrderData } from '../types';

const STORAGE_KEY = 'google_sheet_script_url';

export const getStoredUrl = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const saveStoredUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY, url);
};

/**
 * ==========================================
 * 後端代理模式
 * 
 * 我們不再前端直接呼叫 Google Sheets (這樣會暴露 URL)。
 * 而是呼叫我們自己的後端 API (/api/order)，
 * 由後端去讀取環境變數並轉送資料。
 * ==========================================
 */

export const submitOrder = async (order: OrderData): Promise<boolean> => {
  
  // 1. 優先檢查是否有本地設定的 URL (Debug/Dev Mode/Client-side only)
  const storedUrl = getStoredUrl();
  if (storedUrl) {
    console.log("🚀 使用本地設定的 Google Script URL 發送...");
    try {
      // client-side fetch to google script usually needs no-cors
      await fetch(storedUrl, {
        method: 'POST',
        body: JSON.stringify(order),
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // no-cors mode returns opaque response, assume success if no network error
      console.log("✅ 訂單已發送 (Local Mode)");
      return true;
    } catch (error) {
      console.error("❌ 本地發送失敗:", error);
      return false;
    }
  }

  // 2. 否則走後端 Proxy 模式
  console.log("🚀 準備發送訂單至後端 Proxy...");

  const payload = JSON.stringify(order);

  try {
    // 呼叫我們自己的後端 API
    // Vercel 會將 /api/order 對應到 api/order.js
    const response = await fetch('/api/order', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ 訂單請求已發送", result);
    return true; 
  } catch (error) {
    console.error("❌ 訂單發送失敗:", error);
    return false;
  }
};