import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductSpecCategory } from '../entities';
export class ProductSpecCategoryGateway {
	private repository: EntityRepository<ProductSpecCategory>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecCategory);
	}

	public async findCategoriesBySpecificationId(id: number): Promise<ProductSpecCategory[]> {
		// const categories = this.repository.find({ productSpec: id }, { populate: ['category'] });
		const categories = await this.repository
			.createQueryBuilder('e')
			.leftJoinAndSelect('e.category', 'category')
			.where({ productSpec: id })
			.getResult();
		return categories;
	}

	public findCategoryBySpecificationId(id: number, categoryId: number): Promise<ProductSpecCategory[]> {
		// const category = this.repository.find({ productSpec: id, category: categoryId }, { populate: ['category'] });
		// return category;
		const category = this.repository
			.createQueryBuilder('e')
			.leftJoinAndSelect('e.category', 'category')
			.where({ productSpec: id, category: categoryId })
			.getResult();

		return category;
	}
}
