import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';

@Controller('/categories')
@Injectable()
export class CategoryController {
	@Get('/')
	public async allCategories(@Response() res: Express.Response) {
		try {
			const items = await container.categoryGateway.findAll();
			if (items.length > 0) {
				res.status(200).json({ items });
			} else {
				res.status(404).json({ error: 'Categories not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Post('/')
	public async createCategory(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			const category = await container.categoryGateway.create(req.body);
			res.status(201).json(category);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId')
	public async categoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			if (category) {
				res.status(200).json(category);
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Put('/:categoryId')
	public async updateCategoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Request() req: Express.Request) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			if (category) {
				category.name = req.body.name;
				category.parent = req.body.parent;
				const categoryUpdated = await container.categoryGateway.update(category);
				res.status(201).json(categoryUpdated);
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Delete('/:categoryId')
	public async deleteCategoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const categoryTBremoved = await container.categoryGateway.findById(categoryId);
			if (categoryTBremoved) {
				await container.categoryGateway.remove(categoryTBremoved);
				res.status(204);
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId/categories', [
		validate({
			query: Joi.object({
				categoryId: Joi.number().min(1).required()
			})
		})
	])
	public async categoryCategories(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const items = await container.categoryGateway.findAllChildrenOfCategory(categoryId);
			if (items.length > 0) {
				res.status(200).json({ items });
			} else {
				res.status(404).json({ error: 'Categories not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId/fields')
	public async allFieldsByCategoryId(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const category = await container.categoryGateway.findWithFieldsById(categoryId);
			if (category) {
				const items = category.fields.getItems();
				res.status(200).json({ items });
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId/fields/:fieldId')
	public async fieldByCategoryIdAndFieldId(
		@Response() res: Express.Response,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		try {
			const category = await container.categoryGateway.findWithFieldsById(categoryId);

			if (category) {
				const fields = category.fields.getItems();
				const field = fields.find((field) => field.id === Number(fieldId));
				if (field) {
					res.status(200).json(field);
				} else {
					res.status(404).json({ error: 'Field not found' });
				}
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Put('/:categoryId/fields/:fieldId')
	public async addFieldToCategory(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Params('fieldId') fieldId: number) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			const field = await container.fieldGateway.findById(fieldId);

			if (category && field) {
				category.fields.add(field);
				await container.categoryGateway.update(category);
				res.status(201).json(field);
			} else {
				res.status(404).json({ error: 'Category or field not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
