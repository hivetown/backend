import { Migration } from '@mikro-orm/migrations';

export class Migration20230305001639 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `cart` drop foreign key `cart_items_product_id_items_cart_consumer_id_foreign`;');

		this.addSql('alter table `cart` drop index `cart_items_product_id_items_cart_consumer_id_index`;');
		this.addSql('alter table `cart` drop `items_product_id`;');
		this.addSql('alter table `cart` drop `items_cart_consumer_id`;');

		this.addSql('alter table `cart_item` modify `quantity` int not null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `cart_item` modify `quantity` numeric(10,0) not null;');

		this.addSql('alter table `cart` add `items_product_id` int unsigned not null, add `items_cart_consumer_id` int unsigned not null;');
		this.addSql(
			'alter table `cart` add constraint `cart_items_product_id_items_cart_consumer_id_foreign` foreign key (`items_product_id`, `items_cart_consumer_id`) references `cart_item` (`product_id`, `cart_consumer_id`) on update cascade;'
		);
		this.addSql(
			'alter table `cart` add index `cart_items_product_id_items_cart_consumer_id_index`(`items_product_id`, `items_cart_consumer_id`);'
		);
	}
}
