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

		// Generate some ProductSpecs (a separate graph)
		const productSpecs = await productSpecFactory
			.each((spec) => {
				spec.categories.set(
					productSpecCategoryFactory
						.each((specCategory) => {
							specCategory.category = categoryFactory
								.each((category) => {
									// We make some Fields for the Category
									// This is WRONG from the perspective of the business,
									// because we *may* end up having more Fields on the Category
									// than we will link to the ProductSpecCategory
									category.fields.add(
										fieldFactory
											.each((field) => {
												const amount = faker.datatype.number(5);
												if (amount) {
													field.type = FieldType.Enum;
													field.possibleValues.set(new FieldPossibleValueFactory(em).make(amount));
												}
											})
											.make(3)
									);
								})
								.makeOne();

							return specCategory;
						})
						.make(10)
				);
			})
			// We use create() instead of make() because we want to be able to access the actual
			// database ProductSpecs (and dependent entities) in the next step with their IDs populated
			.create(10);

		// Create ProductSpecFields. THIS IS THE CORRECT WAY TO DO IT BECAUSE IT DEPENDS ON IDS CREATED BEFOREHAND
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

		// Generate some Producers (a separate graph)
		const producers = await producerFactory
			.each((producer) => {
				producer.productionUnits.set(
					productionUnitFactory
						.each((pUnit) => {
							pUnit.address = addressFactory.makeOne();

							// pUnit.carriers.set(
							// 	new CarrierFactory(em)
							// 		.each((carrier) => {
							// 			// TODO: this
							// 			// carrier.shipments.set(new ShipmentFactory(em).make(10));
							// 		})
							// 		.make(10)
							// );
						})
						.make(10)
				);
			})
			// We use create() instead of make() for the same reason as above
			.create(10);

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
