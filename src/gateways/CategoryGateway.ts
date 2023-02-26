import type { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Category } from '../entities';

export class CategoryGateway {
	private repository: EntityRepository<Category>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Category);
	}

	public async findAll(): Promise<Category[]> {
		const categories = await this.repository.findAll();
		return categories;
	}
}
