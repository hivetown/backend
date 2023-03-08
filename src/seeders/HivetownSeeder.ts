import type { EntityManager } from '@mikro-orm/core';
import { faker, Seeder } from '@mikro-orm/seeder';
import { ProductSpecFactory } from './factories/ProductSpec';
import { ProductSpecCategoryFactory } from './factories/ProductSpecCategory';
import { CategoryFactory } from './factories/Category';
import { FieldFactory } from './factories/Field';
import { FieldType } from '../enums';
import { ProductSpecFieldFactory } from './factories/ProductSpecField';
import { FieldPossibleValueFactory } from './factories/FieldPossibleValue';

export class HivetownSeeder extends Seeder {
	public async run(em: EntityManager): Promise<void> {
		const productSpecs = await new ProductSpecFactory(em)
			.each((spec) => {
				spec.categories.set(
					new ProductSpecCategoryFactory(em)
						.each((specCategory) => {
							specCategory.category = new CategoryFactory(em)
								.each((category) => {
									// We make some Fields for the Category
									// This is WRONG from the perspective of the business,
									// because we *may* end up having more Fields on the Category
									// than we will link to the ProductSpecCategory
									category.fields.add(
										new FieldFactory(em)
											.each((field) => {
												const amount = faker.datatype.number(5);
												if (amount) {
													field.type = FieldType.Enum;
													field.possibleValues.set(new FieldPossibleValueFactory(em).make(amount));
												}
											})
											.make(3)
									);
								})
								.makeOne();

							return specCategory;
						})
						.make(10)
				);
			})
			.create(10);

		// Create ProductSpecFields. THIS IS THE CORRECT WAY TO DO IT BECAUSE IT DEPENDS ON IDS CREATED BEFOREHAND
		const productSpecFieldFactory = new ProductSpecFieldFactory(em);
		productSpecs.forEach((spec) => {
			spec.categories.getItems().forEach((specCategory) => {
				specCategory.category.fields.getItems().map((field) =>
					productSpecFieldFactory.makeOne({
						field: field.id,
						productSpecCategory: { category: specCategory.category.id, productSpec: spec.id }
					})
				);
			});
		});

		// Flush the changes to the database
		await em.flush();
	}
}

// if (field.type === FieldType.Enum) {
// 	productSpecField.value = faker.random.arrayElement(field.possibleValues.getItems());
// }
