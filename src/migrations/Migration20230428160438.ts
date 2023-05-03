import { Migration } from '@mikro-orm/migrations';

export class Migration20230428160438 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `product_spec` add `deleted_at` datetime null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `product_spec` drop `deleted_at`;');
	}
}
