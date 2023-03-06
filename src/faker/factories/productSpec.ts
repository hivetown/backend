import { faker } from '@faker-js/faker';
import { ProductSpec } from '../../entities';
import { generateRandomProductSpecCategory } from './productSpecCategory';

export const generateRandomProductSpec = (): ProductSpec => {
	const productSpec = new ProductSpec();
	productSpec.name = faker.commerce.productName();
	productSpec.description = faker.commerce.productDescription();

	productSpec.images = [];
	const imageQuantity = faker.datatype.number(10);
	for (let i = 0; i < imageQuantity; i++) {
		productSpec.images.push(faker.image.imageUrl());
	}

	const categoryQuantity = faker.datatype.number(10);
	for (let i = 0; i < categoryQuantity; i++) {
		productSpec.categories.add(generateRandomProductSpecCategory(productSpec));
	}

	return productSpec;
};
