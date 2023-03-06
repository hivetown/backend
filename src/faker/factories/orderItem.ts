import { faker } from '@faker-js/faker';
import { Order, OrderItem, ProducerProduct, Shipment } from '../../entities';

export const generateRandomOrderItem = (order: Order, producerProduct: ProducerProduct, shipment: Shipment): OrderItem => {
	const orderItem = new OrderItem();
	// AVOID CIRCULAR DEPENDENCIES
	// orderItem.order = generateRandomOrder();
	orderItem.order = order;
	// AVOID CIRCULAR DEPENDENCIES
	// orderItem.producerProduct = generateRandomProducerProduct();
	orderItem.producerProduct = producerProduct;

	orderItem.quantity = faker.datatype.number(13);
	orderItem.price = orderItem.producerProduct.currentPrice;
	// AVOID CIRCULAR DEPENDENCIES
	// orderItem.shipment = generateRandomShipment();
	orderItem.shipment = shipment;

	return orderItem;
};
