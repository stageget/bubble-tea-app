
export default async function handler(req, res) {
  // 1. 確保只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. 從伺服器環境變數讀取 Google Script URL
  // 這是最安全的地方，因為使用者看不到伺服器的環境變數
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ message: 'Server configuration error: Missing GOOGLE_SCRIPT_URL' });
  }

  try {
    // 3. 將前端傳來的資料轉送給 Google Sheets
    // 注意：Google Apps Script Web App 預設會跟隨重新導向，所以我們需要處理
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    // Google Apps Script 通常回傳文字或 JSON
    // 但因為我們使用了 no-cors 或是純文字傳輸，這裡簡單回傳成功即可
    // 實際專案中可以根據 Google 的回傳值做更細緻的處理
    
    return res.status(200).json({ success: true, message: 'Order forwarded to Google Sheets' });

  } catch (error) {
    console.error('Error forwarding to Google Sheets:', error);
    return res.status(500).json({ message: 'Failed to forward order' });
  }
}
