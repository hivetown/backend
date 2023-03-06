import { faker } from '@faker-js/faker';
import { Field, ProductSpecCategory, ProductSpecField } from '../../entities';

export const generateRandomProductSpecField = (productSpecCategory: ProductSpecCategory, field: Field): ProductSpecField => {
	const productSpecField = new ProductSpecField();
	// AVOID CIRCULAR DEPENDENCIES
	// productSpecField.productSpecCategory = generateRandomProductSpecCategory();
	productSpecField.productSpecCategory = productSpecCategory;
	// AVOID CIRCULAR DEPENDENCIES
	// productSpecField.field = generateRandomField();
	productSpecField.field = field;
	productSpecField.value = faker.random.word();
	return productSpecField;
};
