import type http from 'http';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import { EntityManager, MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import express, { NextFunction, Request, Response } from 'express';
import { attachControllers } from '@decorators/express';
import { CategoryGateway, ProducerGateway, ProductGateway, ProductSpecCategoryGateway } from './gateways';
import { HelloController } from './controllers/hello';
import { ProductsController } from './controllers/products';
import { ProductSpecGateway } from './gateways/ProductSpecGateway';
import { ServerErrorMiddleware } from './middlewares/error';

export const container = {} as {
	server: http.Server;
	orm: MikroORM;
	em: EntityManager;
	producerGateway: ProducerGateway;
	productGateway: ProductGateway;
	productSpecCategoryGateway: ProductSpecCategoryGateway;
	categoryGateway: CategoryGateway;
	productSpecGatway: ProductSpecGateway;
};

export const app = express();
const port = Number(process.env.PORT) || 3000;
export const main = async () => {
	container.orm = await MikroORM.init<MySqlDriver>();
	container.em = container.orm.em;
	container.producerGateway = new ProducerGateway(container.orm);
	container.productGateway = new ProductGateway(container.orm);
	container.productSpecCategoryGateway = new ProductSpecCategoryGateway(container.orm);
	container.categoryGateway = new CategoryGateway(container.orm);
	container.productSpecGatway = new ProductSpecGateway(container.orm);

	app.use(express.json());
	app.use(cors());
	app.use((_req: Request, _res: Response, next: NextFunction) => RequestContext.create(container.orm.em, next));

	const serverErrorMiddleware = new ServerErrorMiddleware();
	app.use(serverErrorMiddleware.use.bind(serverErrorMiddleware));

	await attachControllers(app, [HelloController]);
	await attachControllers(app, [ProductsController]);

	container.server = app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
};

void main();
