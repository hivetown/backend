import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { CartItem } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';

export class CartItemGateway {
	private repository: EntityRepository<CartItem>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(CartItem);
	}

	public async findAllItemsByConsumerId(consumerId: number, options: PaginatedOptions): Promise<BaseItems<CartItem>> {
		const pagination = paginate(options);
		const [cartItems, totalResults] = await Promise.all([
			this.repository.find(
				{ consumer: consumerId },
				{
					populate: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit', 'producerProduct.productSpec'],
					limit: pagination.limit,
					offset: pagination.offset
				}
			),
			this.repository.count({ consumer: consumerId })
		]);
		return {
			items: cartItems,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: cartItems.length
		};
	}

	public async findProductById(cartItemId: number, producerProductId: number): Promise<CartItem | null> {
		const cartItem = await this.repository.findOne(
			{ consumer: cartItemId, producerProduct: producerProductId },
			{ fields: ['producerProduct', 'producerProduct.producer', 'producerProduct.productionUnit', 'quantity'] }
		);
		return cartItem;
	}

	public async delete(items: CartItem[]): Promise<void> {
		await this.repository.removeAndFlush(items);
	}

	public async deleteOne(item: CartItem): Promise<void> {
		await this.repository.removeAndFlush(item);
	}
}
