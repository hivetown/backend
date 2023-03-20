import { Migration } from '@mikro-orm/migrations';

export class Migration20230313152403 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `cart_item` drop foreign key `cart_item_product_id_foreign`;');

		this.addSql('alter table `shipment_event` drop foreign key `shipment_event_shipment_status_id_foreign`;');

		this.addSql('alter table `cart_item` drop index `cart_item_product_id_index`;');
		this.addSql('alter table `cart_item` drop primary key;');
		this.addSql('alter table `cart_item` change `product_id` `producer_product_id` int unsigned not null;');
		this.addSql(
			'alter table `cart_item` add constraint `cart_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade;'
		);
		this.addSql('alter table `cart_item` add index `cart_item_producer_product_id_index`(`producer_product_id`);');
		this.addSql('alter table `cart_item` add primary key `cart_item_pkey`(`producer_product_id`, `consumer_id`);');

		this.addSql('alter table `shipment_event` drop index `shipment_event_shipment_status_id_index`;');
		this.addSql('alter table `shipment_event` change `shipment_status_id` `status_id` int unsigned not null;');
		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_status_id_foreign` foreign key (`status_id`) references `shipment_status` (`id`) on update cascade;'
		);
		this.addSql('alter table `shipment_event` add index `shipment_event_status_id_index`(`status_id`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `cart_item` drop foreign key `cart_item_producer_product_id_foreign`;');

		this.addSql('alter table `shipment_event` drop foreign key `shipment_event_status_id_foreign`;');

		this.addSql('alter table `cart_item` drop index `cart_item_producer_product_id_index`;');
		this.addSql('alter table `cart_item` drop primary key;');
		this.addSql('alter table `cart_item` change `producer_product_id` `product_id` int unsigned not null;');
		this.addSql(
			'alter table `cart_item` add constraint `cart_item_product_id_foreign` foreign key (`product_id`) references `producer_product` (`id`) on update cascade;'
		);
		this.addSql('alter table `cart_item` add index `cart_item_product_id_index`(`product_id`);');
		this.addSql('alter table `cart_item` add primary key `cart_item_pkey`(`product_id`, `consumer_id`);');

		this.addSql('alter table `shipment_event` drop index `shipment_event_status_id_index`;');
		this.addSql('alter table `shipment_event` change `status_id` `shipment_status_id` int unsigned not null;');
		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_shipment_status_id_foreign` foreign key (`shipment_status_id`) references `shipment_status` (`id`) on update cascade;'
		);
		this.addSql('alter table `shipment_event` add index `shipment_event_shipment_status_id_index`(`shipment_status_id`);');
	}
}
