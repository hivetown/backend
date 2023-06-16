import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Notification } from '../entities';
import type { BaseItems } from '../interfaces/BaseItems';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { paginate } from '../utils/paginate';
import type { NotificationFilter } from '../interfaces/NotificationFilter';

export class NotificationGateway {
	private repository: EntityRepository<Notification>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Notification);
	}

	public async findAll(filter: NotificationFilter, options: PaginatedOptions): Promise<BaseItems<Notification>> {
		const actualFilter = this.calculateFilter(filter);
		const pagination = paginate(options);

		const qb = this.repository.createQueryBuilder('notification').select('*').where(actualFilter);

		const totalItemsQb = qb.clone();

		// Paginate
		void qb.offset(pagination.offset).limit(pagination.limit);

		// Join relations
		void qb.leftJoinAndSelect('notification.actor', 'actor').leftJoinAndSelect('actor.image', 'actor_image').orderBy({ createdAt: 'DESC' });

		// Fetch results and map them
		const [totalResults, notifications] = await Promise.all([totalItemsQb.getCount(), qb.getResultList()]);

		return {
			items: notifications,
			totalItems: totalResults,
			totalPages: Math.ceil(totalResults / pagination.limit),
			page: Math.ceil(pagination.offset / pagination.limit) + 1,
			pageSize: notifications.length
		};
	}

	public async create(notification: Notification): Promise<Notification> {
		const data = this.repository.create(notification);
		await this.repository.persistAndFlush(data);
		return notification;
	}

	public async findById(id: number): Promise<Notification | null> {
		return this.repository.findOne(id, { populate: ['actor', 'actor.image'] });
	}

	public async delete(notification: Notification): Promise<void> {
		await this.repository.removeAndFlush(notification);
	}

	public async update(notification: Notification): Promise<Notification> {
		await this.repository.persistAndFlush(notification);
		return notification;
	}

	private calculateFilter(filter: NotificationFilter) {
		const mikroOrmFilter: Record<string, unknown> = {};
		if (filter.notifierId) mikroOrmFilter.notifier = filter.notifierId;

		const createdAtFilter: Record<string, unknown> = {};
		if (filter.after) createdAtFilter.$gte = filter.after;

		if (filter.before) createdAtFilter.$lte = filter.before;

		if (filter.unreadOnly) mikroOrmFilter.readAt = null;

		if (Object.keys(createdAtFilter).length > 0) mikroOrmFilter.createdAt = createdAtFilter;

		return mikroOrmFilter;
	}
}
