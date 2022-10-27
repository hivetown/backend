import type http from 'http';
import { RequestContext } from '@mikro-orm/core';
import { EntityManager, EntityRepository, MikroORM, MySqlDriver } from '@mikro-orm/mysql';
import express, { NextFunction, Request, Response } from 'express';
import { Producer, Product, ProductSpecification } from './entities';
import { ProductsRouter } from './routes';

export const container = {} as {
	server: http.Server;
	orm: MikroORM;
	em: EntityManager;
	producerRepository: EntityRepository<Producer>;
	productRepository: EntityRepository<Product>;
	productSpecificationRepository: EntityRepository<ProductSpecification>;
};

export const app = express();
const port = Number(process.env.PORT) || 3000;
export const main = async () => {
	container.orm = await MikroORM.init<MySqlDriver>();
	container.em = container.orm.em;
	container.producerRepository = container.orm.em.getRepository(Producer);
	container.productRepository = container.orm.em.getRepository(Product);
	container.productSpecificationRepository = container.orm.em.getRepository(ProductSpecification);

	app.use(express.json());
	app.use((_req: Request, _res: Response, next: NextFunction) => RequestContext.create(container.orm.em, next));

	app.get('/', (_req: Request, res: Response) => res.json({ message: 'Hello World!' }));
	app.use('/products', ProductsRouter);

	container.server = app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
};

void main();
