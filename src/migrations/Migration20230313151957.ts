import { Migration } from '@mikro-orm/migrations';

export class Migration20230313151957 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table `image` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `url` varchar(255) not null, `alt` varchar(255) not null, `carrier_id` int unsigned null, `category_id` int unsigned null, `consumer_image_id` int unsigned null, `producer_image_id` int unsigned null, `producer_images_id` int unsigned null, `production_unit_id` int unsigned null, `product_spec_id` int unsigned null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `image` add unique `image_carrier_id_unique`(`carrier_id`);');
		this.addSql('alter table `image` add unique `image_category_id_unique`(`category_id`);');
		this.addSql('alter table `image` add unique `image_consumer_image_id_unique`(`consumer_image_id`);');
		this.addSql('alter table `image` add unique `image_producer_image_id_unique`(`producer_image_id`);');
		this.addSql('alter table `image` add index `image_producer_images_id_index`(`producer_images_id`);');
		this.addSql('alter table `image` add index `image_production_unit_id_index`(`production_unit_id`);');
		this.addSql('alter table `image` add index `image_product_spec_id_index`(`product_spec_id`);');

		this.addSql(
			'alter table `image` add constraint `image_carrier_id_foreign` foreign key (`carrier_id`) references `carrier` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_consumer_image_id_foreign` foreign key (`consumer_image_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_producer_image_id_foreign` foreign key (`producer_image_id`) references `producer` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_producer_images_id_foreign` foreign key (`producer_images_id`) references `producer` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_production_unit_id_foreign` foreign key (`production_unit_id`) references `production_unit` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_product_spec_id_foreign` foreign key (`product_spec_id`) references `product_spec` (`id`) on update cascade on delete set null;'
		);

		this.addSql('alter table `product_spec` drop `images`;');

		this.addSql('alter table `producer` add `image_id` int unsigned null;');
		this.addSql(
			'alter table `producer` add constraint `producer_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `producer` add unique `producer_image_id_unique`(`image_id`);');

		this.addSql('alter table `consumer` add `image_id` int unsigned null;');
		this.addSql(
			'alter table `consumer` add constraint `consumer_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `consumer` add unique `consumer_image_id_unique`(`image_id`);');

		this.addSql('alter table `category` add `image_id` int unsigned null;');
		this.addSql(
			'alter table `category` add constraint `category_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `category` add unique `category_image_id_unique`(`image_id`);');

		this.addSql('alter table `carrier` add `image_id` int unsigned null;');
		this.addSql(
			'alter table `carrier` add constraint `carrier_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `carrier` add unique `carrier_image_id_unique`(`image_id`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `producer` drop foreign key `producer_image_id_foreign`;');

		this.addSql('alter table `consumer` drop foreign key `consumer_image_id_foreign`;');

		this.addSql('alter table `category` drop foreign key `category_image_id_foreign`;');

		this.addSql('alter table `carrier` drop foreign key `carrier_image_id_foreign`;');

		this.addSql('drop table if exists `image`;');

		this.addSql('alter table `category` drop index `category_image_id_unique`;');
		this.addSql('alter table `category` drop `image_id`;');

		this.addSql('alter table `consumer` drop index `consumer_image_id_unique`;');
		this.addSql('alter table `consumer` drop `image_id`;');

		this.addSql('alter table `producer` drop index `producer_image_id_unique`;');
		this.addSql('alter table `producer` drop `image_id`;');

		this.addSql('alter table `carrier` drop index `carrier_image_id_unique`;');
		this.addSql('alter table `carrier` drop `image_id`;');

		this.addSql('alter table `product_spec` add `images` text not null;');
	}
}
