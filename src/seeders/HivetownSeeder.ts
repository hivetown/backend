import type { EntityManager } from '@mikro-orm/core';
import { faker, Seeder } from '@mikro-orm/seeder';
import _ from 'lodash';
import { ProductSpecFactory } from './factories/ProductSpec';
import { ProductSpecCategoryFactory } from './factories/ProductSpecCategory';
import { CategoryFactory } from './factories/Category';
import { FieldFactory } from './factories/Field';
import { FieldType } from '../enums';
import { ProductSpecFieldFactory } from './factories/ProductSpecField';
import { FieldPossibleValueFactory } from './factories/FieldPossibleValue';
import { ProductionUnitFactory } from './factories/ProductionUnit';
import { ShipmentFactory } from './factories/Shipment';
import { ProducerProductFactory } from './factories/ProducerProduct';
import { AddressFactory } from './factories/Address';
import { ConsumerFactory } from './factories/Consumer';
import { CartItemFactory } from './factories/CartItem';
import { OrderFactory } from './factories/Order';
import { OrderItemFactory } from './factories/OrderItem';
import { ShipmentEventFactory } from './factories/ShipmentEvent';
import { ShipmentStatusFactory } from './factories/ShipmentStatus';
import { ProducerFactory } from './factories/Producer';
import { CarrierFactory } from './factories/Carrier';

export class HivetownSeeder extends Seeder {
	public async run(em: EntityManager): Promise<void> {
		const productSpecFactory = new ProductSpecFactory(em);
		const productSpecCategoryFactory = new ProductSpecCategoryFactory(em);
		const categoryFactory = new CategoryFactory(em);
		const fieldFactory = new FieldFactory(em);
		const productSpecFieldFactory = new ProductSpecFieldFactory(em);
		const producerFactory = new ProducerFactory(em);
		const productionUnitFactory = new ProductionUnitFactory(em);
		const producerProductFactory = new ProducerProductFactory(em);
		const addressFactory = new AddressFactory(em);
		const consumerFactory = new ConsumerFactory(em);
		const cartItemFactory = new CartItemFactory(em);
		const orderFactory = new OrderFactory(em);
		const orderItemFactory = new OrderItemFactory(em);
		const shipmentFactory = new ShipmentFactory(em);
		const shipmentEventFactory = new ShipmentEventFactory(em);
		const shipmentStatusFactory = new ShipmentStatusFactory(em);
		const carrierFactory = new CarrierFactory(em);

		// We create some fields to use on the Categories
		const fields = await fieldFactory
			.each((field) => {
				// 5% chance of having possible values
				const amount = faker.datatype.number(100);
				if (amount < 5) {
					field.type = FieldType.Enum;
					field.possibleValues.set(new FieldPossibleValueFactory(em).make(faker.datatype.number({ min: 2, max: 5 })));
				}
			})
			.create(120);

		// We create some Categories that use some of the Fields
		const categories = await categoryFactory
			.each((category) => {
				// TODO category parents
				category.fields.set(faker.helpers.arrayElements(fields, faker.datatype.number({ min: 3, max: 8 })));
			})
			.create(500);

		// We create some productSpecs that use some of the Categories
		const productSpecs = await productSpecFactory
			.each((spec) => {
				spec.categories.set(
					faker.helpers.arrayElements(categories, faker.datatype.number({ min: 3, max: 8 })).map((category) =>
						productSpecCategoryFactory.makeOne({
							category: category.id
						})
					)
				);
			})
			.create(1500);

		// We wait for the productSpecs to be created so we can link them to the Category fields (it's a 3 way relationship)
		productSpecs.forEach((spec) => {
			spec.categories.getItems().forEach((specCategory) => {
				specCategory.category.fields.getItems().map((field) =>
					productSpecFieldFactory.makeOne({
						field: field.id,
						productSpecCategory: { category: specCategory.category.id, productSpec: spec.id }
					})
				);
			});
		});

		// We create some producers
		const producers = await producerFactory
			.each((producer) => {
				producer.productionUnits.set(
					productionUnitFactory
						.each((pUnit) => {
							pUnit.address = addressFactory.makeOne();
							pUnit.carriers.set(carrierFactory.make(10));
						})
						.make(7)
				);
			})
			.create(300);

		// We wait for the production units to be created so we can create some producer products
		producers.forEach((producer) => {
			producer.productionUnits.getItems().forEach((pUnit) => {
				pUnit.products.set(
					producerProductFactory
						.each((pProduct) => {
							pProduct.productSpec = faker.helpers.arrayElement(productSpecs);
							pProduct.producer = producer;
						})
						.make(70)
				);
			});
		});

		// We create some consumers
		const consumers = await consumerFactory
			.each((consumer) => {
				consumer.addresses.set(addressFactory.make(3));
				consumer.cartItems.set(
					cartItemFactory
						.each((cartItem) => {
							const randomProducer = faker.helpers.arrayElement(producers);
							const randomProductionUnit = faker.helpers.arrayElement(randomProducer.productionUnits.getItems());
							const randomProducerProduct = faker.helpers.arrayElement(randomProductionUnit.products.getItems());
							cartItem.product = randomProducerProduct;
						})
						.make(13)
				);
				consumer.orders.set(
					orderFactory
						.each((order) => {
							// 25% chance of address being different from consumer address
							const amount = faker.datatype.number(100);
							if (amount < 25) {
								order.shippingAddress = addressFactory.makeOne();
							} else {
								// Otherwise we use one of the consumer addresses
								order.shippingAddress = faker.helpers.arrayElement(consumer.addresses.getItems());
							}
						})
						.make(13)
				);
			})
			.create(600);

		const shipmentStatuses = await shipmentStatusFactory.create(15);

		// We wait for the consumers to be created so we can add orderitems to the orders
		consumers.forEach((consumer) => {
			consumer.orders.getItems().forEach((order) => {
				// For each order we create some order items.
				order.items.set(
					orderItemFactory
						.each((orderItem) => {
							const randomProducer = faker.helpers.arrayElement(producers);
							const randomProductionUnit = faker.helpers.arrayElement(randomProducer.productionUnits.getItems());
							const randomProducerProduct = faker.helpers.arrayElement(randomProductionUnit.products.getItems());
							orderItem.producerProduct = randomProducerProduct;
						})
						.make(13)
				);

				// We create shipments for each order item
				_(order.items.getItems())
					// We group the order items by production unit
					.groupBy((orderItem) => orderItem.producerProduct.productionUnit.id)
					// We iterate over the groups
					.forEach((orderItems) => {
						// Create a carrier for each group of order items from the same production unit
						const { productionUnit } = orderItems[0].producerProduct;
						const carrier = faker.helpers.arrayElement(productionUnit.carriers.getItems());

						// We iterate over each order item in the group
						orderItems.forEach((orderItem) => {
							// Create the shipment for each order item
							orderItem.shipment = shipmentFactory
								.each((shipment) => {
									shipment.carrier = carrier;
									shipment.events.set(
										shipmentEventFactory
											.each((event) => {
												event.shipmentStatus = faker.helpers.arrayElement(shipmentStatuses);
												event.address = addressFactory.makeOne();
											})
											.make(3)
									);
								})
								.makeOne();
						});
					});
			});
		});

		// Flush the changes to the database
		await em.flush();
	}
}
