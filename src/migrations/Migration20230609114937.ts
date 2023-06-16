import { Migration } from '@mikro-orm/migrations';

export class Migration20230609114937 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			"create table `field` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `unit` varchar(255) not null, `type` enum('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'ENUM') not null) default character set utf8mb4 engine = InnoDB;"
		);

		this.addSql(
			'create table `field_possible_value` (`id` int unsigned not null auto_increment primary key, `field_id` int unsigned not null, `value` varchar(255) not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `field_possible_value` add index `field_possible_value_field_id_index`(`field_id`);');

		this.addSql(
			'create table `product_spec` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `description` varchar(255) not null, `deleted_at` datetime null) default character set utf8mb4 engine = InnoDB;'
		);

		this.addSql(
			'create table `role` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `permissions` int not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `role` add unique `role_name_unique`(`name`);');

		this.addSql(
			"create table `user` (`id` int unsigned not null auto_increment primary key, `auth_id` varchar(255) not null, `name` varchar(255) not null, `email` varchar(255) not null, `phone` varchar(255) not null, `vat` varchar(255) not null, `role_id` int unsigned null, `type` enum('CONSUMER', 'PRODUCER') not null, `disable_emails` tinyint(1) not null default false, `image_id` int unsigned null) default character set utf8mb4 engine = InnoDB;"
		);
		this.addSql('alter table `user` add unique `user_auth_id_unique`(`auth_id`);');
		this.addSql('alter table `user` add index `user_role_id_index`(`role_id`);');
		this.addSql('alter table `user` add unique `user_image_id_unique`(`image_id`);');

		this.addSql(
			'create table `producer` (`id` int unsigned not null, `deleted_at` datetime null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;'
		);

		this.addSql(
			'create table `notification` (`id` int unsigned not null auto_increment primary key, `actor_id` int unsigned not null, `notifier_id` int unsigned not null, `created_at` datetime not null, `read_at` datetime null, `template_title` varchar(255) not null, `template_message` varchar(255) not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `notification` add index `notification_actor_id_index`(`actor_id`);');
		this.addSql('alter table `notification` add index `notification_notifier_id_index`(`notifier_id`);');

		this.addSql(
			'create table `consumer` (`id` int unsigned not null, `deleted_at` datetime null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;'
		);

		this.addSql(
			'create table `address` (`id` int unsigned not null auto_increment primary key, `number` int not null, `door` varchar(255) not null, `floor` int not null, `zip_code` varchar(255) not null, `street` varchar(255) not null, `parish` varchar(255) not null, `county` varchar(255) not null, `city` varchar(255) not null, `district` varchar(255) not null, `latitude` double not null, `longitude` double not null, `consumer_id` int unsigned null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `address` add index `address_consumer_id_index`(`consumer_id`);');

		this.addSql(
			'create table `production_unit` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `address_id` int unsigned not null, `producer_id` int unsigned not null, `deleted_at` datetime null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `production_unit` add index `production_unit_address_id_index`(`address_id`);');
		this.addSql('alter table `production_unit` add index `production_unit_producer_id_index`(`producer_id`);');

		this.addSql(
			'create table `producer_product` (`id` int unsigned not null auto_increment primary key, `current_price` double not null, `production_date` datetime not null, `stock` int not null, `producer_id` int unsigned not null, `production_unit_id` int unsigned not null, `product_spec_id` int unsigned not null, `deleted_at` datetime null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `producer_product` add index `producer_product_producer_id_index`(`producer_id`);');
		this.addSql('alter table `producer_product` add index `producer_product_production_unit_id_index`(`production_unit_id`);');
		this.addSql('alter table `producer_product` add index `producer_product_product_spec_id_index`(`product_spec_id`);');

		this.addSql(
			'create table `cart_item` (`producer_product_id` int unsigned not null, `consumer_id` int unsigned not null, `quantity` int not null, primary key (`producer_product_id`, `consumer_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `cart_item` add index `cart_item_producer_product_id_index`(`producer_product_id`);');
		this.addSql('alter table `cart_item` add index `cart_item_consumer_id_index`(`consumer_id`);');

		this.addSql(
			"create table `carrier` (`id` int unsigned not null auto_increment primary key, `license_plate` varchar(255) not null, `production_unit_id` int unsigned not null, `status` enum('AVAILABLE', 'UNAVAILABLE') not null default 'AVAILABLE', `image_id` int unsigned null, `deleted_at` datetime null) default character set utf8mb4 engine = InnoDB;"
		);
		this.addSql('alter table `carrier` add index `carrier_production_unit_id_index`(`production_unit_id`);');
		this.addSql('alter table `carrier` add unique `carrier_image_id_unique`(`image_id`);');

		this.addSql(
			'create table `shipment` (`id` int unsigned not null auto_increment primary key, `carrier_id` int unsigned null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `shipment` add index `shipment_carrier_id_index`(`carrier_id`);');

		this.addSql(
			'create table `shipment_event` (`id` int unsigned not null auto_increment primary key, `date` datetime not null, `shipment_id` int unsigned not null, `address_id` int unsigned not null, `status` tinyint not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `shipment_event` add index `shipment_event_shipment_id_index`(`shipment_id`);');
		this.addSql('alter table `shipment_event` add index `shipment_event_address_id_index`(`address_id`);');

		this.addSql(
			'create table `image` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `url` varchar(255) not null, `alt` varchar(255) not null, `carrier_id` int unsigned null, `category_id` int unsigned null, `consumer_id` int unsigned null, `producer_image_id` int unsigned null, `producer_images_id` int unsigned null, `production_unit_id` int unsigned null, `product_spec_id` int unsigned null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `image` add unique `image_carrier_id_unique`(`carrier_id`);');
		this.addSql('alter table `image` add unique `image_category_id_unique`(`category_id`);');
		this.addSql('alter table `image` add unique `image_consumer_id_unique`(`consumer_id`);');
		this.addSql('alter table `image` add unique `image_producer_image_id_unique`(`producer_image_id`);');
		this.addSql('alter table `image` add index `image_producer_images_id_index`(`producer_images_id`);');
		this.addSql('alter table `image` add index `image_production_unit_id_index`(`production_unit_id`);');
		this.addSql('alter table `image` add index `image_product_spec_id_index`(`product_spec_id`);');

		this.addSql(
			'create table `category` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `parent_id` int unsigned null, `image_id` int unsigned null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `category` add index `category_parent_id_index`(`parent_id`);');
		this.addSql('alter table `category` add unique `category_image_id_unique`(`image_id`);');

		this.addSql(
			'create table `product_spec_category` (`product_spec_id` int unsigned not null, `category_id` int unsigned not null, primary key (`product_spec_id`, `category_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `product_spec_category` add index `product_spec_category_product_spec_id_index`(`product_spec_id`);');
		this.addSql('alter table `product_spec_category` add index `product_spec_category_category_id_index`(`category_id`);');

		this.addSql(
			'create table `product_spec_field` (`product_spec_category_product_spec_id` int unsigned not null, `product_spec_category_category_id` int unsigned not null, `field_id` int unsigned not null, `value` varchar(255) not null, primary key (`product_spec_category_product_spec_id`, `product_spec_category_category_id`, `field_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `product_spec_field` add index `product_spec_field_field_id_index`(`field_id`);');
		this.addSql(
			'alter table `product_spec_field` add index `product_spec_field_product_spec_category_product_sp_46c3a_index`(`product_spec_category_product_spec_id`, `product_spec_category_category_id`);'
		);

		this.addSql(
			'create table `category_fields` (`category_id` int unsigned not null, `field_id` int unsigned not null, primary key (`category_id`, `field_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `category_fields` add index `category_fields_category_id_index`(`category_id`);');
		this.addSql('alter table `category_fields` add index `category_fields_field_id_index`(`field_id`);');

		this.addSql(
			'create table `order` (`id` int unsigned not null auto_increment primary key, `consumer_id` int unsigned not null, `shipping_address_id` int unsigned not null, `payment` varchar(255) null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `order` add index `order_consumer_id_index`(`consumer_id`);');
		this.addSql('alter table `order` add index `order_shipping_address_id_index`(`shipping_address_id`);');
		this.addSql('alter table `order` add unique `order_payment_unique`(`payment`);');

		this.addSql(
			'create table `order_item` (`order_id` int unsigned not null, `producer_product_id` int unsigned not null, `quantity` int not null, `price` double not null, `shipment_id` int unsigned not null, primary key (`order_id`, `producer_product_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `order_item` add index `order_item_order_id_index`(`order_id`);');
		this.addSql('alter table `order_item` add index `order_item_producer_product_id_index`(`producer_product_id`);');
		this.addSql('alter table `order_item` add index `order_item_shipment_id_index`(`shipment_id`);');

		this.addSql(
			'alter table `field_possible_value` add constraint `field_possible_value_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `user` add constraint `user_role_id_foreign` foreign key (`role_id`) references `role` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `user` add constraint `user_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);

		this.addSql(
			'alter table `producer` add constraint `producer_id_foreign` foreign key (`id`) references `user` (`id`) on update cascade on delete cascade;'
		);

		this.addSql(
			'alter table `notification` add constraint `notification_actor_id_foreign` foreign key (`actor_id`) references `user` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `notification` add constraint `notification_notifier_id_foreign` foreign key (`notifier_id`) references `user` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `consumer` add constraint `consumer_id_foreign` foreign key (`id`) references `user` (`id`) on update cascade on delete cascade;'
		);

		this.addSql(
			'alter table `address` add constraint `address_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);

		this.addSql(
			'alter table `production_unit` add constraint `production_unit_address_id_foreign` foreign key (`address_id`) references `address` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `production_unit` add constraint `production_unit_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `producer_product` add constraint `producer_product_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `producer_product` add constraint `producer_product_production_unit_id_foreign` foreign key (`production_unit_id`) references `production_unit` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `producer_product` add constraint `producer_product_product_spec_id_foreign` foreign key (`product_spec_id`) references `product_spec` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `cart_item` add constraint `cart_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `cart_item` add constraint `cart_item_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `carrier` add constraint `carrier_production_unit_id_foreign` foreign key (`production_unit_id`) references `production_unit` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `carrier` add constraint `carrier_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);

		this.addSql(
			'alter table `shipment` add constraint `shipment_carrier_id_foreign` foreign key (`carrier_id`) references `carrier` (`id`) on update cascade on delete set null;'
		);

		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_address_id_foreign` foreign key (`address_id`) references `address` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `image` add constraint `image_carrier_id_foreign` foreign key (`carrier_id`) references `carrier` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `image` add constraint `image_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
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

		this.addSql(
			'alter table `category` add constraint `category_parent_id_foreign` foreign key (`parent_id`) references `category` (`id`) on update cascade on delete set null;'
		);
		this.addSql(
			'alter table `category` add constraint `category_image_id_foreign` foreign key (`image_id`) references `image` (`id`) on update cascade on delete set null;'
		);

		this.addSql(
			'alter table `product_spec_category` add constraint `product_spec_category_product_spec_id_foreign` foreign key (`product_spec_id`) references `product_spec` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `product_spec_category` add constraint `product_spec_category_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `product_spec_field` add constraint `product_spec_field_product_spec_category_product__c0575_foreign` foreign key (`product_spec_category_product_spec_id`, `product_spec_category_category_id`) references `product_spec_category` (`product_spec_id`, `category_id`) on update cascade;'
		);
		this.addSql(
			'alter table `product_spec_field` add constraint `product_spec_field_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `category_fields` add constraint `category_fields_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `category_fields` add constraint `category_fields_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade on delete cascade;'
		);

		this.addSql(
			'alter table `order` add constraint `order_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `order` add constraint `order_shipping_address_id_foreign` foreign key (`shipping_address_id`) references `address` (`id`) on update cascade;'
		);

		this.addSql(
			'alter table `order_item` add constraint `order_item_order_id_foreign` foreign key (`order_id`) references `order` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `order_item` add constraint `order_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `order_item` add constraint `order_item_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade;'
		);
	}
}
