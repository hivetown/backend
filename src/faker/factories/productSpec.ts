import { faker } from '@faker-js/faker';
import { ProductSpec } from '../../entities';
import { generateRandomProductSpecCategory } from './productSpecCategory';

export const generateRandomProductSpec = (): ProductSpec => {
	const product = new ProductSpec();
	product.name = faker.commerce.productName();
	product.description = faker.commerce.productDescription();

	product.images = [];
	const imageQuantity = faker.datatype.number(10);
	for (let i = 0; i < imageQuantity; i++) {
		product.images.push(faker.image.imageUrl());
	}

	const categoryQuantity = faker.datatype.number(10);
	for (let i = 0; i < categoryQuantity; i++) {
		product.categories.add(generateRandomProductSpecCategory());
	}

	return product;
};
