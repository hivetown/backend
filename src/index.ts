import type http from 'http';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import { EntityManager, MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import express, { NextFunction, Request, Response } from 'express';
import { attachControllers } from '@decorators/express';
import { ServerErrorMiddleware } from './middlewares/error';
import cookieParser from 'cookie-parser';
import {
	CartItemGateway,
	CategoryGateway,
	FieldGateway,
	OrderItemGateway,
	ProducerGateway,
	ProducerProductGateway,
	ProductSpecGateway,
	ProductSpecCategoryGateway,
	ProductSpecFieldGateway,
	AddressGateway,
	ConsumerGateway,
	OrderGateway,
	ProductionUnitGateway,
	ShipmentGateway,
	CarrierGateway,
	UserGateway,
	NotificationGateway
} from './gateways';
import { HelloController } from './controllers/hello';
import { ProductsController } from './controllers/products';
import { CategoryController } from './controllers/category';
import { ConsumerController } from './controllers/consumer';
import { ProducersController } from './controllers/producers';
import { AuthController } from './controllers/auth';
import { WebhookController } from './controllers/webhook';
import { NotificationController } from './controllers/notifications';

// ENV
import { config } from 'dotenv-cra';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config();

export const container = {} as {
	server: http.Server;
	orm: MikroORM;
	em: EntityManager;
	addressGateway: AddressGateway;
	producerGateway: ProducerGateway;
	producerProductGateway: ProducerProductGateway;
	productSpecCategoryGateway: ProductSpecCategoryGateway;
	categoryGateway: CategoryGateway;
	productSpecGatway: ProductSpecGateway;
	fieldGateway: FieldGateway;
	consumerGateway: ConsumerGateway;
	notificationGateway: NotificationGateway;
	orderGateway: OrderGateway;
	orderItemGateway: OrderItemGateway;
	productSpecFieldGateway: ProductSpecFieldGateway;
	productSpecGateway: ProductSpecGateway;
	cartItemGateway: CartItemGateway;
	productionUnitGateway: ProductionUnitGateway;
	shipmentGateway: ShipmentGateway;
	carrierGateway: CarrierGateway;
	userGateway: UserGateway;
};

export const app = express();
const port = Number(process.env.PORT) || 3000;
export const main = async () => {
	container.orm = await MikroORM.init<MySqlDriver>();
	container.em = container.orm.em;
	container.addressGateway = new AddressGateway(container.orm);
	container.producerGateway = new ProducerGateway(container.orm);
	container.producerProductGateway = new ProducerProductGateway(container.orm);
	container.productSpecCategoryGateway = new ProductSpecCategoryGateway(container.orm);
	container.categoryGateway = new CategoryGateway(container.orm);
	container.productSpecGatway = new ProductSpecGateway(container.orm);
	container.fieldGateway = new FieldGateway(container.orm);
	container.consumerGateway = new ConsumerGateway(container.orm);
	container.notificationGateway = new NotificationGateway(container.orm);
	container.orderGateway = new OrderGateway(container.orm);
	container.orderItemGateway = new OrderItemGateway(container.orm);
	container.productSpecFieldGateway = new ProductSpecFieldGateway(container.orm);
	container.productSpecGateway = new ProductSpecGateway(container.orm);
	container.cartItemGateway = new CartItemGateway(container.orm);
	container.productionUnitGateway = new ProductionUnitGateway(container.orm);
	container.orderItemGateway = new OrderItemGateway(container.orm);
	container.orderGateway = new OrderGateway(container.orm);
	container.shipmentGateway = new ShipmentGateway(container.orm);
	container.carrierGateway = new CarrierGateway(container.orm);
	container.userGateway = new UserGateway(container.orm);

	app.use(express.json());
	app.use(cors());
	// Cookies
	app.use(cookieParser());

	app.use((_req: Request, _res: Response, next: NextFunction) => RequestContext.create(container.orm.em, next));

	const serverErrorMiddleware = new ServerErrorMiddleware();
	app.use(serverErrorMiddleware.use.bind(serverErrorMiddleware));

	await attachControllers(app, [HelloController]);
	await attachControllers(app, [
		AuthController,
		ProductsController,
		CategoryController,
		ConsumerController,
		NotificationController,
		ProducersController,
		WebhookController
	]);

	app.use('/', (_req, res) => {
		res.status(200).send('Hello Hivetown!');
	});

	container.server = app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
};

void main();
