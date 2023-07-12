import type { CarrierStatus } from '../enums';
import type { StringSearch } from './StringSearch';

export interface CarrierFilters {
	productionUnitId?: number;
	status?: keyof typeof CarrierStatus;
	search?: StringSearch;
}
