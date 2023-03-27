import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { CartItem } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class CartItemGateway {
	private repository: EntityRepository<CartItem>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(CartItem);
	}

	public async findAllItemsByConsumerId(
		consumerId: number,
		options: PaginatedOptions
	): Promise<{ items: CartItem[]; page: number; pageSize: number; totalItems: number; totalPages: number }> {
		const pagination = paginate(options);
		const [cartItems, totalResults] = await Promise.all([
			await this.repository.find(
				{ consumer: consumerId },
				{
					populate: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit'],
					limit: pagination.limit,
					offset: pagination.offset
				}
			),
			await this.repository.count({ consumer: consumerId })
		]);
		return {
			items: cartItems,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: cartItems.length
		};
	}

	public async findProcutById(cartItemId: number, producerProductId: number): Promise<CartItem | null> {
		const cartItem = await this.repository.findOne(
			{ consumer: cartItemId, producerProduct: producerProductId },
			{ fields: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit', 'quantity'] }
		);
		return cartItem;
	}
}
