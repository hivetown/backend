import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Producer } from '../entities';

export class ProducerGateway {
	private repository: EntityRepository<Producer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Producer);
	}

	public async findAll(): Promise<Producer[]> {
		const producers = await this.repository.findAll();
		return producers;
	}

	public async create(producer: Producer): Promise<Producer> {
		const data = this.repository.create(producer);
		await this.repository.persistAndFlush(data);
		return producer;
	}

	public async findByAuthId(authId: string): Promise<Producer | null> {
		return this.repository.findOne({ authId });
	}
}
