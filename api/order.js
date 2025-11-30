export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    console.error("❌ Critical Error: GOOGLE_SCRIPT_URL is missing in Vercel Environment Variables.");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const order = req.body;

  // Validation
  if (!order || !order.items || !Array.isArray(order.items)) {
    return res.status(400).json({ message: 'Invalid order data: No items found.' });
  }

  if (order.items.length > 50) {
    return res.status(400).json({ message: 'Order too large. Please contact staff directly.' });
  }

  if (!order.customerName || !order.customerPhone) {
     return res.status(400).json({ message: 'Missing customer information.' });
  }

  console.log(`📝 Order: ${order.customerName} - $${order.totalAmount}`);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    if (!response.ok) {
        throw new Error(`Google API status: ${response.status}`);
    }

    console.log("✅ Order forwarded.");
    return res.status(200).json({ success: true, message: 'Order forwarded successfully' });

  } catch (error) {
    console.error('❌ Error forwarding order:', error);
    return res.status(500).json({ message: 'Failed to submit order to database.' });
  }
}