import { paginate } from '../src/utils/paginate';
import type { PaginatedOptions } from '../src/interfaces/PaginationOptions';

test('valid paginated example', () => {
	const options: PaginatedOptions = {
		page: 3,
		size: 10
	};

	const result = paginate(options);

	expect(result.limit).toEqual(10);
	expect(result.offset).toEqual(20);
});

test('invalid paginated example - negative page', () => {
	const options: PaginatedOptions = {
		page: -3,
		size: 10
	};

	const result = paginate(options);

	expect(result.limit).toEqual(10);
	expect(result.offset).toEqual(0);
});

test('invalid paginated example - negative size', () => {
	const options: PaginatedOptions = {
		page: 3,
		size: -10
	};

	const result = paginate(options);

	expect(result.limit).toEqual(1);
	expect(result.offset).toEqual(2);
});

test('invalid paginated example - negative page and size', () => {
	const options: PaginatedOptions = {
		page: -3,
		size: -10
	};

	const result = paginate(options);

	expect(result.limit).toEqual(1);
	expect(result.offset).toEqual(0);
});

test('invalid paginated example - size too big', () => {
	const options: PaginatedOptions = {
		page: 10,
		size: 1000
	};

	const result = paginate(options);

	expect(result.limit).toEqual(100);
	expect(result.offset).toEqual(900);
});
