import type { EntityManager } from '@mikro-orm/core';
import { faker, Seeder } from '@mikro-orm/seeder';
import _ from 'lodash';
import { ProductSpecFactory } from './factories/ProductSpec';
import { ProductSpecCategoryFactory } from './factories/ProductSpecCategory';
import { CategoryFactory } from './factories/Category';
import { FieldFactory } from './factories/Field';
import { FieldType, ShipmentStatus } from '../enums';
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
import { ProducerFactory } from './factories/Producer';
import { CarrierFactory } from './factories/Carrier';
import { ImageFactory } from './factories/Image';
import type { ProducerProduct } from '../entities';

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
		const carrierFactory = new CarrierFactory(em);
		const imageFactory = new ImageFactory(em);

		console.log('Seeding Hivetown...');
		console.log('Generating fields...');
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

		console.log('Generating categories...');
		// We create some Categories that use some of the Fields
		const categories = await categoryFactory
			.each((category) => {
				// TODO category parents
				category.fields.set(faker.helpers.arrayElements(fields, faker.datatype.number({ min: 3, max: 8 })));
				category.image = imageFactory.makeOne();
			})
			.create(500);

		console.log('Generating product specs...');
		// We create some productSpecs that use some of the Categories
		const productSpecs = await productSpecFactory
			.each((spec) => {
				spec.images.set(imageFactory.make(faker.datatype.number({ min: 0, max: 5 })));
				spec.categories.set(
					faker.helpers.arrayElements(categories, faker.datatype.number({ min: 3, max: 8 })).map((category) =>
						productSpecCategoryFactory.makeOne({
							category: category.id
						})
					)
				);
			})
			.create(1500);

		console.log("Generating product specs' category fields...");
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

		console.log('Generating producers...');
		// We create some producers
		const producers = await producerFactory
			.each((producer) => {
				producer.image = imageFactory.makeOne();
				producer.images.set(imageFactory.make(faker.datatype.number({ min: 0, max: 10 })));

				producer.productionUnits.set(
					productionUnitFactory
						.each((pUnit) => {
							pUnit.images.set(imageFactory.make(faker.datatype.number({ min: 0, max: 10 })));
							pUnit.address = addressFactory.makeOne();
							pUnit.carriers.set(
								carrierFactory
									.each((carrier) => {
										carrier.image = imageFactory.makeOne();
									})
									.make(faker.datatype.number({ min: 0, max: 10 }))
							);
						})
						.make(faker.datatype.number({ min: 0, max: 8 }))
				);
			})
			.create(300);

		console.log("Generating producers' products...");
		// We wait for the production units to be created so we can create some producer products
		producers.forEach((producer) => {
			producer.productionUnits.getItems().forEach((pUnit) => {
				pUnit.products.set(
					producerProductFactory
						.each((pProduct) => {
							pProduct.productSpec = faker.helpers.arrayElement(productSpecs);
							pProduct.producer = producer;
						})
						.make(faker.datatype.number({ min: 0, max: 70 }))
				);
			});
		});
		await em.persistAndFlush(producers);

		// Filter for producers that have products
		console.log('Filtering producers with products...');
		const producersWithProducts = producers
			.filter((producer) =>
				producer.productionUnits.getItems().some((pUnit) => pUnit.products.getItems().length > 0 && pUnit.carriers.getItems().length > 0)
			)
			.map((producer) => ({
				...producer,
				validProductionUnits: producer.productionUnits
					.getItems()
					.filter((pUnit) => pUnit.products.getItems().length > 0 && pUnit.carriers.getItems().length > 0)
			}));
		console.log(`Found ${producersWithProducts.length} producers with products.`);

		// If there are no producers with products, we create one
		if (!producersWithProducts.length) {
			throw new Error('No producers with products found. Aborting...');
			// TODO: instead of throwing an error, create a producer with products
			//  problem: it errors, so I'm not going to bother with it for now

			// console.log('Creating a producer with products...');
			// // Create a production unit if there are none
			// const producer = producers[0];
			// if (!producer.productionUnits.count())
			// 	producer.productionUnits.add(
			// 		productionUnitFactory
			// 			.each((pUnit) => {
			// 				pUnit.images.set(imageFactory.make(faker.datatype.number({ min: 0, max: 10 })));
			// 				pUnit.address = addressFactory.makeOne();
			// 				pUnit.carriers.set(
			// 					carrierFactory
			// 						.each((carrier) => {
			// 							carrier.image = imageFactory.makeOne();
			// 						})
			// 						.make(faker.datatype.number({ min: 0, max: 10 }))
			// 				);
			// 				pUnit.products.set(
			// 					producerProductFactory
			// 						.each((pProduct) => {
			// 							pProduct.productSpec = faker.helpers.arrayElement(productSpecs);
			// 							pProduct.producer = producer;
			// 						})
			// 						.make(faker.datatype.number({ min: 1, max: 70 }))
			// 				);
			// 			})
			// 			.makeOne()
			// 	);

			// await em.persistAndFlush(producer);

			// producersWithProducts.push(producer);
		}

		console.log('Generating consumers...');
		// We create some consumers
		const consumers = await consumerFactory
			.each((consumer) => {
				consumer.addresses.set(addressFactory.make(faker.datatype.number({ min: 1, max: 5 })));
				consumer.image = imageFactory.makeOne();

				// Keep track of the cart items so we don't have collisions
				console.log(`Generating cart items for ${consumer.name}`);

				console.log(`Generating orders for ${consumer.name}`);
				consumer.orders.set(
					orderFactory
						.each((order) => {
							console.log(`Adding order`);
							// 25% chance of address being different from consumer address
							const amount = faker.datatype.number(100);
							if (amount < 25) {
								order.shippingAddress = addressFactory.makeOne();
							} else {
								// Otherwise we use one of the consumer addresses
								order.shippingAddress = faker.helpers.arrayElement(consumer.addresses.getItems());
							}
						})
						.make(faker.datatype.number({ min: 1, max: 13 }))
				);
			})
			.create(600);

		console.log('Generating cart items for consumers...');
		consumers.forEach((consumer) => {
			const cartItems = new Set();
			consumer.cartItems.set(
				cartItemFactory
					.each((cartItem) => {
						// We need a do while loop because we need to make sure we have a product
						// that is not already in the cart

						let producerProduct: ProducerProduct;
						do {
							const randomProducer = faker.helpers.arrayElement(producersWithProducts);
							const randomProductionUnit = faker.helpers.arrayElement(randomProducer.validProductionUnits);
							producerProduct = faker.helpers.arrayElement(randomProductionUnit.products.getItems());
						} while (cartItems.has(producerProduct.id));

						cartItem.producerProduct = producerProduct;
						cartItems.add(producerProduct.id);
					})
					.make(faker.datatype.number({ min: 0, max: 17 }))
			);
		});
		await em.persistAndFlush(consumers);

		console.log('Generating shipment statuses...');
		// const shipmentStatuses = await shipmentStatusFactory.create(15);

		console.log("Generating consumers' order items...");
		consumers.forEach((consumer) => {
			consumer.orders.getItems().forEach((order) => {
				// Keep track of the cart items so we don't have collisions
				const orderItems = new Set();
				// For each order we create some order items.
				order.items.set(
					orderItemFactory
						.each((orderItem) => {
							// We need a do while loop because we need to make sure we have a product
							// that is not already in the cart
							do {
								const randomProducer = faker.helpers.arrayElement(producersWithProducts);
								const randomProductionUnit = faker.helpers.arrayElement(randomProducer.validProductionUnits);
								const randomProducerProduct = faker.helpers.arrayElement(randomProductionUnit.products.getItems());

								// We check if the order item already exists
								if (!orderItems.has(randomProducerProduct.id)) {
									orderItem.producerProduct = randomProducerProduct;
									orderItems.add(randomProducerProduct.id);
								}
							} while (!orderItem.producerProduct);
						})
						.make(faker.datatype.number({ min: 1, max: 13 }))
				);
			});
		});

		console.log('Removing invalid orders');
		consumers.forEach((consumer) => {
			consumer.orders.remove((order) => order.items.getItems().some((item) => !item.producerProduct));
		});

		console.log("Generating consumers' orders' items...");
		// We wait for the consumers to be created so we can add orderitems to the orders
		consumers.forEach((consumer) => {
			consumer.orders.getItems().forEach((order) => {
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
												event.address = addressFactory.makeOne();
												event.status = faker.helpers.arrayElement(
													Object.values(ShipmentStatus)
														.filter((item) => typeof item === 'number')
														.map((item) => Number(item))
												);
											})
											.make(faker.datatype.number({ min: 1, max: 5 }))
									);
								})
								.makeOne();
						});
					});
			});
		});

		console.log('Flushing...');
		// Flush the changes to the database
		await em.flush();
	}
}
