import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Category } from '../entities';

export class CategoryGateway {
	private repository: EntityRepository<Category>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Category);
	}

	public async findAll(): Promise<Category[]> {
		const categories = await this.repository.findAll({ populate: ['parent'] });
		return categories;
	}

	public async findAllChildrenOfCategory(categoryId: number): Promise<Category[]> {
		const categories = await this.repository.find({ parent: categoryId });
		return categories;
	}

	public async findById(id: number): Promise<Category | null> {
		const category = await this.repository.findOne(id, { populate: ['parent'] });
		return category;
	}

	public async findWithFieldsById(id: number): Promise<Category | null> {
		const category = await this.repository.findOne(id, { populate: ['parent', 'fields'] });
		return category;
	}

	public async create(category: Category): Promise<Category> {
		const cat = this.repository.create(category);
		console.log(cat.fields);
		await this.repository.persistAndFlush(cat);
		return cat;
	}

	public async remove(category: Category): Promise<void> {
		await this.repository.removeAndFlush(category);
	}

	public async update(category: Category): Promise<Category> {
		await this.repository.persistAndFlush(category);
		await this.repository.populate(category, ['parent']);
		return category;
	}
}
