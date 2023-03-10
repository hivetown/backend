import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProductSpecField } from '../entities';

export class ProductSpecFieldGateway {
	private repository: EntityRepository<ProductSpecField>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpecField);
	}

	public async findFieldsBySpecAndCategory(specId: number, catId: number): Promise<ProductSpecField[]> {
		const fields = await this.repository.find({ productSpecCategory: { productSpec: specId, category: catId } }, { fields: ['field', 'value'] });
		return fields;
	}

	public async findFieldsBySpecAndCategoryWithField(specId: number, catId: number, fieldId: number): Promise<ProductSpecField[]> {
		const fields = await this.repository.find(
			{ productSpecCategory: { productSpec: specId, category: catId }, field: fieldId },
			{ fields: ['field', 'value'] }
		);
		return fields;
	}
}
