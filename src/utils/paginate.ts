import type { PaginatedOptions } from '../interfaces/PaginationOptions';

export const paginate = (options: PaginatedOptions = { page: 1, size: 24 }, max = 100) => {
	options.size = options.size === -1 ? 24 : options.size;
	options.page = options.page === -1 ? 1 : options.page;
	// At least 1, at most "max"
	const size = Math.max(Math.min(options.size, max), 1);
	// At least 1
	const page = Math.max(options.page, 1);

	const offset = (page - 1) * size;
	const limit = size;

	return { offset, limit };
};
