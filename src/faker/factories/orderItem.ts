import { faker } from '@faker-js/faker';
import { Order, OrderItem } from '../../entities';
import { generateRandomProducerProduct } from './producerProduct';
import { generateRandomShipment } from './shipment';

export const generateRandomOrderItem = (order: Order): OrderItem => {
	const orderItem = new OrderItem();
	// AVOID CIRCULAR DEPENDENCIES
	// orderItem.order = generateRandomOrder();
	orderItem.order = order;
	orderItem.producerProduct = generateRandomProducerProduct();
	orderItem.quantity = faker.datatype.number(13);
	orderItem.price = orderItem.producerProduct.currentPrice;
	orderItem.shipment = generateRandomShipment();
	return orderItem;
};
