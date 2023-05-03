import { faker } from '@mikro-orm/seeder';
import { Field, Image } from '../entities';
import { FieldType } from '../enums';

/**
 * loremflickr image types
 */
type ImageTypes = 'dog' | 'cat' | 'food' | 'avatar' | 'shop' | 'car' | 'department' | 'mcdonalds' | 'factory';
export const generateImage = (type: ImageTypes) =>
	new Image(faker.name.jobTitle(), faker.image.imageUrl(640, 480, type, true), faker.git.commitMessage());

export const generateValueFromField = (field: Field) => {
	let value: string;
	switch (field.type) {
		case FieldType.Boolean:
			value = `${faker.datatype.boolean()}`;
			break;
		case FieldType.Date:
			value = faker.date.past().toString();
			break;
		case FieldType.Number:
			value = faker.datatype.number({ min: 1, max: 999 }).toString();
			break;
		case FieldType.Text:
			value = faker.datatype.string();
			break;
		case FieldType.Enum:
			value = faker.helpers.arrayElement(field.possibleValues.getItems()).value;
			break;
	}

	return value;
};
