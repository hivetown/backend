import { EntityRepository } from "@mikro-orm/core";
import { Producer } from "../entities";
import { MikroORM } from "@mikro-orm/mysql";

export class ProducerGateway {

	private repository: EntityRepository<Producer>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Producer);
	}

	public async findAll(): Promise<Producer[]> {
		const producers = await this.repository.findAll();
		return producers;
	}

}