import type http from 'http';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import { EntityManager, MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import express, { NextFunction, Request, Response } from 'express';
import { attachControllers } from '@decorators/express';
import { CategoryGateway, FieldGateway, ProducerGateway, ProductGateway, ProductSpecCategoryGateway, ProductSpecFieldGateway } from './gateways';
import { HelloController } from './controllers/hello';
import { ProductsController } from './controllers/products';
import { ProductSpecGateway } from './gateways/ProductSpecGateway';
import { CategoryController } from './controllers/category';
import { ServerErrorMiddleware } from './middlewares/error';
import { ConsumerController } from './controllers/consumer';
import { ConsumerGateway } from './gateways/ConsumerGateway';
import cookieParser from 'cookie-parser';
import { ProducersController } from './controllers/producers';
import { AddressGateway } from './gateways/AddressGateway';
import { CartItemGateway } from './gateways/CartItemGateway';
import { OrderItemGateway } from './gateways/OrderItemGateway';
import { OrderGateway } from './gateways/OrderGateway';
import { AuthController } from './controllers/auth';

export const container = {} as {
	server: http.Server;
	orm: MikroORM;
	em: EntityManager;
	addressGateway: AddressGateway;
	producerGateway: ProducerGateway;
	productGateway: ProductGateway;
	productSpecCategoryGateway: ProductSpecCategoryGateway;
	categoryGateway: CategoryGateway;
	productSpecGatway: ProductSpecGateway;
	fieldGateway: FieldGateway;
	consumerGateway: ConsumerGateway;
	productSpecFieldGateway: ProductSpecFieldGateway;
	productSpecGateway: ProductSpecGateway;
	cartItemGateway: CartItemGateway;
	orderItemGateway: OrderItemGateway;
	orderGateway: OrderGateway;
};

export const app = express();
const port = Number(process.env.PORT) || 3000;
export const main = async () => {
	container.orm = await MikroORM.init<MySqlDriver>();
	container.em = container.orm.em;
	container.addressGateway = new AddressGateway(container.orm);
	container.producerGateway = new ProducerGateway(container.orm);
	container.productGateway = new ProductGateway(container.orm);
	container.productSpecCategoryGateway = new ProductSpecCategoryGateway(container.orm);
	container.categoryGateway = new CategoryGateway(container.orm);
	container.productSpecGatway = new ProductSpecGateway(container.orm);
	container.fieldGateway = new FieldGateway(container.orm);
	container.consumerGateway = new ConsumerGateway(container.orm);
	container.productSpecFieldGateway = new ProductSpecFieldGateway(container.orm);
	container.productSpecGateway = new ProductSpecGateway(container.orm);
	container.cartItemGateway = new CartItemGateway(container.orm);
	container.orderItemGateway = new OrderItemGateway(container.orm);
	container.orderGateway = new OrderGateway(container.orm);

	app.use(express.json());
	app.use(cors());
	// Cookies
	app.use(cookieParser());

	app.use((_req: Request, _res: Response, next: NextFunction) => RequestContext.create(container.orm.em, next));

	const serverErrorMiddleware = new ServerErrorMiddleware();
	app.use(serverErrorMiddleware.use.bind(serverErrorMiddleware));

	await attachControllers(app, [HelloController]);
	await attachControllers(app, [ProductsController, CategoryController, ConsumerController]);
	await attachControllers(app, [AuthController, ProductsController, CategoryController, ConsumerController, ProducersController]);

	container.server = app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
};

void main();
