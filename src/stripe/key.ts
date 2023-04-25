import Stripe from 'stripe';
// ENV
import { config } from 'dotenv-cra';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config();

export const stripe = new Stripe(process.env.STRIPE_KEY as string, {
	apiVersion: '2022-11-15'
});
