import type { Order } from '../entities';
import type { ConsumerMetadata } from '../interfaces/ConsumerMetadata';
import type { LineItem } from '../interfaces/LineItem';
import { stripe } from '../stripe/key';
import { metadataAddress } from './metadataAddress';

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
		name: order.consumer.name,
		email: order.consumer.email,
		shipping_address: metadataAddress(order.shippingAddress),
		phone: order.consumer.phone
	};

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: lineItems,
		mode: 'payment',
		success_url: 'http://localhost:3000/consumer/orders/success',
		cancel_url: 'http://localhost:3000/consumer/orders/cancel',
		metadata: {
			customer_name: consumer.name,
			customer_email: consumer.email,
			customer_phone: consumer.phone,
			customer_shipping_address: consumer.shipping_address
		}
	});
	// console.log(session);
	return session;
}
