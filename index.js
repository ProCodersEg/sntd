import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app;
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    console.error("Firebase service account environment variable is missing.");
    process.exit(1); // Exit the process if the environment variable is missing
  }

  try {
    const parsedServiceAccount = JSON.parse(serviceAccount); // Parse the JSON content
    admin.initializeApp({
      credential: admin.credential.cert(parsedServiceAccount),
    });
  } catch (error) {
    console.error("Failed to parse the Firebase service account key:", error);
    process.exit(1); // Exit the process if JSON parsing fails
  }
}

// Serverless function to send notifications
export default async function handler(req, res) {
  // Allow cross-origin requests (CORS headers)
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can restrict this to your front-end domain
  res.setHeader('Access-Control-Allow-Methods', 'POST'); // Only allow POST requests
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow content-type header for POST requests
  
  // Handle OPTIONS request for preflight check (CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, title, body, imageUrl } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Token, title, and body are required.' });
  }

  try {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
        ...(imageUrl && { image: imageUrl }),
      },
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
