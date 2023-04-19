import type http from 'http';
import cors from 'cors';
import { RequestContext } from '@mikro-orm/core';
import { EntityManager, MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import express, { NextFunction, Request, Response } from 'express';
import { attachControllers } from '@decorators/express';
import { ProducerGateway } from './gateways';
import { HelloController } from './controllers/hello';

// ENV
import { config } from 'dotenv-cra';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config();

export const container = {} as {
	server: http.Server;
	orm: MikroORM;
	em: EntityManager;
	producerGateway: ProducerGateway;
};

export const app = express();
const port = Number(process.env.PORT) || 3000;
export const main = async () => {
	container.orm = await MikroORM.init<MySqlDriver>();
	container.em = container.orm.em;
	container.producerGateway = new ProducerGateway(container.orm);

	app.use(express.json());
	app.use(cors());
	app.use((_req: Request, _res: Response, next: NextFunction) => RequestContext.create(container.orm.em, next));

	await attachControllers(app, [HelloController]);

	app.use('/', (_req, res) => {
		res.status(200).send('Hello Hivetown!');
	});

	container.server = app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
};

void main();
