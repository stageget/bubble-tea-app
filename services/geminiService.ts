
import { ParsedMenu } from "../types";

/**
 * Sends the image to the secure Vercel API endpoint for analysis.
 * The actual API Key and GoogleGenAI logic are now on the server side (api/analyze.js).
 */
export const parseMenuImage = async (base64Image: string): Promise<ParsedMenu> => {
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const parsedData = await response.json();

    // The server returns raw JSON data.
    // We need to add unique IDs for frontend React rendering (key props).
    return {
      items: (parsedData.items || []).map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
      toppings: (parsedData.toppings || []).map((topping: any) => ({
        ...topping,
        id: crypto.randomUUID(),
      })),
    };

  } catch (error: any) {
    console.error("Menu Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze menu. Please try again.");
  }
};
