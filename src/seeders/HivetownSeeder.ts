import type { EntityManager } from '@mikro-orm/core';
import { faker, Seeder } from '@mikro-orm/seeder';
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
import { CartFactory } from './factories/Cart';
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
		const cartFactory = new CartFactory(em);
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
			.create(50);

		// We create some Categories that use some of the Fields
		const categories = await categoryFactory
			.each((category) => {
				// TODO category parents
				category.fields.set(faker.helpers.arrayElements(fields, faker.datatype.number({ min: 3, max: 8 })));
			})
			.create(20);

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
			.create(10);

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
						.make(10)
				);
			})
			.create(10);

		// We wait for the production units to be created so we can create some producer products
		producers.forEach((producer) => {
			producer.productionUnits.getItems().forEach((pUnit) => {
				pUnit.products.set(
					producerProductFactory
						.each((pProduct) => {
							pProduct.productSpec = faker.helpers.arrayElement(productSpecs);
							pProduct.producer = producer;
						})
						.make(30)
				);
			});
		});

		// We create some consumers
		const consumers = await consumerFactory
			.each((consumer) => {
				consumer.addresses.set(addressFactory.make(10));
				consumer.cartItems.set(
					cartItemFactory
						.each((cartItem) => {
							const randomProducer = faker.helpers.arrayElement(producers);
							const randomProductionUnit = faker.helpers.arrayElement(randomProducer.productionUnits.getItems());
							const randomProducerProduct = faker.helpers.arrayElement(randomProductionUnit.products.getItems());
							cartItem.product = randomProducerProduct;
						})
						.make(10)
				);
				// consumer.cart = cartFactory.makeOne();
			})
			.create(10);

		// We wait for the consumers to be created so we can create some carts
		// consumers.forEach((consumer) => {
		// 	consumer.cart = cartFactory
		// 		.each((cart) => {
		// 			// cart.items.set(
		// 			// 	cartItemFactory
		// 			// 		.each((cartItem) => {
		// 			// 			const producer = faker.helpers.arrayElement(producers);
		// 			// 			const productionUnit = faker.helpers.arrayElement(producer.productionUnits.getItems());
		// 			// 			const producerProduct = faker.helpers.arrayElement(productionUnit.products.getItems());
		// 			// 			cartItem.product = producerProduct;
		// 			// 		})
		// 			// 		.make(10)
		// 			// );
		// 		})
		// 		.makeOne({ consumer: consumer.id });
		// });

		// const producers = await producerFactory
		// 	.each((producer) => {
		// 		producer.productionUnits.set(
		// 			productionUnitFactory
		// 				.each((pUnit) => {
		// 					pUnit.address = addressFactory.makeOne();

		// 					// pUnit.carriers.set(
		// 					// 	new CarrierFactory(em)
		// 					// 		.each((carrier) => {
		// 					// 			// TODO: this
		// 					// 			// carrier.shipments.set(new ShipmentFactory(em).make(10));
		// 					// 		})
		// 					// 		.make(10)
		// 					// );
		// 				})
		// 				.make(10)
		// 		);
		// 	})
		// 	// We use create() instead of make() for the same reason as above
		// 	.create(10);

		// producers.forEach((producer) => {
		// 	// pUnit.products.set(
		// 	// 	producerProductFactory
		// 	// 		.each((producerProduct) => {
		// 	// 			producerProduct.productSpec = faker.helpers.arrayElement(productSpecs);
		// 	// 		})
		// 	// 		.make(10)
		// 	// );
		// 	producer.productionUnits.getItems().forEach((pUnit) => {
		// 		producerProductFactory
		// 			.each((producerProduct) => {
		// 				producerProduct.productionUnit = pUnit;
		// 				producerProduct.productSpec = faker.helpers.arrayElement(productSpecs);
		// 			})
		// 			.make(10);
		// 	});
		// });

		// const shipmentStatuses = await shipmentStatusFactory.create(10);

		// const consumers = consumerFactory
		// 	.each((consumer) => {
		// 		consumer.cart = cartFactory
		// 			.each((cart) => {
		// 				const randomProducer = faker.helpers.arrayElement(producers);
		// 				const randomProductionUnit = faker.helpers.arrayElement(randomProducer.productionUnits.getItems());

		// 				cart.items.set(
		// 					cartItemFactory
		// 						.each((cartItem) => {
		// 							cartItem.product = faker.helpers.arrayElement(randomProductionUnit.products.getItems());
		// 						})
		// 						.make(10)
		// 				);
		// 			})
		// 			.makeOne();

		// 		consumer.orders.set(
		// 			orderFactory
		// 				.each((order) => {
		// 					order.shippingAddress = addressFactory.makeOne();
		// 					const randomProducer = faker.helpers.arrayElement(producers);
		// 					const randomProductionUnit = faker.helpers.arrayElement(randomProducer.productionUnits.getItems());

		// 					const shipment = shipmentFactory
		// 						.each((shipment) => {
		// 							shipment.carrier = faker.helpers.arrayElement(randomProductionUnit.carriers.getItems());
		// 							shipment.events.set(
		// 								shipmentEventFactory
		// 									.each((shipmentEvent) => {
		// 										shipmentEvent.address = addressFactory.makeOne();
		// 										shipmentEvent.shipmentStatus = faker.helpers.arrayElement(shipmentStatuses);
		// 									})
		// 									.make(10)
		// 							);
		// 						})
		// 						.makeOne();

		// 					order.items.set(
		// 						orderItemFactory
		// 							.each((orderItem) => {
		// 								orderItem.producerProduct = faker.helpers.arrayElement(randomProductionUnit.products.getItems());
		// 								orderItem.shipment = shipment;
		// 							})
		// 							.make(10)
		// 					);
		// 				})
		// 				.make(10)
		// 		);

		// 		consumer.addresses.set(addressFactory.make(10));
		// 	})
		// 	.make(10);

		// Flush the changes to the database
		await em.flush();
	}
}

// if (field.type === FieldType.Enum) {
// 	productSpecField.value = faker.random.arrayElement(field.possibleValues.getItems());
// }
