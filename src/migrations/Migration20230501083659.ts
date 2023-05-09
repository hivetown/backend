import { Migration } from '@mikro-orm/migrations';

export class Migration20230501083659 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `producer` add `deleted_at` datetime null;');

		this.addSql('alter table `producer_product` add `deleted_at` datetime null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `producer` drop `deleted_at`;');

		this.addSql('alter table `producer_product` drop `deleted_at`;');
	}
}
