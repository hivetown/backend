export interface BaseItems<T> {
	items: T[];
	totalItems: number;
	totalPages: number;
	page: number;
	pageSize: number;
}
