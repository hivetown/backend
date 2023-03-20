import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Field } from '../../entities';
import { FieldType } from '../../enums';

export class FieldFactory extends Factory<Field> {
	public model = Field;

	protected definition(faker: Faker): EntityData<Field> {
		return {
			name: faker.commerce.productName(),
			unit: faker.helpers.arrayElement(['peso', 'litro', 'metro', 'unidade', 'caixa', 'pacote', 'metro quadrado']),
			type: faker.helpers.arrayElement(Object.values(FieldType))
		};
	}
}
