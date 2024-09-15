import express, { Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';
import { CustomizedRequest } from '../controllers/userControllers';
import jwtAuthMiddleware from '../middlewares/jwtAuth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2024-06-20',
});

const router = express.Router();

// Create a payment intent
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

        user?.courses.push(courseId)
        await user?.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Unable to create payment intent' });
    }
});

export default router;

//this is the payment integration code 