import type { EntityRepository, MikroORM } from '@mikro-orm/mysql';
import { Shipment } from '../entities';

export class ShipmentGateway {
	private repository: EntityRepository<Shipment>;

	public constructor(orm: MikroORM) {
		this.repository = orm.em.getRepository(Shipment);
	}

	public async findById(id: number): Promise<Shipment | null> {
		return this.repository.findOne(id);
	}

	public async update(shipment: Shipment): Promise<Shipment> {
		await this.repository.persistAndFlush(shipment);
		await this.repository.populate(shipment, ['carrier', 'events']);
		return shipment;
	}

	public async findByIdPopulated(id: number): Promise<Shipment | null> {
		return this.repository.findOne(id, { populate: ['carrier', 'events', 'events.status', 'events.address'] });
	}
}
