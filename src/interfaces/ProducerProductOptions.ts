import type { PaginatedOptions } from './PaginationOptions';
import type { PopulateOptions } from './PopulateOptions';

export interface ProducerProductOptions extends PaginatedOptions, PopulateOptions {
	orderBy?: 'name' | 'currentPrice';
}
