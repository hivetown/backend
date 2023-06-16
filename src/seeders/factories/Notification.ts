import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Notification } from '../../entities';

const templateMessages = [
	'{actor} has followed you!',
	'{actor} has liked your post!',
	'{actor} has commented on your post!',
	'{actor} has replied to your comment!',
	'Your order from {actor} has been shipped!',
	'Your order from {actor} has been delivered!',
	'Your order from {actor} has been cancelled!',
	'Your order from {actor} is in Margem Sul!',
	'Your order from {actor} is in Leiria!',
	'Your account has been disabled for illegal activity.',
	'Your account has been re-enabled.'
];

export class NotificationFactory extends Factory<Notification> {
	public model = Notification;

	protected definition(faker: Faker): EntityData<Notification> {
		return {
			createdAt: faker.date.recent(),
			readAt: faker.datatype.number({ min: 0, max: 100 }) < 50 ? faker.date.recent() : undefined,
			templateMessage: faker.helpers.arrayElement(templateMessages)
		};
	}
}
