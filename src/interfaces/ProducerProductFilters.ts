import type { StringSearch } from './StringSearch';

export interface ProducerProductFilters {
	productionUnitId?: number;
	producerId?: number;
	search?: StringSearch;
}
