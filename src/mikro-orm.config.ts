import type { Options } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
	entities: ['./dist/entities/**'],
	entitiesTs: ['./src/entities/**'],
	port: 3306,
	user: 'root',
	host: 'localhost',
	type: 'mysql',
	dbName: 'hivetown',
	password: 'hello',
	metadataProvider: TsMorphMetadataProvider,
	migrations: {
		path: 'migrations',
	}
};

export default config;
