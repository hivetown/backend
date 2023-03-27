import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { ProducerProduct } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class ProductGateway {
	private repository: EntityRepository<ProducerProduct>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProducerProduct);
	}

	// Pesquisa todos os produtos populacionando o produtor, a unidade de produção e a especificação do produto
	public async findAll(page: number): Promise<{ products: ProducerProduct[]; totalResults: number }> {
		const [products, totalResults] = await Promise.all([
			this.repository.findAll({ populate: ['producer', 'productionUnit', 'productSpec'], limit: 24, offset: (page - 1) * 24 }),
			this.repository.count()
		]);
		return { products, totalResults };
	}

	// Pesquisa todos os produtos populacionando o produtor
	public async findAllWithProducer(page: number): Promise<{ products: ProducerProduct[]; totalResults: number }> {
		const [products, totalResults] = await Promise.all([
			this.repository.findAll({ populate: ['producer'], limit: 24, offset: (page - 1) * 24 }),
			this.repository.count()
		]);
		return { products, totalResults };
	}

	// Pesquisa o produto pelo id dele mesmo
	public async findById(id: number): Promise<ProducerProduct | null> {
		const product = await this.repository.findOne(id, { populate: ['producer', 'productionUnit', 'productSpec'] });
		return product;
	}

	// Pesquisa produtos por id de uma ProductSpec
	public async findBySpecificationId(
		id: number,
		options: PaginatedOptions
	): Promise<{ items: ProducerProduct[]; page: number; pageSize: number; totalItems: number; totalPages: number }> {
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
			pageSize: pagination.limit
		};
		// { items: productSpecs, totalItems, totalPages, page, pageSize: pagination.limit };
	}

	// Pesquisa produtos pelo id de uma categoria
	public async findByCategoryId(id: number, page: number): Promise<{ products: ProducerProduct[]; totalResults: number }> {
		const [products, totalResults] = await Promise.all([
			this.repository
				.createQueryBuilder('p')
				.select('p.*', true)
				.leftJoin('p.productSpec', 's')
				.leftJoin('s.categories', 'sc')
				.where(`sc.category_id = '${id}' and p.product_spec_id = sc.product_spec_id`)
				.limit(24)
				.offset((page - 1) * 24)
				.getResult(),
			this.repository
				.createQueryBuilder('p')
				.select('p.*', true)
				.leftJoin('p.productSpec', 's')
				.leftJoin('s.categories', 'sc')
				.where(`sc.category_id = '${id}' and p.product_spec_id = sc.product_spec_id`)
				.count()
		]);
		await this.repository.populate(products, ['producer', 'productionUnit', 'productSpec']); // ver se há outra forma de fazer
		console.log(products.length);
		return { products, totalResults };
	}
}
