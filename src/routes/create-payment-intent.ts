import express, { Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';
import { CustomizedRequest } from '../controllers/userControllers';
import jwtAuthMiddleware from '../middlewares/jwtAuth';
import Course from '../models/Course';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2024-06-20',
});

const router = express.Router();

// Create a payment intent
// router.post('/api/create-payment-intent', jwtAuthMiddleware, async (req: CustomizedRequest, res: Response) => {
//     const { amount, courseId } = req.body;

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount), // Amount in smallest currency unit (e.g., paise)
//             currency: 'inr',
//             payment_method_types: ['card'],
//             metadata: { courseId }, // Attach metadata to track which course the payment is for
//         });
//         const user = await User.findById(req.user?.id);

//         user?.courses.push(courseId)
//         await user?.save();

//         //store Enrolled student in course 
//         const course = await Course.findById(courseId);

//         course?.enrollments.push(user?.id);
//         await course?.save();

//         res.status(200).json({ clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ error: 'Unable to create payment intent' });
//     }
// });
router.post('/api/create-payment-intent', jwtAuthMiddleware, async (req: CustomizedRequest, res: Response) => {
    const { amount, courseId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount in smallest currency unit (e.g., paise)
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: { courseId }, // Attach metadata to track which course the payment is for
        });

        const user = await User.findById(req.user?.id);

        // Check if user is already enrolled in the course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.enrollments.includes(user?.id)) {
            return res.status(400).json({ error: 'You are already enrolled in this course' });
        }

        // Enroll the user in the course
        user?.courses.push(courseId);
        await user?.save();

        // Add the user to course enrollments
        course.enrollments.push(user?.id);
        await course.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Unable to create payment intent' });
    }
});


router.post('/api/instructor/create-payment-intent', async (req: CustomizedRequest, res: Response) => {
    const { amount, description } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount in smallest currency unit (e.g., paise)
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: { description }, // Attach metadata to track which course the payment is for
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Unable to create payment intent' });
    }
});

export default router;

//this is the payment integration code 