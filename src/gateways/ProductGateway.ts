import type { EntityRepository, MikroORM } from '@mikro-orm/core';
import { ProducerProduct } from '../entities';

export class ProductGateway {
	private repository: EntityRepository<ProducerProduct>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProducerProduct);
	}

	public async findAll(): Promise<ProducerProduct[]> {
		const products = await this.repository.findAll({ populate: ['producer', 'productionUnit', 'productSpec'] });
		return products;
	}

	public async findAllWithProducer(): Promise<ProducerProduct[]> {
		// colocar ainda o size de respostas
		const products = await this.repository.findAll({ populate: ['producer'] });
		return products;
	}

	public async findById(id: number): Promise<ProducerProduct | null> {
		const product = await this.repository.findOne(id, { populate: ['producer', 'productionUnit', 'productSpec'] });
		return product;
	}

	public async findBySpecificationId(id: number): Promise<ProducerProduct[]> {
		const products = await this.repository.find({ productSpec: id }, { populate: ['producer', 'productionUnit', 'productSpec'] });
		return products;
	}
}
