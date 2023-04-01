import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { AuthMiddleware } from '../middlewares/auth';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';

@Controller('/categories')
@Injectable()
export class CategoryController {
	@Get('/', [
		validate({
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		})
	])
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

	@Post('/', [
		validate({
			body: Joi.object({
				name: Joi.string().required(),
				parent: Joi.number().min(1),
				image: Joi.object({
					name: Joi.string().required(),
					url: Joi.string().required(),
					alt: Joi.string().required()
				})
			})
		})
	])
	public async createCategory(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			const category = await container.categoryGateway.create(req.body);
			res.status(201).json(category);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			})
		})
	])
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

	@Put('/:categoryId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			}),
			body: Joi.object({
				name: Joi.string().required(),
				parent: Joi.number().min(1),
				image: Joi.object({
					name: Joi.string().required(),
					url: Joi.string().required(),
					alt: Joi.string().required()
				})
			})
		})
	])
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

	@Delete('/:categoryId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			})
		}),
		AuthMiddleware
	])
	public async deleteCategoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const categoryTBremoved = await container.categoryGateway.findById(categoryId);
			if (categoryTBremoved) {
				await container.categoryGateway.remove(categoryTBremoved);
				res.status(204).json({ message: 'Category removed' });
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
			}),
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		})
	])
	public async categoryCategories(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Request() req: Express.Request) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			if (category) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};
				const items = await container.categoryGateway.findAllChildrenOfCategory(categoryId, options);
				res.status(200).json(items);
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId/fields', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1)
			})
		})
	])
	public async allFieldsByCategoryId(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Request() req: Express.Request) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			if (category) {
				const options: PaginatedOptions = {
					page: Number(req.query.page) || -1,
					size: Number(req.query.pageSize) || -1
				};
				const items = await container.fieldGateway.findFieldsByCategoryId(categoryId, options);

				res.status(200).json(items);
			} else {
				res.status(404).json({ error: 'Category not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId/fields/:fieldId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required(),
				fieldId: Joi.number().min(1).required()
			})
		})
	])
	public async fieldByCategoryIdAndFieldId(
		@Response() res: Express.Response,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			if (category) {
				const field = await container.fieldGateway.findById(fieldId);
				if (field) {
					const f = await container.fieldGateway.findFieldByCategoryId(categoryId, fieldId);

					if (f) {
						res.status(200).json(f);
					} else {
						res.status(404).json({ error: 'Field not found in this category' });
					}
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

	@Put('/:categoryId/fields/:fieldId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required(),
				fieldId: Joi.number().min(1).required()
			})
		}),
		AuthMiddleware
	])
	public async addFieldToCategory(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Params('fieldId') fieldId: number) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			const field = await container.fieldGateway.findById(fieldId);

			if (category) {
				if (field) {
					category.fields.add(field);
					await container.categoryGateway.update(category);
					res.status(201).json(field);
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

	@Delete('/:categoryId/fields/:fieldId')
	public async removeFieldFromCategory(
		@Response() res: Express.Response,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		try {
			const category = await container.categoryGateway.findByIdWithFields(categoryId);
			if (category) {
				const field = await container.fieldGateway.findById(fieldId);
				if (field) {
					const f = await container.fieldGateway.findFieldByCategoryId(categoryId, fieldId);
					if (f) {
						category.fields.remove(f);
						await container.categoryGateway.update(category);
						res.status(204).json('The field was removed from the category');
					} else {
						res.status(404).json({ error: 'Field not found in this category' });
					}
				} else {
					res.status(404).json({ error: 'Field not found' });
				}
			} else {
				res.status(404).json({ error: 'Category or field not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
