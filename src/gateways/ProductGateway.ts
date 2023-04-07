import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProducerProduct } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class ProductGateway {
	private repository: EntityRepository<ProducerProduct>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProducerProduct);
	}

	// Pesquisa o produto pelo id dele mesmo
	public async findById(id: number): Promise<ProducerProduct | null> {
		const product = await this.repository.findOne(id, { populate: ['producer', 'productionUnit', 'productSpec'] });
		return product;
	}

	// Pesquisa produtos por id de uma ProductSpec
	public async findBySpecificationId(id: number, options: PaginatedOptions): Promise<BaseItems<ProducerProduct>> {
		const pagination = paginate(options);
		const [products, totalResults] = await Promise.all([
			this.repository.find(
				{ productSpec: id },
				{ populate: ['producer', 'productionUnit', 'productSpec'], limit: pagination.limit, offset: pagination.offset }
			),
			this.repository.count({ productSpec: id })
		]);
		return {
			items: products,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: products.length
		};
		// { items: productSpecs, totalItems, totalPages, page, pageSize: pagination.limit };
	}

	// para dar update no stock do produto
	public async updateProduct(product: ProducerProduct): Promise<ProducerProduct> {
		await this.repository.persistAndFlush(product);
		return product;
	}
}
