import { ProductSpec, ProductSpecCategory } from '../../entities';
import { generateRandomCategory } from './category';
import { generateRandomProductSpecField } from './productSpecField';

export const generateRandomProductSpecCategory = (productSpec: ProductSpec): ProductSpecCategory => {
	const productSpecCategory = new ProductSpecCategory();
	// AVOID CIRCULAR DEPENDENCIES
	// producerProduct.productSpec = generateRandomProductSpec();
	productSpecCategory.productSpec = productSpec;
	productSpecCategory.category = generateRandomCategory();

	const { fields } = productSpecCategory.category;
	for (const field of fields) {
		productSpecCategory.fields.add(generateRandomProductSpecField(productSpecCategory, field));
	}
	return productSpecCategory;
};
