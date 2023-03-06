import { faker } from '@faker-js/faker';
import { Producer, ProducerProduct, ProductSpec, ProductionUnit } from '../../entities';
import { ProducerProductStatus } from '../../enums';

export const generateRandomProducerProduct = (producer: Producer, productionUnit: ProductionUnit, productSpec: ProductSpec): ProducerProduct => {
	const producerProduct = new ProducerProduct();
	producerProduct.currentPrice = faker.datatype.number(999);
	producerProduct.productionDate = faker.date.past();
	producerProduct.status = faker.helpers.arrayElement(Object.values(ProducerProductStatus));
	// AVOID CIRCULAR DEPENDENCIES
	// producerProduct.producer = generateRandomProducer();
	producerProduct.producer = producer;

	// AVOID CIRCULAR DEPENDENCIES
	// producerProduct.productionUnit = generateRandomProductionUnit();
	producerProduct.productionUnit = productionUnit;

	// AVOID CIRCULAR DEPENDENCIES
	// producerProduct.productSpec = generateRandomProductSpec();
	producerProduct.productSpec = productSpec;
	return producerProduct;
};
