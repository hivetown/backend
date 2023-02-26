import type { EntityRepository, MikroORM } from '@mikro-orm/core';
import { ProductSpecCategory } from '../entities';

export class ProductSpecCategoryGateway {
	private repository: EntityRepository<ProductSpecCategory>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecCategory);
	}

	public findCategoriesBySpecificationId(id: number): Promise<ProductSpecCategory[]> {
		const categories = this.repository.find({ productSpec: id }, { populate: ['category'] });
		return categories;
	}

	// public findCategoryBySpecificationId(id: number, categoryId: number): Promise<ProductSpecCategory> {
	// const category = this.repository.find({ productSpec: id, category: categoryId }, { populate: ['category'] });
	// return category;
	// this.repository.createQueryBuilder('e');
	// }
}
