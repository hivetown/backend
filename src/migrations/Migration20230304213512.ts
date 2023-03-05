import { Migration } from '@mikro-orm/migrations';

export class Migration20230304213512 extends Migration {
	async up(): Promise<void> {
		this.addSql('drop table if exists `shipment_orders`;');
	}

	async down(): Promise<void> {
		this.addSql(
			'create table `shipment_orders` (`shipment_id` int unsigned not null, `order_item_order_id` int unsigned not null, `order_item_producer_product_id` int unsigned not null, primary key (`shipment_id`, `order_item_order_id`, `order_item_producer_product_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `shipment_orders` add index `shipment_orders_shipment_id_index`(`shipment_id`);');
		this.addSql(
			'alter table `shipment_orders` add index `shipment_orders_order_item_order_id_order_item_prod_747f7_index`(`order_item_order_id`, `order_item_producer_product_id`);'
		);

		this.addSql(
			'alter table `shipment_orders` add constraint `shipment_orders_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `shipment_orders` add constraint `shipment_orders_order_item_order_id_order_item_pr_46cd8_foreign` foreign key (`order_item_order_id`, `order_item_producer_product_id`) references `order_item` (`order_id`, `producer_product_id`) on update cascade on delete cascade;'
		);
	}
}
