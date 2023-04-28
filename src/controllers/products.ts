import { Injectable } from '@decorators/di';
import { Controller, Delete, Get, Params, Post, Put, Request, Response } from '@decorators/express';
import * as Express from 'express';
import { isEmpty } from 'lodash';
import { container } from '..';
import { StringSearchType } from '../enums/StringSearchType';
import type { PaginatedOptions } from '../interfaces/PaginationOptions';
import type { ProductSpecFilters } from '../interfaces/ProductSpecFilters';
import type { ProductSpecOptions } from '../interfaces/ProductSpecOptions';
import type { FieldTypeType } from '../types/FieldType';
import { Joi, validate } from 'express-validation';
import { NotFoundError } from '../errors/NotFoundError';
import { ProductSpec } from '../entities';

@Controller('/products')
@Injectable()
export class ProductsController {
	@Get('/', [
		validate({
			query: Joi.object({
				categoryId: Joi.number().integer().min(1),
				search: Joi.string().min(3),
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1),
				field: Joi.object().pattern(/^'\d+'$/, Joi.array())
			})
		})
	])
	public async allProducts(@Response() res: Express.Response, @Request() req: Express.Request) {
		const queryFields = Object.entries((req.query.field as Record<string, string[]>) || {});
		const fields: { [key: number]: FieldTypeType[] } = {};
		// Remove field key string and get only the number part
		for (const [rawKey, rawValues] of queryFields) {
			// get only the number part of the key
			const key = Number(rawKey.match(/\d+/)?.[0]);
			if (!key) continue;

			// add the value to the new object
			if (fields[key]) fields[key].push(...rawValues);
			else fields[key] = [...rawValues];
		}

		const filters: ProductSpecFilters = {
			categoryId: Number(req.query.categoryId) || undefined,
			fields: isEmpty(fields) ? undefined : fields
		};

		if ('search' in req.query) {
			filters.search = { value: req.query.search as string, type: StringSearchType.CONTAINS };
		}

		const options: ProductSpecOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
			// sort: 'sort' in req.query ? (req.query.sort as string) : undefined
		};

		// const optionsFiltrados = Object.fromEntries(Object.entries(options).filter(([_, v]) => v !== undefined));
		const productsSpec = await container.productSpecGateway.findAll(filters, options);
		// console.log(productsSpec);

		return res.status(200).json(productsSpec);
	}

	@Post('/', [
		validate({
			body: Joi.object({
				name: Joi.string().required(),
				description: Joi.string().required()
			})
		})
	])
	public async createProductSpec(@Response() res: Express.Response, @Request() req: Express.Request) {
		const productSpec = new ProductSpec(req.body.name, req.body.description);
		await container.productSpecGateway.createOrUpdate(productSpec);
		return res.status(201).json(productSpec);
	}

	@Get('/:productSpecId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productSpecById(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		return res.status(200).json(productSpec);
	}

	@Put('/:productSpecId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			body: Joi.object({
				name: Joi.string().required(),
				description: Joi.string().required()
			})
		})
	])
	public async updateProductSpec(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		productSpec.name = req.body.name;
		productSpec.description = req.body.description;

		await container.productSpecGatway.createOrUpdate(productSpec);
		return res.status(200).json(productSpec);
	}

	@Delete('/:productSpecId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async deleteProductSpec(@Response() res: Express.Response, @Params('productSpecId') productSpecId: number) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		await container.productSpecGatway.delete(productSpec);
		return res.status(204).json();
	}

	@Get('/:productSpecId/products', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async productsBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const options: ProductSpecOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const results = await container.producerProductGateway.findBySpecificationId(productSpecId, options);
		return res.status(200).json(results);
	}

	@Get('/:productSpecId/products/:producerProductId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				producerProductId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productById(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('producerProductId') producerProductId: number
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const product = await container.producerProductGateway.findOneBySpecificationId(productSpecId, producerProductId);
		if (!product) throw new NotFoundError('Product not found');

		return res.status(200).json(product);
	}

	@Get('/:productSpecId/producers', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async producerByProductSpec(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const results = await container.producerGateway.findFromProductSpecId(productSpecId, options);
		return res.status(200).json(results);
	}

	@Get('/:productSpecId/categories', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async productCategoriesBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Request() req: Express.Request
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const results = await container.productSpecCategoryGateway.findCategoriesBySpecificationId(productSpecId, options);
		return res.status(200).json(results);
	}

	@Get('/:productSpecId/categories/:categoryId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				categoryId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productCategoryBySpecificationId(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const productSpecCategory = await container.productSpecCategoryGateway.findCategoryBySpecificationId(productSpecId, categoryId);
		if (!productSpecCategory) throw new NotFoundError('Category not found on product specification');

		return res.status(200).json(productSpecCategory.category);
	}

	@Get('/:productSpecId/categories/:categoryId/fields', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				categoryId: Joi.number().integer().min(1).required()
			}),
			query: Joi.object({
				page: Joi.number().integer().min(1),
				pageSize: Joi.number().integer().min(1)
			})
		})
	])
	public async productFieldsByCategoryOfSpecification(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number,
		@Request() req: Express.Request
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const options: PaginatedOptions = {
			page: Number(req.query.page) || -1,
			size: Number(req.query.pageSize) || -1
		};

		const fields = await container.productSpecFieldGateway.findAllFieldsByProductSpecIdAndCategoryId(productSpecId, categoryId, options);
		return res.status(200).json(fields);
	}

	@Get('/:productSpecId/categories/:categoryId/fields/:fieldId', [
		validate({
			params: Joi.object({
				productSpecId: Joi.number().integer().min(1).required(),
				categoryId: Joi.number().integer().min(1).required(),
				fieldId: Joi.number().integer().min(1).required()
			})
		})
	])
	public async productFieldByCategoryOfSpecificationAndField(
		@Response() res: Express.Response,
		@Params('productSpecId') productSpecId: number,
		@Params('categoryId') categoryId: number,
		@Params('fieldId') fieldId: number
	) {
		const productSpec = await container.productSpecGatway.findById(productSpecId);
		if (!productSpec) throw new NotFoundError('Product specification not found');

		const category = await container.categoryGateway.findById(categoryId);
		if (!category) throw new NotFoundError('Category not found');

		const field = await container.fieldGateway.findById(fieldId);
		if (!field) throw new NotFoundError('Field not found');

		const productSpecCategoryField = await container.productSpecFieldGateway.findFieldBySpecAndCategory(productSpecId, categoryId, fieldId);
		if (!productSpecCategoryField) throw new NotFoundError('Field not found on category of product spec');

		return res.status(200).json(productSpecCategoryField);
	}
}
