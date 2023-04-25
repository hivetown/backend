import { Migration } from '@mikro-orm/migrations';

export class Migration20230409001046 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `order_item` drop foreign key `order_item_order_id_foreign`;');
		this.addSql('alter table `order_item` drop foreign key `order_item_producer_product_id_foreign`;');

		this.addSql('alter table `shipment_event` drop foreign key `shipment_event_shipment_id_foreign`;');

		this.addSql(
			'alter table `order_item` add constraint `order_item_order_id_foreign` foreign key (`order_id`) references `order` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `order_item` add constraint `order_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade on delete cascade;'
		);

		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade on delete cascade;'
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table `order_item` drop foreign key `order_item_order_id_foreign`;');
		this.addSql('alter table `order_item` drop foreign key `order_item_producer_product_id_foreign`;');

		this.addSql('alter table `shipment_event` drop foreign key `shipment_event_shipment_id_foreign`;');

		this.addSql(
			'alter table `order_item` add constraint `order_item_order_id_foreign` foreign key (`order_id`) references `order` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `order_item` add constraint `order_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade;'
		);
	}
}
