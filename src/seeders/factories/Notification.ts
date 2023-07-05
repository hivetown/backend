import { Factory, Faker } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Notification } from '../../entities';

const templateMessages = [
	'A sua encomenda de {actor} está a ser preparada!',
	'A sua encomenda de {actor} foi enviada!',
	'A sua encomenda de {actor} foi entregue!',
	'A sua encomenda de {actor} foi cancelada!',
	'A sua encomenda de {actor} está na Margem Sul!',
	'A sua encomenda de {actor} está em Leiria!',
	'A sua conta foi desativada por atividades ilegais.',
	'A sua conta foi desativada por sonambulismo.',
	'A sua conta foi desativada por comer demasiado chocolate.',
	'A sua conta foi reativada.',
	'A sua conta foi reativada porque bebeu sumo de laranja Compal.',
	'A sua encomenda do Tuix está com o João Pedro Pais!',
	'A Bandida comeu a sua encomenda :(.',
	'Adoro gelados.'
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
