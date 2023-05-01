import { Migration } from '@mikro-orm/migrations';

export class Migration20230501205951 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `producer` drop foreign key `producer_user_id_foreign`;');

		this.addSql('alter table `consumer` drop foreign key `consumer_user_id_foreign`;');

		this.addSql('alter table `address` drop foreign key `address_consumer_user_id_foreign`;');

		this.addSql('alter table `production_unit` drop foreign key `production_unit_producer_user_id_foreign`;');

		this.addSql('alter table `producer_product` drop foreign key `producer_product_producer_user_id_foreign`;');

		this.addSql('alter table `cart_item` drop foreign key `cart_item_consumer_user_id_foreign`;');

		this.addSql('alter table `image` drop foreign key `image_consumer_user_id_foreign`;');
		this.addSql('alter table `image` drop foreign key `image_producer_image_user_id_foreign`;');
		this.addSql('alter table `image` drop foreign key `image_producer_images_user_id_foreign`;');

		this.addSql('alter table `order` drop foreign key `order_consumer_user_id_foreign`;');

		this.addSql('alter table `producer` drop primary key;');
		this.addSql('alter table `producer` change `user_id` `id` int unsigned not null;');
		this.addSql(
			'alter table `producer` add constraint `producer_id_foreign` foreign key (`id`) references `user` (`id`) on update cascade on delete cascade;'
		);
		this.addSql('alter table `producer` add primary key `producer_pkey`(`id`);');

		this.addSql('alter table `consumer` drop primary key;');
		this.addSql('alter table `consumer` change `user_id` `id` int unsigned not null;');
		this.addSql(
			'alter table `consumer` add constraint `consumer_id_foreign` foreign key (`id`) references `user` (`id`) on update cascade on delete cascade;'
		);
		this.addSql('alter table `consumer` add primary key `consumer_pkey`(`id`);');

		this.addSql('alter table `address` drop index `address_consumer_user_id_index`;');
		this.addSql('alter table `address` change `consumer_user_id` `consumer_id` int unsigned null;');
		this.addSql(
			'alter table `address` add constraint `address_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `address` add index `address_consumer_id_index`(`consumer_id`);');

		this.addSql('alter table `production_unit` drop index `production_unit_producer_user_id_index`;');
		this.addSql('alter table `production_unit` change `producer_user_id` `producer_id` int unsigned not null;');
		this.addSql(
			'alter table `production_unit` add constraint `production_unit_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;'
		);
		this.addSql('alter table `production_unit` add index `production_unit_producer_id_index`(`producer_id`);');

		this.addSql('alter table `producer_product` drop index `producer_product_producer_user_id_index`;');
		this.addSql('alter table `producer_product` change `producer_user_id` `producer_id` int unsigned not null;');
		this.addSql(
			'alter table `producer_product` add constraint `producer_product_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;'
		);
		this.addSql('alter table `producer_product` add index `producer_product_producer_id_index`(`producer_id`);');

		this.addSql('alter table `cart_item` drop index `cart_item_consumer_user_id_index`;');
		this.addSql('alter table `cart_item` drop primary key;');
		this.addSql('alter table `cart_item` change `consumer_user_id` `consumer_id` int unsigned not null;');
		this.addSql(
			'alter table `cart_item` add constraint `cart_item_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade;'
		);
		this.addSql('alter table `cart_item` add index `cart_item_consumer_id_index`(`consumer_id`);');
		this.addSql('alter table `cart_item` add primary key `cart_item_pkey`(`producer_product_id`, `consumer_id`);');

		this.addSql(
			'alter table `image` add `consumer_id` int unsigned null, add `producer_image_id` int unsigned null, add `producer_images_id` int unsigned null;'
		);
		this.addSql('alter table `image` drop index `image_consumer_user_id_unique`;');
		this.addSql('alter table `image` drop index `image_producer_image_user_id_unique`;');
		this.addSql('alter table `image` drop index `image_producer_images_user_id_index`;');
		this.addSql(
			'alter table `image` add constraint `image_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_producer_image_id_foreign` foreign key (`producer_image_id`) references `producer` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_producer_images_id_foreign` foreign key (`producer_images_id`) references `producer` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `image` drop `consumer_user_id`;');
		this.addSql('alter table `image` drop `producer_image_user_id`;');
		this.addSql('alter table `image` drop `producer_images_user_id`;');
		this.addSql('alter table `image` add unique `image_consumer_id_unique`(`consumer_id`);');
		this.addSql('alter table `image` add unique `image_producer_image_id_unique`(`producer_image_id`);');
		this.addSql('alter table `image` add index `image_producer_images_id_index`(`producer_images_id`);');

		this.addSql('alter table `order` drop index `order_consumer_user_id_index`;');
		this.addSql('alter table `order` change `consumer_user_id` `consumer_id` int unsigned not null;');
		this.addSql(
			'alter table `order` add constraint `order_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade;'
		);
		this.addSql('alter table `order` add index `order_consumer_id_index`(`consumer_id`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `producer` drop foreign key `producer_id_foreign`;');

		this.addSql('alter table `consumer` drop foreign key `consumer_id_foreign`;');

		this.addSql('alter table `address` drop foreign key `address_consumer_id_foreign`;');

		this.addSql('alter table `production_unit` drop foreign key `production_unit_producer_id_foreign`;');

		this.addSql('alter table `producer_product` drop foreign key `producer_product_producer_id_foreign`;');

		this.addSql('alter table `cart_item` drop foreign key `cart_item_consumer_id_foreign`;');

		this.addSql('alter table `image` drop foreign key `image_consumer_id_foreign`;');
		this.addSql('alter table `image` drop foreign key `image_producer_image_id_foreign`;');
		this.addSql('alter table `image` drop foreign key `image_producer_images_id_foreign`;');

		this.addSql('alter table `order` drop foreign key `order_consumer_id_foreign`;');

		this.addSql('alter table `producer` drop primary key;');
		this.addSql('alter table `producer` change `id` `user_id` int unsigned not null;');
		this.addSql(
			'alter table `producer` add constraint `producer_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;'
		);
		this.addSql('alter table `producer` add primary key `producer_pkey`(`user_id`);');

		this.addSql('alter table `consumer` drop primary key;');
		this.addSql('alter table `consumer` change `id` `user_id` int unsigned not null;');
		this.addSql(
			'alter table `consumer` add constraint `consumer_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete cascade;'
		);
		this.addSql('alter table `consumer` add primary key `consumer_pkey`(`user_id`);');

		this.addSql('alter table `address` drop index `address_consumer_id_index`;');
		this.addSql('alter table `address` change `consumer_id` `consumer_user_id` int unsigned null;');
		this.addSql(
			'alter table `address` add constraint `address_consumer_user_id_foreign` foreign key (`consumer_user_id`) references `consumer` (`user_id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `address` add index `address_consumer_user_id_index`(`consumer_user_id`);');

		this.addSql('alter table `production_unit` drop index `production_unit_producer_id_index`;');
		this.addSql('alter table `production_unit` change `producer_id` `producer_user_id` int unsigned not null;');
		this.addSql(
			'alter table `production_unit` add constraint `production_unit_producer_user_id_foreign` foreign key (`producer_user_id`) references `producer` (`user_id`) on update cascade;'
		);
		this.addSql('alter table `production_unit` add index `production_unit_producer_user_id_index`(`producer_user_id`);');

		this.addSql('alter table `producer_product` drop index `producer_product_producer_id_index`;');
		this.addSql('alter table `producer_product` change `producer_id` `producer_user_id` int unsigned not null;');
		this.addSql(
			'alter table `producer_product` add constraint `producer_product_producer_user_id_foreign` foreign key (`producer_user_id`) references `producer` (`user_id`) on update cascade;'
		);
		this.addSql('alter table `producer_product` add index `producer_product_producer_user_id_index`(`producer_user_id`);');

		this.addSql('alter table `cart_item` drop index `cart_item_consumer_id_index`;');
		this.addSql('alter table `cart_item` drop primary key;');
		this.addSql('alter table `cart_item` change `consumer_id` `consumer_user_id` int unsigned not null;');
		this.addSql(
			'alter table `cart_item` add constraint `cart_item_consumer_user_id_foreign` foreign key (`consumer_user_id`) references `consumer` (`user_id`) on update cascade;'
		);
		this.addSql('alter table `cart_item` add index `cart_item_consumer_user_id_index`(`consumer_user_id`);');
		this.addSql('alter table `cart_item` add primary key `cart_item_pkey`(`producer_product_id`, `consumer_user_id`);');

		this.addSql(
			'alter table `image` add `consumer_user_id` int unsigned null, add `producer_image_user_id` int unsigned null, add `producer_images_user_id` int unsigned null;'
		);
		this.addSql('alter table `image` drop index `image_consumer_id_unique`;');
		this.addSql('alter table `image` drop index `image_producer_image_id_unique`;');
		this.addSql('alter table `image` drop index `image_producer_images_id_index`;');
		this.addSql(
			'alter table `image` add constraint `image_consumer_user_id_foreign` foreign key (`consumer_user_id`) references `consumer` (`user_id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_producer_image_user_id_foreign` foreign key (`producer_image_user_id`) references `producer` (`user_id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_producer_images_user_id_foreign` foreign key (`producer_images_user_id`) references `producer` (`user_id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `image` drop `consumer_id`;');
		this.addSql('alter table `image` drop `producer_image_id`;');
		this.addSql('alter table `image` drop `producer_images_id`;');
		this.addSql('alter table `image` add unique `image_consumer_user_id_unique`(`consumer_user_id`);');
		this.addSql('alter table `image` add unique `image_producer_image_user_id_unique`(`producer_image_user_id`);');
		this.addSql('alter table `image` add index `image_producer_images_user_id_index`(`producer_images_user_id`);');

		this.addSql('alter table `order` drop index `order_consumer_id_index`;');
		this.addSql('alter table `order` change `consumer_id` `consumer_user_id` int unsigned not null;');
		this.addSql(
			'alter table `order` add constraint `order_consumer_user_id_foreign` foreign key (`consumer_user_id`) references `consumer` (`user_id`) on update cascade;'
		);
		this.addSql('alter table `order` add index `order_consumer_user_id_index`(`consumer_user_id`);');
	}
}
