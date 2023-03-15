import type { ProducerProduct } from '../entities';
import type { PaginatedOptions } from './PaginationOptions';
import type { PopulateOptions } from './PopulateOptions';

export interface ProducerProductOptions extends PaginatedOptions, PopulateOptions<ProducerProduct> {}
