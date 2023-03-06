import { faker } from '@faker-js/faker';
import { Field } from '../../entities';
import { FieldType } from '../../enums';

export const generateRandomField = (): Field => {
	const field = new Field();
	field.name = faker.commerce.productName();
	field.unit = faker.helpers.arrayElement(['peso', 'litro', 'metro', 'unidade', 'caixa', 'pacote', 'metro quadrado']);
	field.type = faker.helpers.arrayElement(Object.values(FieldType));
	return field;
};
