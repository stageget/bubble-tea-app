
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  // 1. 確保只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. 從伺服器環境變數讀取 API Key (這是在 Vercel 後台設定的，不會暴露給前端)
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("❌ Critical Error: API_KEY is missing in Vercel Environment Variables.");
    return res.status(500).json({ message: 'Server configuration error: API Key missing' });
  }

  try {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ message: 'No image data provided' });
    }

    // 移除 base64 header (如果有的話)
    const base64Data = image.includes('base64,') ? image.split(',')[1] : image;

    // --- Gemini 邏輯移至後端 ---
    const ai = new GoogleGenAI({ apiKey });

    // Schema 定義 (與原本前端邏輯相同)
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                name: { type: Type.STRING },
                price_medium: { type: Type.NUMBER, nullable: true },
                price_large: { type: Type.NUMBER, nullable: true },
                description: { type: Type.STRING, nullable: true },
                hot_available: { type: Type.BOOLEAN },
                cold_available: { type: Type.BOOLEAN },
              },
              required: ["name", "category", "hot_available", "cold_available"],
            },
          },
          toppings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
              },
              required: ["name", "price"],
            },
          },
        },
        required: ["items", "toppings"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `你是一位專業的繁體中文資料輸入助手。請分析這張飲料菜單圖片，並將資料轉換為結構化的 JSON 格式。

            主要任務：
            1. **飲料項目 (items)**：
               - 提取所有飲料名稱與價格。
               - 必須依照菜單上的區塊歸類「分類」(category)，例如「醇香奶茶」、「鮮果系列」、「原茶」等。
               - 若有中杯/大杯價格請分別提取。
               - 請務必使用**繁體中文**輸出名稱與分類。
            
            2. **加料/配料 (toppings)**：
               - 尋找「加料區」、「配料」、「口感」、「Toppings」等區塊。
               - 提取配料名稱 (如：珍珠、椰果、仙草) 與價格。

            重要規則 (IGNORE 列表)：
            - **絕對不要** 提取「甜度表」(例如：全糖、七分、半糖、微糖) 作為飲料項目。
            - **絕對不要** 提取「冰塊表」(例如：正常冰、少冰、去冰) 作為飲料項目。
            - 這些是所有飲料共用的屬性，不需要列在個別項目中。

            其他規則：
            - 根據圖示 (雪花/熱氣) 或標題判斷是否供應冷飲 (cold_available) / 熱飲 (hot_available)。
            - 如果價格是整數 (如 50)，請視為數字。
            - 回傳資料請嚴格遵守定義的 JSON Schema。`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text);
      return res.status(200).json(parsedData);
    } else {
      throw new Error("No data returned from Gemini.");
    }

  } catch (error) {
    console.error('❌ Error processing with Gemini:', error);
    return res.status(500).json({ message: error.message || 'Failed to analyze menu' });
  }
}
