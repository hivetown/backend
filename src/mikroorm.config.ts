import type { Options } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
	entities: ['./dist/entities/**'],
	entitiesTs: ['./src/entities/**'],
	dbName: 'pgp04-rf03',
	type: 'mysql',
	metadataProvider: TsMorphMetadataProvider
};

export default config;
