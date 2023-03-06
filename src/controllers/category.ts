import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { container } from '..';

@Controller('/categories')
@Injectable()
export class CategoryController {
	@Get('/')
	public async allCategories(@Response() res: Express.Response) {
		try {
			const categories = await container.categoryGateway.findAll();
			res.json({ categories });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Post('/')
	public async createCategory(@Response() res: Express.Response, @Request() req: Express.Request) {
		try {
			const category = await container.categoryGateway.create(req.body);
			res.status(201).json({ category });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}

	@Get('/:categoryId')
	public async categoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const category = await container.categoryGateway.findById(categoryId);
			res.json({ category });
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
				res.status(200).json({ categoryUpdated });
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

	@Get('/:categoryId/fields')
	public async allFieldsByCategoryId(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		try {
			const categories = await container.categoryGateway.findWithFieldsById(categoryId);
			const fields = categories?.fields.getItems();
			res.json({ fields });
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
			const categories = await container.categoryGateway.findWithFieldsById(categoryId);
			const fields = categories?.fields.getItems();
			const field = fields?.find((field) => field.id === Number(fieldId));

			res.json({ field });
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
				category.addField(field);
				await container.categoryGateway.update(category);
				res.status(201).json({ category });
			} else {
				res.status(404).json({ error: 'Category or field not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: (error as any).message });
		}
	}
}
