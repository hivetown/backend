import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Order } from '../entities';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import type { BaseItems } from '../interfaces/BaseItems';
import { paginate } from '../utils/paginate';

export class OrderGateway {
	private repository: EntityRepository<Order>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Order);
	}

	public async findById(orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(orderId);
		return order;
	}

	public async findByIdWithShippingAddress(orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(orderId, {
			populate: ['items', 'items.shipment.events.status', 'shippingAddress', 'items.producerProduct.producer']
		});
		return order;
	}

	public async findByIds(orderIds: number[], options: PaginatedOptions): Promise<BaseItems<Order>> {
		const pagination = paginate(options);

		const [orders, totalResults] = await Promise.all([
			this.repository.find(
				{ id: { $in: orderIds } },
				{ fields: ['shippingAddress'], limit: pagination.limit, offset: pagination.offset, orderBy: { id: 'DESC' } }
			),
			this.repository.count({ id: { $in: orderIds } })
		]);

		return {
			items: orders,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: orders.length
		};
	}

	public async findByConsumer(consumerId: number, options: PaginatedOptions): Promise<BaseItems<Order>> {
		const pagination = paginate(options);
		const [orders, totalResults] = await Promise.all([
			this.repository.find(
				{ consumer: { user: consumerId } },
				{
					populate: ['items', 'items.shipment.events.status', 'shippingAddress'],
					fields: ['shippingAddress'],
					limit: pagination.limit,
					offset: pagination.offset,
					orderBy: { id: 'DESC' }
				}
			),
			this.repository.count({ consumer: { user: consumerId } })
		]);

		return {
			items: orders,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: orders.length
		};
	}

	public async findByIdsToExport(orderIds: number[], consumerId: number): Promise<Order[]> {
		const orders = await this.repository.find(
			{ id: { $in: orderIds }, consumer: { user: consumerId } },
			{
				populate: [
					'items',
					'items.shipment.events.status',
					'items.shipment.carrier',
					'items.shipment.events.address',
					'items.producerProduct.productionUnit.address',
					'items.producerProduct.productSpec',
					'items.producerProduct.producer',
					'shippingAddress'
				],
				orderBy: { id: 'DESC' }
			}
		);
		return orders;
	}

	public async findByConsumerAndOrder(consumerId: number, orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(
			{ consumer: { user: consumerId }, id: orderId },
			{ populate: ['items', 'items.shipment.events.status', 'shippingAddress'], orderBy: { id: 'DESC' } }
		);
		return order;
	}

	public async createOrder(order: Order): Promise<Order> {
		await this.repository.persistAndFlush(order);
		await this.repository.populate(order, ['items', 'items.producerProduct', 'items.producerProduct.productSpec', 'shippingAddress']);
		return order;
	}

	public async deleteOrder(order: Order): Promise<void> {
		await this.repository.removeAndFlush(order);
	}

	public async updateOrder(order: Order): Promise<void> {
		await this.repository.persistAndFlush(order);
	}

	public async findByIdPopulated(orderId: number): Promise<Order | null> {
		const order = await this.repository.findOne(orderId, {
			populate: [
				'items',
				'items.shipment',
				'items.shipment.events',
				'items.shipment.events.status',
				'shippingAddress',
				'items.producerProduct',
				'items.producerProduct.productionUnit',
				'items.producerProduct.productionUnit.address'
			],
			orderBy: { id: 'DESC' }
		});
		return order;
	}

	public async findByConsumerIdPopulated(consumerId: number): Promise<Order[]> {
		const orders = await this.repository.find(
			{ consumer: { user: consumerId } },
			{
				populate: ['items', 'items.shipment', 'items.shipment.events', 'items.shipment.events.status'],
				orderBy: { id: 'DESC' }
			}
		);
		return orders;
	}

	public async numberOfOrders(): Promise<number> {
		return this.repository.count();
	}

	public async getReportInformation(
		dataInicio: string,
		dataFim: string,
		distancia: number,
		opcao: string,
		subopcao?: string,
		categoryId?: number,
		consumerId?: number,
		producerId?: number
	): Promise<any> {
		const qb = this.repository.createQueryBuilder('o');
		if (opcao === 'flashcards') {
			void qb
				.select([
					'COUNT(DISTINCT oi.order_id) as numeroEncomendas',
					'IFNULL(SUM(oi.quantity), 0) as totalProdutos',
					'IFNULL(SUM(oi.quantity * oi.price), 0) as comprasTotais',
					'COUNT(DISTINCT oi.producer_product_id) as numeroProdutosEncomendados'
				])
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se');
		} else if (opcao === 'map') {
			void qb
				.leftJoinAndSelect('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoinAndSelect('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se');
		} else if (opcao === 'evolution') {
			console.log('evolution');
			if (subopcao === 'numeroEncomendas') {
				console.log('numeroEncomendas');
				void qb.select([`min(DATE_FORMAT(se.date, '%Y-%m')) AS mes_ano, oi.order_id`]);
				void qb.groupBy('2');
				void qb.orderBy({ '1': 'ASC' });
			} else if (subopcao === 'totalProdutos') {
				console.log('totalProdutos');
				void qb.select([`DATE_FORMAT(se.date, '%Y-%m') AS mes_ano`, 'IFNULL(SUM(oi.quantity), 0) as totalProdutos']);
				void qb.groupBy('1');
				void qb.orderBy({ '1': 'ASC' });
			} else if (subopcao === 'comprasTotais') {
				console.log('comprasTotais');
				void qb.select([`DATE_FORMAT(se.date, '%Y-%m') AS mes_ano`, 'IFNULL(SUM(oi.quantity * oi.price), 0) as comprasTotais']);
				void qb.groupBy('1');
				void qb.orderBy({ '1': 'ASC' });
			} else if (subopcao === 'numeroProdutosEncomendados') {
				console.log('numeroProdutosEncomendados');
				void qb.select([`min(DATE_FORMAT(se.date, '%Y-%m')) AS mes_ano`, 'oi.producer_product_id as numeroProdutosEncomendados']);
				void qb.groupBy('2');
				void qb.orderBy({ '1': 'ASC' });
			}
			void qb
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se');
		} else if (opcao === 'products') {
			if (subopcao === 'numeroEncomendas') {
				void qb.select(['oi.producer_product_id, ps.name, count(oi.order_id) as numeroEncomendas']);
				void qb.groupBy('1');
			} else if (subopcao === 'totalProdutos') {
				void qb.select(['oi.producer_product_id, ps.name, sum(oi.quantity) as totalProdutos']);
				void qb.groupBy('1');
			} else if (subopcao === 'comprasTotais') {
				void qb.select(['oi.producer_product_id, ps.name, sum(oi.quantity * oi.price) as comprasTotais']);
				void qb.groupBy('1');
			}
			void qb
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se')
				.leftJoin('pp.productSpec', 'ps');
		} else if (opcao === 'clients') {
			if (subopcao === 'numeroEncomendas') {
				void qb.select(['o.consumer_id, u.name, count(oi.order_id) as numeroEncomendas']);
				void qb.groupBy('1');
			} else if (subopcao === 'totalProdutos') {
				void qb.select(['o.consumer_id, u.name, sum(oi.quantity) as totalProdutos']);
				void qb.groupBy('1');
			} else if (subopcao === 'comprasTotais') {
				void qb.select(['o.consumer_id, u.name, sum(oi.quantity * oi.price) as comprasTotais']);
				void qb.groupBy('1');
			} else if (subopcao === 'numeroProdutosEncomendados') {
				void qb.select(['o.consumer_id, u.name, count(oi.producer_product_id) as numeroProdutosEncomendados']);
				void qb.groupBy('1');
			}
			void qb
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se')
				.leftJoin('o.consumer', 'c')
				.leftJoin('c.user', 'u');
		}

		if (consumerId) {
			void qb.andWhere('o.consumer_id = ?', [consumerId]);
		}

		if (producerId) {
			void qb.andWhere('pp.producer_id = ?', [producerId]);
		}

		if (categoryId) {
			void qb.leftJoin('pp.productSpec', 'ps').leftJoin('ps.categories', 'psc').andWhere('psc.category_id = ?', [categoryId]);
		}

		void qb
			// .andWhere(
			// 	`(SELECT se_sub.date
			// 	FROM shipment s_sub
			// 			LEFT JOIN shipment_event se_sub on s_sub.id = se_sub.shipment_id
			// 	WHERE se_sub.id = oi.shipment_id
			// 	ORDER BY se_sub.date ASC
			// 	LIMIT 1) BETWEEN ? AND ?`,
			// 	[dataInicio, dataFim]
			// )
			.andWhere(
				`se.date =
					(SELECT MIN(se_sub.date)
					FROM shipment_event se_sub
						LEFT JOIN order_item oi_sub on se_sub.shipment_id = oi_sub.shipment_id
					WHERE oi_sub.order_id = oi.order_id AND oi_sub.producer_product_id = oi.producer_product_id
					AND se_sub.date BETWEEN ? AND ?) `,
				[dataInicio, dataFim]
			)
			.andWhere(
				`(2 * 6371 * ASIN( SQRT( POWER(SIN((RADIANS(pa.latitude) - RADIANS(sa.latitude)) / 2), 2) + COS(RADIANS(sa.latitude)) * COS(RADIANS(pa.latitude)) * POWER(SIN((RADIANS(pa.longitude) - RADIANS(sa.longitude)) / 2), 2)) ) ) <= ?`,
				[distancia]
			);

		let result;

		if (opcao === 'flashcards') {
			result = (await qb.execute())[0] as unknown as {
				numeroEncomendas: string;
				totalProdutos: string;
				comprasTotais: string;
				numeroProdutosEncomendados: string;
			};
			return {
				...result,
				// Sums may return null if there are no orders, but we IFNULL them to 0. Still, they may come as strings
				totalProdutos: parseInt(result.totalProdutos, 10),
				comprasTotais: parseFloat(result.comprasTotais)
			};
		} else if (opcao === 'map') {
			result = await qb.execute();
			const toReturn = [];
			for (const a of result) {
				toReturn.push({
					shippingAddress: a.shippingAddress,
					productionUnitAddress: {
						id: a.pa__id,
						number: a.pa__number,
						door: a.pa__door,
						floor: a.pa__floor,
						zipCode: a.pa__zip_code,
						street: a.pa__street,
						parish: a.pa__parish,
						county: a.pa__county,
						city: a.pa__city,
						district: a.pa__district,
						latitude: a.pa__latitude,
						longitude: a.pa__longitude
					}
				});
			}

			return toReturn;
		} else if (opcao === 'evolution' || opcao === 'products' || opcao === 'clients') {
			result = await qb.execute();
			return result;
		}
	}

	// --------------------------------------------------------------------------------------------------------------------------------------
	public async getReportCanceledInformation(
		dataInicio: string,
		dataFim: string,
		distancia: number,
		opcao: string,
		subopcao?: string,
		categoryId?: number,
		consumerId?: number,
		producerId?: number
	): Promise<any> {
		const qb = this.repository.createQueryBuilder('o');
		if (opcao === 'flashcards') {
			void qb
				.select([
					'COUNT(DISTINCT oi.order_id) as numeroEncomendasCanceladas',
					'IFNULL(SUM(oi.quantity), 0) as totalProdutosCancelados',
					'IFNULL(SUM(oi.quantity * oi.price), 0) as comprasTotaisCanceladas',
					'COUNT(DISTINCT oi.producer_product_id) as numeroProdutosEncomendadosCancelados'
				])
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se');
		} else if (opcao === 'map') {
			void qb
				.leftJoinAndSelect('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoinAndSelect('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se');
		} else if (opcao === 'evolution') {
			console.log('evolution');
			if (subopcao === 'numeroEncomendas') {
				console.log('numeroEncomendas');
				void qb.select([`min(DATE_FORMAT(se.date, '%Y-%m')) AS mes_ano, oi.order_id`]);
				void qb.groupBy('2');
				void qb.orderBy({ '1': 'ASC' });
			} else if (subopcao === 'totalProdutos') {
				console.log('totalProdutos');
				void qb.select([`DATE_FORMAT(se.date, '%Y-%m') AS mes_ano`, 'IFNULL(SUM(oi.quantity), 0) as totalProdutosCancelados']);
				void qb.groupBy('1');
				void qb.orderBy({ '1': 'ASC' });
			} else if (subopcao === 'comprasTotais') {
				console.log('comprasTotais');
				void qb.select([`DATE_FORMAT(se.date, '%Y-%m') AS mes_ano`, 'IFNULL(SUM(oi.quantity * oi.price), 0) as comprasTotaisCanceladas']);
				void qb.groupBy('1');
				void qb.orderBy({ '1': 'ASC' });
			} else if (subopcao === 'numeroProdutosEncomendados') {
				console.log('numeroProdutosEncomendados');
				void qb.select([`min(DATE_FORMAT(se.date, '%Y-%m')) AS mes_ano`, 'oi.producer_product_id as numeroProdutosEncomendadosCancelados']);
				void qb.groupBy('2');
				void qb.orderBy({ '1': 'ASC' });
			}
			void qb
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se');
		} else if (opcao === 'products') {
			if (subopcao === 'numeroEncomendas') {
				void qb.select(['oi.producer_product_id, ps.name, count(oi.order_id) as numeroEncomendasCancelados']);
				void qb.groupBy('1');
			} else if (subopcao === 'totalProdutos') {
				void qb.select(['oi.producer_product_id, ps.name, sum(oi.quantity) as totalProdutosCancelados']);
				void qb.groupBy('1');
			} else if (subopcao === 'comprasTotais') {
				void qb.select(['oi.producer_product_id, ps.name, sum(oi.quantity * oi.price) as comprasTotaisCancelados']);
				void qb.groupBy('1');
			}
			void qb
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se')
				.leftJoin('pp.productSpec', 'ps');
		} else if (opcao === 'clients') {
			if (subopcao === 'numeroEncomendas') {
				void qb.select(['o.consumer_id, u.name, count(oi.order_id) as numeroEncomendasCancelados']);
				void qb.groupBy('1');
			} else if (subopcao === 'totalProdutos') {
				void qb.select(['o.consumer_id, u.name, sum(oi.quantity) as totalProdutosCancelados']);
				void qb.groupBy('1');
			} else if (subopcao === 'comprasTotais') {
				void qb.select(['o.consumer_id, u.name, sum(oi.quantity * oi.price) as comprasTotaisCancelados']);
				void qb.groupBy('1');
			} else if (subopcao === 'numeroProdutosEncomendados') {
				void qb.select(['o.consumer_id, u.name, count(oi.producer_product_id) as numeroProdutosEncomendadosCancelados']);
				void qb.groupBy('1');
			}
			void qb
				.leftJoin('o.shippingAddress', 'sa')
				.leftJoin('o.items', 'oi')
				.leftJoin('oi.producerProduct', 'pp')
				.leftJoin('pp.productionUnit', 'pu')
				.leftJoin('pu.address', 'pa')
				.leftJoin('oi.shipment', 's')
				.leftJoin('s.events', 'se')
				.leftJoin('o.consumer', 'c')
				.leftJoin('c.user', 'u');
		}

		if (consumerId) {
			void qb.andWhere('o.consumer_id = ?', [consumerId]);
		}

		if (producerId) {
			void qb.andWhere('pp.producer_id = ?', [producerId]);
		}

		if (categoryId) {
			void qb.leftJoin('pp.productSpec', 'ps').leftJoin('ps.categories', 'psc').andWhere('psc.category_id = ?', [categoryId]);
		}

		void qb
			.andWhere(
				`se.date = 
					(SELECT MAX(se_sub.date)
					FROM shipment_event se_sub
						LEFT JOIN order_item oi_sub on se_sub.shipment_id = oi_sub.shipment_id
					WHERE oi_sub.order_id = oi.order_id AND oi_sub.producer_product_id = oi.producer_product_id
					AND se_sub.date BETWEEN ? AND ?) and se.status = 4`,
				[dataInicio, dataFim]
			)
			.andWhere(
				`(2 * 6371 * ASIN( SQRT( POWER(SIN((RADIANS(pa.latitude) - RADIANS(sa.latitude)) / 2), 2) + COS(RADIANS(sa.latitude)) * COS(RADIANS(pa.latitude)) * POWER(SIN((RADIANS(pa.longitude) - RADIANS(sa.longitude)) / 2), 2)) ) ) <= ?`,
				[distancia]
			);

		let result;

		if (opcao === 'flashcards') {
			result = (await qb.execute())[0] as unknown as {
				numeroEncomendasCanceladas: string;
				totalProdutosCancelados: string;
				comprasTotaisCanceladas: string;
				numeroProdutosEncomendadosCancelados: string;
			};
			return {
				...result,
				// Sums may return null if there are no orders, but we IFNULL them to 0. Still, they may come as strings
				totalProdutos: parseInt(result.totalProdutosCancelados, 10),
				comprasTotais: parseFloat(result.comprasTotaisCanceladas)
			};
		} else if (opcao === 'map') {
			result = await qb.execute();
			const toReturn = [];
			for (const a of result) {
				toReturn.push({
					shippingAddress: a.shippingAddress,
					productionUnitAddress: {
						id: a.pa__id,
						number: a.pa__number,
						door: a.pa__door,
						floor: a.pa__floor,
						zipCode: a.pa__zip_code,
						street: a.pa__street,
						parish: a.pa__parish,
						county: a.pa__county,
						city: a.pa__city,
						district: a.pa__district,
						latitude: a.pa__latitude,
						longitude: a.pa__longitude
					}
				});
			}

			return toReturn;
		} else if (opcao === 'evolution' || opcao === 'products' || opcao === 'clients') {
			result = await qb.execute();
			return result;
		}
	}
}
