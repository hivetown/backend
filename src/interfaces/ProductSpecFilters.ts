import type { FieldType } from '../enums';
import type { PaginatedOptions } from './PaginationOptions';
import type { StringSearch } from './StringSearch';

export interface ProductSpecFilters {
	categoryId?: number;
	/**
	 * @example
	 * { 14: ['female', 'male'] }
	 */
	fields?: { [key: string]: FieldType[] };
	name?: StringSearch;
	description?: StringSearch;
}
