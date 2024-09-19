import express from 'express';
import { getAuthUrl, getToken, setCredentials } from '../config/googleAuth';
import { createGoogleMeetEvent } from '../controllers/eventController';
import { CustomizedRequest } from '../controllers/userControllers';
import nodeMailer from "nodemailer";
import User from '../models/User';

const router = express.Router();


// Get Google OAuth URL
router.get('/:courseId/auth/google', (req: CustomizedRequest, res) => {
    try {
        const authUrl = getAuthUrl();

        res.redirect(`${authUrl}&state=${encodeURIComponent(req.params.courseId)}`);
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).send('Failed to generate Google OAuth URL.');
    }
});

// OAuth2 Callback
router.get('/auth/google/callback', async (req: CustomizedRequest, res) => {
    const code = req.query.code as string;
    const courseId = req.query.state as string;
    if (code) {
        try {
            const tokens = await getToken(code);
            setCredentials(tokens);

            // Redirect to the desired URL with the courseId
            res.status(200).redirect(`${process.env.CLIENT_API_URL}/course/${courseId}/schedule/google-meet`);

        } catch (error) {
            console.error('Token retrieval error:', error);
            res.status(500).send('Authentication failed.');
        }
    } else {
        res.status(400).send('Invalid request: missing code or courseId.');
    }
});

// Create Google Meet Event
router.post('/create-meet/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    const { summary, description, startTime, endTime } = req.body;
    try {
        const meetLink = await createGoogleMeetEvent(
            summary,
            description,
            new Date(startTime),
            new Date(endTime)
        );

        //test mail sending code 
        // Fetch students enrolled in the course
        const students = await User.find({ courses: courseId });
        if (students.length === 0) {
            return res.status(404).send('No students found for this course.');
        }


        // Create transport for email
        const transport = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_PASS,
            },
        });

        // Email options
        const subject = 'SkillTrack Course - Google Meeting Link';
        const message = `Dear Student,

You have been invited to a Google Meet for your course "${summary}".

Meeting Link: ${meetLink}

Description: ${description}

Date and Time: ${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}

Looking forward to your participation!

Best regards,
SkillTrack Team`;

        // Send email to each student
        const emailPromises = students.map((student) =>
            transport.sendMail({
                from: process.env.MY_EMAIL,
                to: student.email,
                subject,
                text: message,
            })
        );

        // Await all email promises
        await Promise.all(emailPromises);

        res.json({ meetLink });
    } catch (error) {
        console.error('Error creating Google Meet event:', error);
        res.status(500).send('Failed to create Google Meet event.');
    }
});

export default router;
