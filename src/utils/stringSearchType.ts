import type { FilterValue } from '@mikro-orm/core/typings';
import { StringSearchType } from '../enums/StringSearchType';
import type { StringSearch } from '../interfaces/StringSearch';

export const stringSearchType = (search: StringSearch): FilterValue<string> => {
	switch (search.type) {
		case StringSearchType.CONTAINS:
			return { $like: `%${search.value}%` };
		case StringSearchType.STARTS_WITH:
			return { $like: `${search.value}%` };
		case StringSearchType.ENDS_WITH:
			return { $like: `%${search.value}` };
		case StringSearchType.EXACT:
		default:
			return search.value;
	}
};
