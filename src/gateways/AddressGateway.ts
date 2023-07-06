import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Address } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class AddressGateway {
	private repository: EntityRepository<Address>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Address);
	}

	public async findById(id: number): Promise<Address | null> {
		return this.repository.findOne(id);
	}

	public async create(address: Address): Promise<Address> {
		const data = this.repository.create(address);
		await this.repository.persistAndFlush(data);
		return address;
	}

	public async findFromConsumer(consumerId: number, options: PaginatedOptions): Promise<BaseItems<Address>> {
		const pagination = paginate(options);

		const qb = this.repository
			.createQueryBuilder('address')
			.select('*')
			.where({ consumer: { id: consumerId } });

		const totalItemsQb = qb.clone();

		// Order & Paginate
		void qb.orderBy({ id: 'DESC' }).offset(pagination.offset).limit(pagination.limit);

		// Fetch results and map them
		const [totalItems, addresses] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);
		console.log(totalItems);

		const totalPages = Math.ceil(totalItems / pagination.limit);
		const page = Math.ceil(pagination.offset / pagination.limit) + 1;
		return {
			totalItems,
			items: addresses,
			totalPages,
			page,
			pageSize: pagination.limit
		};
	}
}
