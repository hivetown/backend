import { Injectable } from '@decorators/di';
import { Controller, Get, Params, Response } from '@decorators/express';
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

	// @Post('/')

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

	// @Put('/{categoryId}')
	// @Delete('/{categoryId}')

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

	// @Put('/:categoryId/fields/:fieldId')
}
