import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { User } from '../entities';
import type { UserOptions } from '../interfaces/UserOptions';

export class UserGateway {
	private repository: EntityRepository<User>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(User);
	}

	public async create(user: User): Promise<User> {
		const data = this.repository.create(user);
		await this.repository.persistAndFlush(data);
		return user;
	}

	public async findByAuthId(authId: string, options?: UserOptions): Promise<User | null> {
		return this.repository.findOne({ authId }, { populate: options?.populate as any });
	}

	public async findById(id: number): Promise<User | null> {
		const user = await this.repository.findOne(id);
		return user;
	}
}
