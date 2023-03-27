import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductSpecField } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class ProductSpecFieldGateway {
	private repository: EntityRepository<ProductSpecField>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecField);
	}

	public async findByProductSpecIdAndCategoryId(
		productSpecId: number,
		categoryId: number,
		options: PaginatedOptions
		// ): Promise<{ items: any; page: number; pageSize: number; totalItems: number; totalPages: number }> {
	): Promise<any> {
		const pagination = paginate(options);
		const [productSpecField, totalResults] = await Promise.all([
			await this.repository.find(
				{ productSpecCategory: { productSpec: productSpecId, category: categoryId } },
				{ fields: ['field', 'value'], limit: pagination.limit, offset: pagination.offset }
			),
			await this.repository.count({ productSpecCategory: { productSpec: productSpecId, category: categoryId } })
		]);
		return {
			items: productSpecField,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: productSpecField.length
		};
	}
}
