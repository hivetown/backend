import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { FieldPossibleValue } from '../../entities';

export class FieldPossibleValueFactory extends Factory<FieldPossibleValue> {
	public model = FieldPossibleValue;

	protected definition(faker: Faker): EntityData<FieldPossibleValue> {
		return {
			value: faker.random.word()
		};
	}
}
