import { Migration } from '@mikro-orm/migrations';

export class Migration20230423100549 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `production_unit` add `deleted_at` datetime null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `production_unit` drop `deleted_at`;');
	}
}
