import { faker } from '@faker-js/faker';
import { OrderItem } from '../../entities';
import { generateRandomOrder } from './order';

export const generateRandomOrderItem = (): OrderItem => {
	const orderItem = new OrderItem();
	orderItem.order = generateRandomOrder();
	orderItem.producerProduct = generateRandomProducerProduct();
	orderItem.quantity = faker.datatype.number(2);
	orderItem.price = orderItem.producerProduct.currentPrice;
	orderItem.shipment = generateRandomShipment();
	return orderItem;
};
