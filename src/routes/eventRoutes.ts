import express from 'express';
import { getAuthUrl, getToken, setCredentials } from '../config/googleAuth';
import { createGoogleMeetEvent } from '../controllers/eventController';

const router = express.Router();

// Get Google OAuth URL
router.get('/auth/google', (req, res) => {
    try {
        const authUrl = getAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).send('Failed to generate Google OAuth URL.');
    }
});

// OAuth2 Callback
router.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code as string;
    if (code) {
        try {
            const tokens = await getToken(code);
            setCredentials(tokens);
            res.send('Authentication successful! You can now create events.');
        } catch (error) {
            console.error('Token retrieval error:', error);
            res.status(500).send('Authentication failed.');
        }
    } else {
        res.status(400).send('No code provided.');
    }
});

// Create Google Meet Event
router.post('/create-meet', async (req, res) => {
    const { summary, description, startTime, endTime } = req.body;
    try {
        const meetLink = await createGoogleMeetEvent(
            summary,
            description,
            new Date(startTime),
            new Date(endTime)
        );
        res.json({ meetLink });
    } catch (error) {
        console.error('Error creating Google Meet event:', error);
        res.status(500).send('Failed to create Google Meet event.');
    }
});

export default router;
