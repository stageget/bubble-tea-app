
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;
  
  // Read credentials from Vercel Environment Variables
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
     console.error("❌ Error: Admin credentials not set in Vercel Environment Variables.");
     return res.status(500).json({ message: 'Server configuration error: Credentials missing' });
  }

  if (username === adminUser && password === adminPass) {
    // Return success
    return res.status(200).json({ 
        success: true, 
        role: 'Administrator',
        username: username 
    });
  } else {
    // Return unauthorized
    return res.status(401).json({ message: 'Invalid username or password' });
  }
}
