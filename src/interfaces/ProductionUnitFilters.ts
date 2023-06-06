import type { Address } from '../entities';
import type { StringSearch } from './StringSearch';

export interface ProductionUnitFilters {
	producerId?: number;
	search?: StringSearch;
	raio?: number;
	address?: Address;
}
