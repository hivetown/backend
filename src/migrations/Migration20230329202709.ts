import { Migration } from '@mikro-orm/migrations';

export class Migration20230329202709 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `order` drop foreign key `order_consumer_id_foreign`;');
		this.addSql('alter table `order` drop foreign key `order_shipping_address_id_foreign`;');

		this.addSql('alter table `order` modify `consumer_id` int unsigned not null, modify `shipping_address_id` int unsigned not null;');
		this.addSql(
			'alter table `order` add constraint `order_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `order` add constraint `order_shipping_address_id_foreign` foreign key (`shipping_address_id`) references `address` (`id`) on update cascade;'
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table `order` drop foreign key `order_consumer_id_foreign`;');
		this.addSql('alter table `order` drop foreign key `order_shipping_address_id_foreign`;');

		this.addSql('alter table `order` modify `consumer_id` int unsigned null, modify `shipping_address_id` int unsigned null;');
		this.addSql(
			'alter table `order` add constraint `order_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `order` add constraint `order_shipping_address_id_foreign` foreign key (`shipping_address_id`) references `address` (`id`) on update cascade on delete set null;'
		);
	}
}
