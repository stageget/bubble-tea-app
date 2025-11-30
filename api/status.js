
export default async function handler(req, res) {
  // 1. 確保只接受 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. 從伺服器環境變數讀取 Google Script URL
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // 3. 呼叫 Google Apps Script (它會執行 doGet)
    // 加上 timestamp 防止 Vercel 快取
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);

    if (!response.ok) {
        throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // 設定 Cache-Control，讓前端不要太頻繁打 API (例如快取 60 秒)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    return res.status(500).json({ message: 'Failed to fetch store status.' });
  }
}
