import * as Express from 'express';
import { Injectable } from '@decorators/di';
import { Controller, Get, Post, Request, Response } from '@decorators/express';
import { stripe } from '../stripe/key';
import type Stripe from 'stripe';
import { container } from '..';
import { ShipmentStatus } from '../enums';

@Controller('/webhook')
@Injectable()
export class WebhookController {
	@Get('/')
	public getWebhook(@Response() res: Express.Response) {
		res.send('Hello from webhook');
	}

	@Post('/', [Express.raw({ type: 'application/json' })])
	public async receiveStripeWebhook(@Response() res: Express.Response, @Request() req: Express.Request) {
		const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
		// const sig = req.headers['stripe-signature'] as string;
		const payloadString = JSON.stringify(req.body, null, 2);
		const header = stripe.webhooks.generateTestHeaderString({
			payload: payloadString,
			secret: endpointSecret
		});

		let event;

		try {
			event = await stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
		} catch (err: any) {
			console.log(err);
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}
		// console.log('OLA');

		// Handle the event
		// console.log(event.type);
		switch (event.type) {
			case 'checkout.session.completed': {
				console.log('checkout.session.completed');
				const session = event.data.object as Stripe.Checkout.Session;
				// console.log(session);

				const order = await container.orderGateway.findByIdPopulated(Number(session.metadata?.order_id));

				if (order) {
					const consumerId = order.consumer.id;
					const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
					if (consumer) {
						await container.cartItemGateway.delete(consumer.cartItems.getItems());
						order.addShipmentEvent(ShipmentStatus.Paid, order.shippingAddress);
						order.payment = session.payment_intent as string;
						await container.orderGateway.updateOrder(order);
					} else {
						console.log('Consumer not found');
					}
				} else {
					console.log('Order not found');
				}

				break;
			}
			case 'checkout.session.expired': {
				console.log('checkout.session.expired');
				const session = event.data.object as Stripe.Checkout.Session;
				const order = await container.orderGateway.findById(Number(session.metadata?.order_id));
				let consumerId;
				if (order) {
					consumerId = order.consumer.id;
					await container.orderGateway.deleteOrder(order);
				}
				if (consumerId) {
					const consumer = await container.consumerGateway.findByIdWithCartAndProducts(consumerId);
					if (consumer) {
						for (const item of consumer.cartItems.getItems()) {
							item.producerProduct.stock += item.quantity;
						}
						await container.consumerGateway.updateCart(consumer);
					} else {
						console.log('Consumer not found');
					}
				}

				break;
			}
		}

		// Return a 200 response to acknowledge receipt of the event
		res.send();
	}
}
