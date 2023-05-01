import type { EntityManager } from '@mikro-orm/core';
import { faker, Seeder } from '@mikro-orm/seeder';
import _ from 'lodash';
import { ProductSpecFactory } from './factories/ProductSpec';
import { ProductSpecCategoryFactory } from './factories/ProductSpecCategory';
import { CategoryFactory } from './factories/Category';
import { ShipmentStatus, UserType } from '../enums';
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
import { UserFactory } from './factories/User';
import { ProducerProduct, ProductSpecField } from '../entities';
import { createFields } from './factories/Field';
import { generateImageUrl, generateValueFromField } from './helpers';

export class HivetownSeeder extends Seeder {
	public async run(em: EntityManager): Promise<void> {
		faker.setLocale('pt_PT');
		const productSpecFactory = new ProductSpecFactory(em);
		const productSpecCategoryFactory = new ProductSpecCategoryFactory(em);
		const categoryFactory = new CategoryFactory(em);
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
		const userFactory = new UserFactory(em);

		console.log('Seeding Hivetown...');
		console.log('Generating fields...');
		// We create some fields to use on the Categories
		const fields = createFields(em);
		await em.persistAndFlush(fields);

		console.log('Generating categories...');
		// We create some Categories that use some of the Fields
		const categories = await categoryFactory
			.each((category) => {
				category.fields.set(faker.helpers.arrayElements(fields, faker.datatype.number({ min: 3, max: 8 })));
			})
			.create(500);

		console.log('Setting some categories with parents...');
		categories.forEach((category) => {
			// 5% nof being root category
			if (faker.datatype.number({ min: 1, max: 100 }) <= 5) return;

			// The remaining 95% get a random parent
			const parent = faker.helpers.arrayElement(categories);
			if (parent.id !== category.id) category.parent = parent;
		});

		console.log('Generating product specs...');
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

		console.log("Generating product specs' category fields...");
		// We wait for the productSpecs to be created so we can link them to the Category fields (it's a 3 way relationship)
		productSpecs.forEach((spec) => {
			spec.categories.getItems().forEach((specCategory) => {
				specCategory.category.fields.getItems().map((field) =>
					em.create(ProductSpecField, {
						field: field.id,
						productSpecCategory: { category: specCategory.category.id, productSpec: spec.id },
						value: generateValueFromField(field)
					})
				);
			});
		});

		console.log('Generating users...');
		// We create some users
		const users = await userFactory.create(1000);

		console.log('Generating producers...');
		// We create some producers
		// Pick 400 users to be producers
		const producerUsers = users.splice(0, 400);
		const producers = await producerUsers.map((user) => producerFactory.makeOne({ user }));
		await em.persistAndFlush(producers);

		producers.forEach((producer) => {
			// Set the producer's image and type to be a producer
			producer.user.image!.url = generateImageUrl('shop');
			producer.user.type = UserType.Producer;

			producer.productionUnits.set(
				productionUnitFactory
					.each((pUnit) => {
						pUnit.address = addressFactory.makeOne();
						pUnit.carriers.set(carrierFactory.make(faker.datatype.number({ min: 0, max: 10 })));

						pUnit.name = `${producer.user.name} - ${pUnit.address.street} ${pUnit.address.city}`;

						pUnit.products.set(
							producerProductFactory
								.each((pProduct) => {
									pProduct.productSpec = faker.helpers.arrayElement(productSpecs);
									pProduct.producer = producer;
								})
								.make(faker.datatype.number({ min: 0, max: 70 }))
						);
					})
					.make(faker.datatype.number({ min: 0, max: 8 }))
			);

			return producer;
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
		console.log(`Found ${producersWithProducts.length}/${producers.length} producers with products.`);

		// If there are no producers with products, we create one
		if (!producersWithProducts.length) {
			throw new Error('No producers with products found. Aborting...');
			// TODO: instead of throwing an error, create a producer with products
			//  problem: it errors, so I'm not going to bother with it for now
		}

		console.log('Generating consumers...');
		// We create some consumers
		// Pick 600 users to be consumers
		const consumerUsers = users.splice(0, 600);
		const consumers = await consumerUsers.map((user) => consumerFactory.makeOne({ user }));
		await em.persistAndFlush(consumers);

		consumers.map((consumer) => {
			// Set the consumer's image and type to be a consumer
			consumer.user.image!.url = generateImageUrl('shopper');
			consumer.user.type = UserType.Consumer;

			consumer.addresses.set(addressFactory.make(faker.datatype.number({ min: 1, max: 5 })));

			consumer.orders.set(
				orderFactory
					.each((order) => {
						// Use one of the consumer's addresses
						order.shippingAddress = faker.helpers.arrayElement(consumer.addresses.getItems());
					})
					.make(faker.datatype.number({ min: 1, max: 13 }))
			);

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

			return consumer;
		});

		await em.persistAndFlush(consumers);

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
