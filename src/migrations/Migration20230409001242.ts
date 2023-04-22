import { Migration } from '@mikro-orm/migrations';

export class Migration20230409001242 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `order_item` drop foreign key `order_item_producer_product_id_foreign`;');

		this.addSql(
			'alter table `order_item` add constraint `order_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade;'
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table `order_item` drop foreign key `order_item_producer_product_id_foreign`;');

		this.addSql(
			'alter table `order_item` add constraint `order_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade on delete cascade;'
		);
	}
}
