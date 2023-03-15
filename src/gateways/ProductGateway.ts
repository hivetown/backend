import type { EntityRepository, MikroORM, QueryBuilder } from '@mikro-orm/mysql';
import { ProducerProduct } from '../entities';
import type { ProducerProductFilters } from '../interfaces/ProducerProductFilters';
import type { ProducerProductOptions } from '../interfaces/ProducerProductOptions';
import { paginate } from '../utils/paginate';
import { stringSearchType } from '../utils/stringSearchType';

export class ProductGateway {
	private repository: EntityRepository<ProducerProduct>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(ProducerProduct);
	}

	public async findAll(
		filter?: ProducerProductFilters,
		options?: ProducerProductOptions
	): Promise<{ items: ProducerProduct[]; totalItems: number; totalPages: number; page: number; pageSize: number }> {
		const pagination = paginate(options);
		const qb: QueryBuilder<ProducerProduct> = this.repository.createQueryBuilder('producerProduct').select('*');

		if (filter?.producerId) {
			void qb.leftJoin('producerProduct.producer', 'producer').andWhere({ 'producer.id': filter.producerId });
		}

		if (filter?.productionUnitId) {
			void qb.leftJoin('producerProduct.productionUnit', 'productionUnit').andWhere({ 'productionUnit.id': filter.productionUnitId });
		}

		if (filter?.search) {
			void qb.leftJoin('producerProduct.specification', 'spec').andWhere({
				$or: [
					{ 'lower(spec.name)': { $like: stringSearchType(filter.search) } },
					{ 'lower(spec.description)': { $like: stringSearchType(filter.search) } }
				]
			});
		}

		// Calculate items count before grouping and paginating
		const totalItems = await qb.clone().getCount();

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Populate
		if (options?.populate) {
			options.populate.forEach((field) => {
				void qb.leftJoinAndSelect(`producerProduct.${field}`, field);
			});
		}

		// Fetch results and map them
		const producerProducts = (await qb.execute()).map((raw: any) => {
			const product: any = { ...this.repository.map(raw) };

			// Remove unnecessary fields
			// delete product.categories;
			// delete product.producerProducts;

			return product;
		});

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return { items: producerProducts, totalItems, totalPages, page, pageSize: pagination.limit };
	}
	// public async findAll(page: number): Promise<{ products: ProducerProduct[]; totalResults: number }> {
	// 	const [products, totalResults] = await Promise.all([
	// 		this.repository.findAll({ populate: ['producer', 'productionUnit', 'productSpec'], limit: 24, offset: (page - 1) * 24 }),
	// 		this.repository.count()
	// 	]);
	// 	return { products, totalResults };
	// }

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
	public async findBySpecificationId(id: number, page: number): Promise<{ products: ProducerProduct[]; totalResults: number }> {
		// const products = await this.repository.find({ productSpec: id }, { populate: ['producer', 'productionUnit', 'productSpec'] });
		const [products, totalResults] = await Promise.all([
			this.repository.find(
				{ productSpec: id },
				{ populate: ['producer', 'productionUnit', 'productSpec'], limit: 24, offset: (page - 1) * 24 }
			),
			this.repository.count({ productSpec: id })
		]);
		return { products, totalResults };
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
