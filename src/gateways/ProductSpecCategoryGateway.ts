import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductSpecCategory } from '../entities';
export class ProductSpecCategoryGateway {
	private repository: EntityRepository<ProductSpecCategory>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecCategory);
	}

	public async findCategoriesBySpecificationId(id: number, page: number): Promise<{ categories: ProductSpecCategory[]; totalResults: number }> {
		const [categories, totalResults] = await Promise.all([
			this.repository
				.createQueryBuilder('e')
				.leftJoinAndSelect('e.category', 'category')
				.where({ productSpec: id })
				.limit(24)
				.offset((page - 1) * 24)
				.getResult(),
			// this.repository.count({ productSpec: id })
			this.repository.createQueryBuilder('e').leftJoinAndSelect('e.category', 'category').where({ productSpec: id }).count()
		]);

		return { categories, totalResults };
	}

	public async findCategoryBySpecificationId(id: number, categoryId: number): Promise<ProductSpecCategory[]> {
		const category = await this.repository
			.createQueryBuilder('e')
			.leftJoinAndSelect('e.category', 'category')
			.where({ productSpec: id, category: categoryId })
			.getResult();
		await this.repository.populate(category, ['productSpec', 'fields']);
		return category;
	}
}
