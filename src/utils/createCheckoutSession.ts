import type { Order } from '../entities';
import type { ConsumerMetadata } from '../interfaces/ConsumerMetadata';
import type { LineItem } from '../interfaces/LineItem';
import { stripe } from '../stripe/key';
import { metadataAddress } from './metadataAddress';
// ENV
import { config } from 'dotenv-cra';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config();
export async function createCheckoutSession(order: Order) {
	const lineItems: LineItem[] = order.items.getItems().map((item) => ({
		price_data: {
			currency: 'eur',
			product_data: {
				name: item.producerProduct.productSpec.name,
				description: item.producerProduct.productSpec.description,
				images: item.producerProduct.productSpec.images.getItems().map((image) => image.url)
			},
			unit_amount: item.price * 100
		},
		quantity: item.quantity
	}));

	const consumer: ConsumerMetadata = {
		name: order.consumer.user.name,
		email: order.consumer.user.email,
		shipping_address: metadataAddress(order.shippingAddress),
		phone: order.consumer.user.phone
	};

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: lineItems,
		mode: 'payment',
		success_url: `${process.env.FRONTEND_URL}/orders/${order.id}/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${process.env.FRONTEND_URL}/orders/${order.id}/cancel?session_id={CHECKOUT_SESSION_ID}`,
		metadata: {
			customer_name: consumer.name,
			customer_email: consumer.email,
			customer_phone: consumer.phone,
			customer_shipping_address: consumer.shipping_address,
			order_id: order.id
		}
	});
	// console.log(session);
	return session;
}
