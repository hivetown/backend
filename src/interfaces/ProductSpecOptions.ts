import type { PaginatedOptions } from './PaginationOptions';

export interface ProductSpecOptions extends PaginatedOptions {
	orderBy?: 'AZ' | 'ZA' | 'priceAsc' | 'priceDesc' | 'popularityAsc' | 'popularityDesc';
}
