import type { FieldTypeType } from '../types/FieldType';
import type { StringSearch } from './StringSearch';

export interface ProductSpecFilters {
	categoryId?: number;
	/**
	 * @example
	 * { 14: ['female', 'male'], 15: ['red'] }
	 */
	fields?: { [key: number]: [FieldTypeType[]] };
	name?: StringSearch;
	description?: StringSearch;
}
