import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Image } from '../../entities';

export class ImageFactory extends Factory<Image> {
	public model = Image;

	protected definition(faker: Faker): EntityData<Image> {
		return {
			name: faker.random.words(3),
			url: faker.image.imageUrl(640, 480, 'cat', true),
			alt: faker.lorem.words(7)
		};
	}
}
