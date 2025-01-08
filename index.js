const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('https://raw.githubusercontent.com/ProCodersEg/sntd/refs/heads/main/saraha-5e7fd-firebase-adminsdk-5hpyg-39079dccfe.json'); // Replace with your JSON file path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = 3000; // Use any desired port

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Endpoint to send a notification
app.post('/send-notification', async (req, res) => {
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
                ...(imageUrl && { image: imageUrl }), // Optional image
            },
            data: {
                customKey: 'customValue', // Optional custom data
            },
        };

        const response = await admin.messaging().send(message);
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
