import { faker } from '@faker-js/faker';
import { Category } from '../../entities';
import { generateRandomField } from './field';

export const generateRandomCategory = (parent?: Category): Category => {
	const category = new Category();
	category.name = faker.commerce.product();

	// AVOID CIRCULAR DEPENDENCIES
	// category.parent = generateRandomCategory();
	category.parent = parent;

	const fieldQuantity = faker.datatype.number(10);
	for (let i = 0; i < fieldQuantity; i++) {
		category.fields.add(generateRandomField());
	}

	return category;
};
