import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Category } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class CategoryGateway {
	private repository: EntityRepository<Category>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Category);
	}

	public async findAllRoot(options: PaginatedOptions): Promise<BaseItems<Category>> {
		const pagination = paginate(options);
		const [categories, totalResults] = await Promise.all([
			this.repository
				.createQueryBuilder('category')
				.where('category.parent_id IS NULL')
				.limit(pagination.limit)
				.offset(pagination.offset)
				.getResult(),
			this.repository.createQueryBuilder('category').where('category.parent_id IS NULL').count()
		]);
		return {
			items: categories,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: categories.length
		};
	}

	public async findAllChildrenOfCategory(categoryId: number, options: PaginatedOptions): Promise<BaseItems<Category>> {
		const pagination = paginate(options);
		const [categories, totalResults] = await Promise.all([
			this.repository.find({ parent: categoryId }, { fields: ['name', 'parent.name'], limit: pagination.limit, offset: pagination.offset }),
			this.repository.count({ parent: categoryId })
		]);
		return {
			items: categories,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: categories.length
		};
	}

	public async findById(id: number): Promise<Category | null> {
		const category = await this.repository.findOne(id, { populate: ['parent'] });
		return category;
	}

	public async findByIdWithFields(id: number): Promise<Category | null> {
		const category = await this.repository.findOne(id, { populate: ['fields'] });
		return category;
	}

	public async create(category: Category): Promise<Category> {
		const cat = this.repository.create(category);
		console.log(cat.fields);
		await this.repository.persistAndFlush(cat);
		return cat;
	}

	public async remove(category: Category): Promise<void> {
		// TODO: Soft delete
		await this.repository.removeAndFlush(category);
	}

	public async update(category: Category): Promise<Category> {
		await this.repository.persistAndFlush(category);
		await this.repository.populate(category, ['parent']);
		return category;
	}
}
