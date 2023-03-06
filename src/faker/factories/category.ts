import { faker } from '@faker-js/faker';
import { Category } from '../../entities';

export const generateRandomCategory = (): Category => {
	const category = new Category();
	category.name = faker.commerce.product();
	// category.parent = generateRandomCategory();
	category.fields = generateRandomFields();
	return category;
};
