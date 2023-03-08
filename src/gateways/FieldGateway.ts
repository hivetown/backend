import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Field } from '../entities';

export class FieldGateway {
	private repository: EntityRepository<Field>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Field);
	}

	public async findById(id: number): Promise<Field | null> {
		const field = await this.repository.findOne(id);
		return field;
	}
}
