import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductSpecCategory } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
export class ProductSpecCategoryGateway {
	private repository: EntityRepository<ProductSpecCategory>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecCategory);
	}

	public async findCategoriesBySpecificationId(
		id: number,
		options: PaginatedOptions
	): Promise<{ items: any; page: number; pageSize: number; totalItems: number; totalPages: number }> {
		const pagination = paginate(options);
		const [productSpecCategories, totalResults] = await Promise.all([
			this.repository
				.createQueryBuilder('e')
				.leftJoinAndSelect('e.category', 'category')
				.where({ productSpec: id })
				.limit(pagination.limit)
				.offset(pagination.offset)
				.getResult(),
			this.repository.createQueryBuilder('e').leftJoinAndSelect('e.category', 'category').where({ productSpec: id }).count()
		]);
		const c = productSpecCategories.map(({ category }) => ({ category }));
		return {
			items: c,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: c.length
		};
	}

	public async findCategoryBySpecificationId(id: number, categoryId: number): Promise<ProductSpecCategory[]> {
		// const category = await this.repository
		// 	.createQueryBuilder('e')
		// 	.leftJoinAndSelect('e.category', 'category')
		// 	.select('e.field, e.value')
		// 	.where({ productSpec: id, category: categoryId })
		// 	.getResult();
		// await this.repository.populate(category, ['fields.field']);
		const category = await this.repository.find({ productSpec: id, category: categoryId }, { populate: ['category', 'fields'] });
		return category;
	}
}
