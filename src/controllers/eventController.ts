import { calendar_v3 } from 'googleapis';
import { calendar } from '../config/googleAuth';

export const createGoogleMeetEvent = async (
    summary: string,
    description: string,
    startTime: Date,
    endTime: Date
): Promise<string | null> => {
    const event: calendar_v3.Schema$Event = {
        summary,
        description,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Asia/Kolkata',
        },
        conferenceData: {
            createRequest: {
                requestId: 'sample123', // Use a unique requestId, you can also use uuid for generating unique IDs
                conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                },
            },
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1, // Required for Google Meet
        });

        if (response.data?.hangoutLink) {
            return response.data.hangoutLink; // Return Google Meet link
        } else {
            throw new Error('No Google Meet link found in the response.');
        }
    } catch (error) {
        console.error('Error creating Google Meet event:', error);
        throw new Error('Failed to create Google Meet event.');
    }
};
