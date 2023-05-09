import { Migration } from '@mikro-orm/migrations';

export class Migration20230501192519 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `consumer` add `deleted_at` datetime null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `consumer` drop `deleted_at`;');
	}
}
