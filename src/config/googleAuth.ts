import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


// Generate an authentication URL
export const getAuthUrl = () => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
    return authUrl;
};


// Get access token from the code
export const getToken = async (code: string) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return tokens;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw new Error('Failed to retrieve token.');
    }
};

// Set credentials manually (when you already have tokens)
export const setCredentials = (tokens: any) => {
    oauth2Client.setCredentials(tokens);
};

// Create the calendar API client
export const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
