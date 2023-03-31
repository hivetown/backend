import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Field } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class FieldGateway {
	private repository: EntityRepository<Field>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Field);
	}

	public async findById(id: number): Promise<Field | null> {
		const field = await this.repository.findOne(id);
		return field;
	}

	public async findFieldsByCategoryId(categoryId: number, options: PaginatedOptions): Promise<BaseItems<Field>> {
		const pagination = paginate(options);

		const [fields, totalResults] = await Promise.all([
			this.repository.find({ categories: categoryId }, { limit: pagination.limit, offset: pagination.offset }),
			this.repository.count({ categories: categoryId })
		]);

		return {
			items: fields,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: fields.length
		};
	}

	public async findFieldByCategoryId(categoryId: number, fieldId: number): Promise<Field | null> {
		const field = await this.repository.findOne({ categories: categoryId, id: fieldId });
		return field;
	}
}
