
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    console.error("❌ Error: GOOGLE_SCRIPT_URL missing in Env Vars");
    return res.status(500).json({ message: 'Server configuration error: GOOGLE_SCRIPT_URL not set' });
  }

  try {
    // Forward the update payload to Google Sheets
    // We expect the body to have { action: 'update_menu', ... }
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    if (!response.ok) {
        throw new Error(`Google API status: ${response.status}`);
    }

    const text = await response.text();
    let result;
    try {
        result = JSON.parse(text);
    } catch (e) {
        console.error("Non-JSON response from Google Script:", text);
        return res.status(502).json({ success: false, message: "Invalid response from Google Script (Check deployment version)" });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error updating menu:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
