import { faker } from '@faker-js/faker';
import { Field } from '../../entities';
import { FieldType } from '../../enums';
import { generateRandomFieldPossibleValue } from './fieldPossibleValue';

export const generateRandomField = (): Field => {
	const field = new Field();
	field.name = faker.commerce.productName();
	field.unit = faker.helpers.arrayElement(['peso', 'litro', 'metro', 'unidade', 'caixa', 'pacote', 'metro quadrado']);
	field.type = faker.helpers.arrayElement(Object.values(FieldType));
	if (field.type === FieldType.Enum) {
		const possibleValueQuantity = faker.datatype.number(10);
		for (let i = 0; i < possibleValueQuantity; i++) {
			field.possibleValues.add(generateRandomFieldPossibleValue());
		}
	}
	return field;
};
