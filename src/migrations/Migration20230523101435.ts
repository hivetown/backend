import { Migration } from '@mikro-orm/migrations';

export class Migration20230523101435 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `carrier` add `deleted_at` datetime null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `carrier` drop `deleted_at`;');
	}
}
