import { faker } from '@faker-js/faker';
import { FieldPossibleValue } from '../../entities';

export const generateRandomFieldPossibleValue = (): FieldPossibleValue => {
	const fieldPossibleValue = new FieldPossibleValue();
	fieldPossibleValue.value = faker.random.word();
	return fieldPossibleValue;
};
