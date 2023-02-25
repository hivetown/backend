import { Response, Controller, Get } from '@decorators/express';
import { Injectable } from '@decorators/di';
import * as Express from 'express';
import { Producer } from '../entities/Producer';
import { ProducerProduct } from '../entities/ProducerProduct';
import { ProducerGateway } from '../gateways/ProducerGateway';
import { ProducerProductStatus } from '../enums/ProducerProductStatus';



// Create the controller
@Controller('/hello')
@Injectable()
export class HelloController {
	// Create a GET route
	@Get('world')
	index(@Response() res: Express.Response) {
		res.send('Hello World!');
	}

	// Create another GET route
	@Get('/json')
	json(@Response() res: Express.Response) {
		res.json({ hello: 'world' });
	}

	// Demo of using domain package
	@Get('/domain')
	async domain(@Response() res: Express.Response) {
		const product = new ProducerProduct();
		product.currentPrice = 1.99;
		product.id = 1;
		product.producer = new Producer();
		product.producer.id = 2;
		product.producer.name = 'Producer Name';
		product.producer.email = 'producer@email.com';
		product.producer.phone = 1234567890;
		product.producer.vat = 1234567890;
		product.productSpec = { id: 1, name: 'some product', description: 'some description', images: ['some image'], categories: null }
		product.productionDate = new Date();
		product.status = ProducerProductStatus.Available

		console.log("antes do init");
		try {
			// const pg: ProducerGateway = new ProducerGateway(orm);
			console.log("deu bom");
		} catch (err) {
			console.log(err);
		}

		// let producers: Producer[] = ProducerGateway.findAll();

		// for (let producer of producers) {
		// 	console.log(producer.name);
		// }

		res.json({ product });
	}


}
