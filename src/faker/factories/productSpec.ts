import { faker } from '@faker-js/faker';
import { ProductSpec } from '../../entities';

export const generateRandomProductSpec = (): ProductSpec => {
	const product = new ProductSpec();
	product.name = faker.commerce.productName();
	product.description = faker.commerce.productDescription();

	product.images = [];
	const imageQuantity = Number(faker.random.numeric(1));
	for (let i = 0; i < imageQuantity; i++) {
		product.images.push(faker.image.imageUrl());
	}

	const categoryQuantity = Number(faker.random.numeric(1));
	for (let i = 0; i < categoryQuantity; i++) {
		product.categories = generateRandomProductSpecCategory();
	}

	return product;
};
