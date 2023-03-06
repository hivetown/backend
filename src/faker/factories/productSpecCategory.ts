import { faker } from '@faker-js/faker';
import { ProductSpecCategory } from '../../entities';
import { generateRandomProductSpec } from './productSpec';
import { generateRandomCategory } from './category';

export const generateRandomProductSpecCategory = (): ProductSpecCategory => {
	const producerProduct = new ProductSpecCategory();
	producerProduct.productSpec = generateRandomProductSpec();
	producerProduct.category = generateRandomCategory();

	const fieldQuantity = faker.datatype.number(10);
	for (let i = 0; i < fieldQuantity; i++) {
		producerProduct.fields.add(generateRandomProductSpecField());
	}
	return producerProduct;
};
