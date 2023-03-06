import { faker } from '@faker-js/faker';
import { ProductSpecField } from '../../entities';
import { generateRandomField } from './field';
import { generateRandomProductSpecCategory } from './productSpecCategory';

export const generateRandomProductSpecField = (): ProductSpecField => {
	const productSpecField = new ProductSpecField();
	productSpecField.productSpecCategory = generateRandomProductSpecCategory();
	productSpecField.field = generateRandomField();
	productSpecField.value = faker.random.word();
	return productSpecField;
};
