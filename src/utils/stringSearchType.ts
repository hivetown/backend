import { StringSearchType } from '../enums/StringSearchType';
import type { StringSearch } from '../interfaces/StringSearch';

export const stringSearchType = (search: StringSearch): string => {
	switch (search.type) {
		case StringSearchType.CONTAINS:
			return `%${search.value.toLowerCase()}%`;
		case StringSearchType.STARTS_WITH:
			return `${search.value.toLowerCase()}%`;
		case StringSearchType.ENDS_WITH:
			return `%${search.value.toLowerCase()}`;
		case StringSearchType.EXACT:
		default:
			return search.value;
	}
};
