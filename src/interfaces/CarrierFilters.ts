import type { CarrierStatus } from '../enums';

export interface CarrierFilters {
	productionUnitId?: number;
	status?: keyof typeof CarrierStatus;
}
