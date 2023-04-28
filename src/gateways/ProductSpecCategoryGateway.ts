import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Category, ProductSpecCategory } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
export class ProductSpecCategoryGateway {
	private repository: EntityRepository<ProductSpecCategory>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecCategory);
	}

	public async createOrUpdate(productSpecCategory: ProductSpecCategory) {
		return this.repository.persistAndFlush(productSpecCategory);
	}

	public async delete(productSpecCategory: ProductSpecCategory) {
		return this.repository.removeAndFlush(productSpecCategory);
	}

	public async findCategoriesBySpecificationId(id: number, options: PaginatedOptions): Promise<BaseItems<Category>> {
		const pagination = paginate(options);
		const [productSpecCategories, totalResults] = await Promise.all([
			this.repository
				.createQueryBuilder('e')
				.leftJoinAndSelect('e.category', 'category')
				.leftJoinAndSelect('category.image', 'image')
				.where({ productSpec: id })
				.limit(pagination.limit)
				.offset(pagination.offset)
				.getResult(),
			this.repository.createQueryBuilder('e').leftJoinAndSelect('e.category', 'category').where({ productSpec: id }).count()
		]);
		const c = productSpecCategories.map(({ category }) => category);
		return {
			items: c,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: c.length
		};
	}

	public async findCategoryBySpecificationId(id: number, categoryId: number): Promise<ProductSpecCategory | null> {
		const category = await this.repository.findOne({ productSpec: id, category: categoryId }, { populate: ['category', 'category.image'] });
		return category;
	}
}
