import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Address } from '../entities';

export class AddressGateway {
	private repository: EntityRepository<Address>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Address);
	}

	public async create(address: Address): Promise<Address> {
		const data = this.repository.create(address);
		await this.repository.persistAndFlush(data);
		return address;
	}

	// public async findFromConsumer(consumerId: number): Promise<Address[]> {
	// return this.repository.find({ consumer: { id: consumerId } });
	// }
}
