import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
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

	public async findAllByIds(ids: number[]): Promise<Category[]> {
		const categories = await this.repository.find({ id: { $in: ids } });
		return categories;
	}
}
