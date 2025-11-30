import { OrderData, StoreData, MenuItem, ToppingItem } from '../types';

// NOTE: All URLs now point to relative paths (/api/...) 
// expecting the Vercel Serverless Functions to handle the actual connection.

export const getStoreData = async (): Promise<StoreData | null> => {
  try {
    const response = await fetch('/api/store');

    if (response.status === 404) {
        console.error("❌ API not found (404). If running locally, please use 'vercel dev' instead of 'npm run dev' to enable serverless functions.");
        throw new Error("API Route not found. Use 'vercel dev' for local development.");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch store data:", error);
    throw error;
  }
};

export const updateStoreMenu = async (storeName: string, items: MenuItem[], toppings: ToppingItem[]): Promise<{ success: boolean; message: string }> => {
  console.log("🚀 Sending menu update to /api/menu...");

  const payload = {
    action: 'update_menu',
    storeName,
    menu: items,
    toppings: toppings
  };
  
  try {
    const response = await fetch('/api/menu', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Menu updated response:", result);
    
    if (result.status === 'success') {
        return { success: true, message: result.message || "Menu updated successfully." };
    } else {
        return { success: false, message: result.message || "Unknown server error." };
    }

  } catch (error: any) {
    console.error("❌ Menu update failed:", error);
    return { success: false, message: error.message || "Network request failed." };
  }
};

export const submitOrder = async (order: OrderData): Promise<boolean> => {
  console.log("🚀 Submitting order to /api/order...");
  
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      body: JSON.stringify(order),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Order submitted:", result);
    return result.success === true;
  } catch (error) {
    console.error("❌ Order submission failed:", error);
    return false;
  }
};