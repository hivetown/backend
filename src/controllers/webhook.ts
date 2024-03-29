import * as Express from 'express';
import { Injectable } from '@decorators/di';
import { Controller, Get, Post, Request, Response } from '@decorators/express';
import { stripe } from '../stripe/key';
import type Stripe from 'stripe';
import { container } from '..';
import { ShipmentStatus } from '../enums';
import { NotFoundError } from '../errors/NotFoundError';

// ENV
import { config } from 'dotenv-cra';
import { Notification } from '../entities';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config();

@Controller('/webhook')
@Injectable()
export class WebhookController {
	@Get('/')
	public getWebhook(@Response() res: Express.Response) {
		res.send('Hello from webhook');
	}

	@Post('/', [Express.raw({ type: 'application/json' })])
	public async receiveStripeWebhook(@Response() res: Express.Response, @Request() req: Express.Request) {
		const endpointSecret = process.env.STRIPE_WEBHOOK as string;

		const payloadString = JSON.stringify(req.body, null, 2);
		const header = stripe.webhooks.generateTestHeaderString({
			payload: payloadString,
			secret: endpointSecret
		});

		const event = await stripe.webhooks.constructEvent(payloadString, header, endpointSecret);

		// Handle the event
		// console.log(event.type);
		switch (event.type) {
			case 'checkout.session.completed': {
				console.log('checkout.session.completed');
				const session = event.data.object as Stripe.Checkout.Session;
				// console.log(session);

				const order = await container.orderGateway.findByIdPopulated(Number(session.metadata?.order_id));

				if (order) {
					const consumerId = order.consumer.user.id;
					const consumer = await container.consumerGateway.findByIdWithCart(consumerId);
					if (consumer) {
						await container.cartItemGateway.delete(consumer.cartItems.getItems());
						order.addShipmentEvent(ShipmentStatus.Paid, order.shippingAddress);
						order.payment = session.payment_intent as string;
						await container.orderGateway.updateOrder(order);

						for (const item of order.items.getItems()) {
							const notification = await Notification.create(
								consumer.user,
								item.producerProduct.producer.user,
								'New order',
								`You have a new order from ${consumer.user.name} for ${item.quantity} ${item.producerProduct.productSpec.name} (${item.producerProduct.productionUnit.name})`
							);
							await container.notificationGateway.create(notification);
						}
					} else {
						throw new NotFoundError('Consumer not found');
					}
				} else {
					throw new NotFoundError('Order not found');
				}

				break;
			}
			case 'checkout.session.expired': {
				console.log('checkout.session.expired');
				const session = event.data.object as Stripe.Checkout.Session;
				const order = await container.orderGateway.findById(Number(session.metadata?.order_id));
				let consumerId;
				if (order) {
					consumerId = order.consumer.user.id;
					await container.orderGateway.deleteOrder(order);
				}
				if (consumerId) {
					const consumer = await container.consumerGateway.findByIdWithCartAndProducts(consumerId);
					if (consumer) {
						for (const item of consumer.cartItems.getItems()) {
							item.producerProduct.stock += item.quantity;
						}
						await container.consumerGateway.update(consumer);
					} else {
						throw new NotFoundError('Consumer not found');
					}
				}

				break;
			}
		}

		// Return a 200 response to acknowledge receipt of the event
		res.send();
	}
}
