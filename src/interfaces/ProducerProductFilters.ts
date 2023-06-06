import type { Address } from '../entities';
import type { StringSearch } from './StringSearch';

export interface ProducerProductFilters {
	productionUnitId?: number;
	producerId?: number;
	search?: StringSearch;
	raio?: number;
	consumerAddress?: Address;
	productSpecId?: number;
}
