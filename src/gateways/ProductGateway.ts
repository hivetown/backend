import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
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

	public async findByCategoryId(id: number): Promise<ProducerProduct[]> {
		const products = await this.repository
			.createQueryBuilder('p')
			.select('p.*')
			.leftJoin('p.productSpec', 's')
			.leftJoin('s.categories', 'sc')
			.where(`sc.category_id = '${id}' and p.product_spec_id = sc.product_spec_id`)
			.getResult();
		await this.repository.populate(products, ['producer', 'productionUnit', 'productSpec']); // ver se há outra forma de fazer

		return products;
	}
}
