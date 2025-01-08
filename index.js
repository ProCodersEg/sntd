import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app;
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Serverless function to send notifications
export default async function handler(req, res) {
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
