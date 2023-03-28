import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';

@Controller('/categories')
@Injectable()
export class CategoryController {
	@Get('/')
	public async allParentCategories(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			const options: PaginatedOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};

			const items = await container.categoryGateway.findAllRoot(options);
			res.status(200).json(items);
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
				category.image = req.body.image;
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

	@Get('/:categoryId/children', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			})
		})
	])
	public async categoryCategories(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Request() req: Express.Request) {
		try {
			const options: PaginatedOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};
			const items = await container.categoryGateway.findAllChildrenOfCategory(categoryId, options);
			res.status(200).json(items);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId/fields')
	public async allFieldsByCategoryId(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Request() req: Express.Request) {
		try {
			const options: PaginatedOptions = {
				page: Number(req.query.page) || -1,
				size: Number(req.query.pageSize) || -1
			};
			const items = await container.fieldGateway.findFieldsByCategoryId(categoryId, options);
			if (items.totalItems > 0) {
				res.status(200).json(items);
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
			const field = await container.fieldGateway.findFieldByCategoryId(categoryId, fieldId);
			if (field) {
				res.status(200).json(field);
			} else {
				res.status(404).json({ error: 'Category or Field not found' });
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
				console.log('hello');
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

	@Delete('/:categoryId/fields/:fieldId')
	public async removeFieldFromCategory(
		@Response() res: Express.Response,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		try {
			const category = await container.categoryGateway.findByIdWithFields(categoryId);
			const field = await container.fieldGateway.findById(fieldId);

			if (category && field) {
				category.fields.remove(field);
				await container.categoryGateway.update(category);
				res.status(204).json('The field was removed from the category');
			} else {
				res.status(404).json({ error: 'Category or field not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
