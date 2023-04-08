import * as Express from 'express';
import { Injectable } from '@decorators/di';
import { Controller, Get, Post, Request, Response } from '@decorators/express';
import { stripe } from '../stripe/key';
import type Stripe from 'stripe';
import { container } from '..';

@Controller('/webhook')
@Injectable()
export class WebhookController {
	@Get('/')
	public getWebhook(@Response() res: Express.Response) {
		res.send('Hello from webhook');
	}

	@Post('/', [Express.raw({ type: 'application/json' })])
	public async receiveStripeWebhook(@Response() res: Express.Response, @Request() req: Express.Request) {
		const endpointSecret = 'whsec_57797f698ea7c798997cb9a4f78b8c729a226c5dd1f966092ccd8f370522d4ef'; // hardcoded for now, should be in .env
		// const sig = req.headers['stripe-signature'] as string;
		const payloadString = JSON.stringify(req.body, null, 2);
		const header = stripe.webhooks.generateTestHeaderString({
			payload: payloadString,
			secret: endpointSecret
		});

		let event;

		try {
			event = await stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
			// console.log(event);
		} catch (err: any) {
			console.log(err);
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}
		// console.log('OLA');

		// Handle the event
		switch (event.type) {
			case 'checkout.session.completed': {
				console.log('checkout.session.completed');
				const session = event.data.object as Stripe.Checkout.Session;
				console.log(session);

				const order = await container.orderGateway.findByIdPopulated(Number(session.metadata?.order_id));

				if (order) {
					const consumerId = order.consumer.id;
					const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
					if (consumer) {
						await container.consumerGateway.deleteCart(consumer);
						order.addFirstShipmentEvent();
						await container.orderGateway.updateOrder(order);
					} else {
						console.log('Consumer not found');
					}
				} else {
					console.log('Order not found');
				}

				break;
			}
			case 'checkou.session.expired': {
				console.log('checkout.session.expired');
				const session = event.data.object as Stripe.Checkout.Session;
				console.log(session);
				break;
			}
		}

		// Return a 200 response to acknowledge receipt of the event
		res.send();
	}
}
