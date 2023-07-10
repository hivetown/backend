import type { PaginatedOptions } from './PaginationOptions';

export interface CategoryOptions extends PaginatedOptions {
	orderBy?: 'AZ' | 'ZA' | 'popularityAsc' | 'popularityDesc';
}
