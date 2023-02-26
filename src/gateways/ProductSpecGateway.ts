import type { EntityRepository, MikroORM } from '@mikro-orm/core';
import { ProductSpec } from '../entities';

export class ProductSpecGateway {
	private repository: EntityRepository<ProductSpec>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProductSpec);
	}

	public async findAll(): Promise<ProductSpec[]> {
		const productSpecs = await this.repository.findAll({ populate: ['categories'] });
		return productSpecs;
	}
}
