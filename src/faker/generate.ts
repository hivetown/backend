import { faker } from '@faker-js/faker';
import { generateRandomProductSpec } from './factories/productSpec';
import type { ProductSpec } from '../entities';

const productSpecQuantity = faker.datatype.number(200);
export const randomProductSpecs: ProductSpec[] = [];
for (let i = 0; i < productSpecQuantity; i++) {
	randomProductSpecs.push(generateRandomProductSpec());
}
