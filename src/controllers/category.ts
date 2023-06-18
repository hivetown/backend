import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { Joi, validate } from 'express-validation';
import { container } from '..';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import { NotFoundError } from '../errors/NotFoundError';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ConflictError } from '../errors/ConflictError';
import { Permission } from '../enums/Permission';
import type { CategoryFilters } from '../interfaces/CategoryFilters';

@Controller('/categories')
@Injectable()
export class CategoryController {
	@Get('/', [
		validate({
			query: Joi.object({
				page: Joi.number().min(1),
				pageSize: Joi.number().min(1),
				productMinPrice: Joi.number().min(0),
				productMaxPrice: Joi.number().min(0),
				productSearch: Joi.string(),
				parentId: Joi.number().min(1)
			})
		})
	])
	public async allParentCategories(@Response() res: Express.Response, @Request() req: Express.Request) {
		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const filters: CategoryFilters = {
			productMinPrice: Number(req.query.productMinPrice) || undefined,
			productMaxPrice: Number(req.query.productMaxPrice) || undefined,
			productSearch: req.query.productSearch?.toString() || undefined,
			parentId: Number(req.query.parentId) || undefined
		};

		const items = await container.categoryGateway.findAll(filters, options);
		return res.status(200).json(items);
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
		}),
		authenticationMiddleware,
		authorizationMiddleware({ permissions: Permission.WRITE_CATEGORY })
	])
	public async createCategory(@Response() res: Express.Response, @Request() req: Express.Request) {
		const category = await container.categoryGateway.create(req.body);
		return res.status(201).json(category);
	}

	@Get('/:categoryId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			})
		})
	])
	public async categoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		return res.status(200).json(category);
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
		}),
		authenticationMiddleware,
		authorizationMiddleware({ permissions: Permission.WRITE_CATEGORY })
	])
	public async updateCategoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Request() req: Express.Request) {
		const category = await container.categoryGateway.findById(categoryId);

		if (!category) throw new NotFoundError('Category not found');

		category.name = req.body.name;
		category.parent = req.body.parent;
		category.image = req.body.image;

		const categoryUpdated = await container.categoryGateway.update(category);
		return res.status(201).json(categoryUpdated);
	}

	@Delete('/:categoryId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({ permissions: Permission.DELETE_CATEGORY })
	])
	public async deleteCategoryById(@Response() res: Express.Response, @Params('categoryId') categoryId: number) {
		const categoryToRemove = await container.categoryGateway.findById(categoryId);

		if (!categoryToRemove) throw new NotFoundError('Category not found');
		await container.categoryGateway.remove(categoryToRemove);

		return res.status(204).send();
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
		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const items = await container.fieldGateway.findFieldsByCategoryId(categoryId, options);
		return res.status(200).json(items);
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
		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const field = await container.fieldGateway.findById(fieldId);
		if (!field) throw new NotFoundError('Field not found');

		const categoryField = await container.fieldGateway.findFieldByCategoryId(categoryId, fieldId);
		if (!categoryField) throw new NotFoundError('Field not found in category');

		return res.status(200).json(categoryField);
	}

	@Put('/:categoryId/fields/:fieldId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required(),
				fieldId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({ permissions: Permission.WRITE_CATEGORY })
	])
	public async addFieldToCategory(@Response() res: Express.Response, @Params('categoryId') categoryId: number, @Params('fieldId') fieldId: number) {
		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const field = await container.fieldGateway.findById(fieldId);
		if (!field) throw new NotFoundError('Field not found');

		try {
			category.fields.add(field);
			await container.categoryGateway.update(category);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) throw new ConflictError('Field already exists in category');
		}

		return res.status(201).json(field);
	}

	@Delete('/:categoryId/fields/:fieldId', [
		validate({
			params: Joi.object({
				categoryId: Joi.number().min(1).required(),
				fieldId: Joi.number().min(1).required()
			})
		}),
		authenticationMiddleware,
		authorizationMiddleware({ permissions: Permission.WRITE_CATEGORY })
	])
	public async removeFieldFromCategory(
		@Response() res: Express.Response,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		const category = await container.categoryGateway.findByIdWithFields(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const field = await container.fieldGateway.findById(fieldId);
		if (!field) throw new NotFoundError('Field not found');

		const categoryField = await container.fieldGateway.findFieldByCategoryId(categoryId, fieldId);
		if (!categoryField) throw new NotFoundError('Field not found in category');

		category.fields.remove(categoryField);
		await container.categoryGateway.update(category);

		return res.status(204).send();
	}
}
