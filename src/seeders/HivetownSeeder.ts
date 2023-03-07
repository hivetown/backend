import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AddressFactory } from './factories/Address';
import { ProductSpecFactory } from './factories/ProductSpec';
import { ProductSpecCategoryFactory } from './factories/ProductSpecCategory';
import { CategoryFactory } from './factories/Category';
import { FieldFactory } from './factories/Field';
import { FieldPossibleValue } from '../entities';
import { FieldType } from '../enums';
import { ProductSpecFieldFactory } from './factories/ProductSpecField';
import { FieldPossibleValueFactory } from './factories/FieldPossibleValue';

export class HivetownSeeder extends Seeder {
	public async run(em: EntityManager): Promise<void> {
		// const productSpecs = new ProductSpecFactory(em).each((spec) => {
		// 	spec.categories.set(
		// 		new ProductSpecCategoryFactory(em)
		// 			.each((specCat) => {
		// 				const field = new FieldFactory(em)
		// 					.each((field) => {
		// 						const amount = Math.floor(Math.random() * 5);
		// 						if (amount !== 0) {
		// 							field.type = FieldType.Enum;
		// 							for (let i = 0; i < amount; i++) {
		// 								field.possibleValues.add(new FieldPossibleValueFactory(em).makeOne());
		// 							}
		// 						}
		// 					})
		// 					.makeOne();

		// 				specCat.category = new CategoryFactory(em)
		// 					.each((category) => {
		// 						category.fields.add(field);
		// 					})
		// 					.makeOne();

		// 				specCat.fields.set(
		// 					new ProductSpecFieldFactory(em)
		// 						.each((specField) => {
		// 							specField.field = field;
		// 						})
		// 						.make(5)
		// 				);
		// 			})
		// 			.make(5)
		// 	);
		// });

		// await productSpecs.create(10);

		// We create a ProductSpec
		await new ProductSpecFactory(em)
			.each((spec) => {
				// Each ProductSpec has ProductSpecCategories
				spec.categories.set(
					new ProductSpecCategoryFactory(em)
						.each((specCategory) => {
							// Each ProductSpecCategory has a link to a Category and ProductSpecFields of that Category
							specCategory.category = new CategoryFactory(em)
								.each((category) => {
									// We make some Fields for the Category
									// This is WRONG from the perspective of the business,
									// because we *may* end up having more Fields on the Category
									// than we will link to the ProductSpecCategory
									category.fields.add(
										new FieldFactory(em)
											.each((field) => {
												const amount = Math.floor(Math.random() * 5);
												if (amount !== 0) {
													field.type = FieldType.Enum;
													field.possibleValues.set(new FieldPossibleValueFactory(em).make(amount));
												}
											})
											.make(3)
									);
								})
								.makeOne();

							// TODO: THIS THROWS AN EXCEPTION (TypeError: Cannot read properties of undefined (reading '__helper') when console.logging instead of setting)
							// We link the ProductSpecFields to the Fields of the Category
							const productSpecFactory = new ProductSpecFieldFactory(em);
							// specCategory.fields.set(specCategory.category.fields.getItems().map((field) => productSpecFactory.makeOne({ field })));
							productSpecFactory.makeOne({
								field: { id: 1 }
							});
							console.log(specCategory.category.fields.getItems().map((field) => field.name));
						})
						.make(5)
				);
			})
			.create(10);
		// await em.persistAndFlush(productSpecs);
	}
}
