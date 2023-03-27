import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductSpecField } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class ProductSpecFieldGateway {
	private repository: EntityRepository<ProductSpecField>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecField);
	}

	public async findAllFieldsByProductSpecIdAndCategoryId(
		productSpecId: number,
		categoryId: number,
		options: PaginatedOptions
	): Promise<{ items: ProductSpecField[]; page: number; pageSize: number; totalItems: number; totalPages: number }> {
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

	public async findFieldBySpecAndCategory(productSpecId: number, categoryId: number, fieldId: number): Promise<ProductSpecField | null> {
		const field = await this.repository.findOne(
			{ productSpecCategory: { productSpec: productSpecId, category: categoryId }, field: fieldId },
			{ fields: ['field', 'value'] }
		);
		return field;
	}
}
