
export default async function handler(req, res) {
  // 1. Ensure GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Read from Server Environment Variable
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    console.error("❌ Error: GOOGLE_SCRIPT_URL missing in Env Vars");
    return res.status(500).json({ message: 'Server configuration error: GOOGLE_SCRIPT_URL not set' });
  }

  try {
    // 3. Call Google Apps Script (doGet)
    // Add timestamp to prevent caching
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);

    if (!response.ok) {
        throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache for 60 seconds to reduce load on Google Sheets
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    return res.status(500).json({ message: 'Failed to fetch store data.' });
  }
}
