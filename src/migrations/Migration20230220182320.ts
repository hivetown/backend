import { Migration } from '@mikro-orm/migrations';

export class Migration20230220182320 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `address` (`id` int unsigned not null auto_increment primary key, `number` numeric(10,0) not null, `door` numeric(10,0) not null, `floor` numeric(10,0) not null, `zip_code` varchar(255) not null, `street` varchar(255) not null, `parish` varchar(255) not null, `county` varchar(255) not null, `city` varchar(255) not null, `district` varchar(255) not null, `latitude` numeric(10,0) not null, `longitude` numeric(10,0) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `category` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `parent_id` int unsigned null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `category` add index `category_parent_id_index`(`parent_id`);');

    this.addSql('create table `field` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `unit` varchar(255) not null, `type` enum(\'TEXT\', \'NUMBER\', \'DATE\', \'BOOLEAN\', \'ENUM\') not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `category_fields` (`category_id` int unsigned not null, `field_id` int unsigned not null, primary key (`category_id`, `field_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `category_fields` add index `category_fields_category_id_index`(`category_id`);');
    this.addSql('alter table `category_fields` add index `category_fields_field_id_index`(`field_id`);');

    this.addSql('create table `field_possible_value` (`id` int unsigned not null auto_increment primary key, `field_id` int unsigned not null, `value` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `field_possible_value` add index `field_possible_value_field_id_index`(`field_id`);');

    this.addSql('create table `producer` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `email` varchar(255) not null, `phone` numeric(10,0) not null, `vat` numeric(10,0) not null, `type` enum(\'CONSUMER\', \'PRODUCER\') not null default \'PRODUCER\') default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `producer` add unique `producer_vat_unique`(`vat`);');

    this.addSql('create table `production_unit` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `address_id` int unsigned not null, `producer_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `production_unit` add index `production_unit_address_id_index`(`address_id`);');
    this.addSql('alter table `production_unit` add index `production_unit_producer_id_index`(`producer_id`);');

    this.addSql('create table `carrier` (`id` int unsigned not null auto_increment primary key, `license_plate` varchar(255) not null, `production_unit_id` int unsigned not null, `status` enum(\'AVAILABLE\', \'UNAVAILABLE\') not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `carrier` add index `carrier_production_unit_id_index`(`production_unit_id`);');

    this.addSql('create table `product_spec` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `description` varchar(255) not null, `images` text not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `producer_product` (`id` int unsigned not null auto_increment primary key, `current_price` numeric(10,0) not null, `production_date` datetime not null, `producer_id` int unsigned not null, `production_unit_id` int unsigned not null, `product_spec_id` int unsigned not null, `status` enum(\'AVAILABLE\', \'SOLD_OUT\') not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `producer_product` add index `producer_product_producer_id_index`(`producer_id`);');
    this.addSql('alter table `producer_product` add index `producer_product_production_unit_id_index`(`production_unit_id`);');
    this.addSql('alter table `producer_product` add index `producer_product_product_spec_id_index`(`product_spec_id`);');

    this.addSql('create table `cart_item` (`id` int unsigned not null auto_increment primary key, `quantity` numeric(10,0) not null, `product_id` int unsigned not null, `cart_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `cart_item` add index `cart_item_product_id_index`(`product_id`);');
    this.addSql('alter table `cart_item` add index `cart_item_cart_id_index`(`cart_id`);');

    this.addSql('create table `cart` (`id` int unsigned not null auto_increment primary key, `consumer_id` int unsigned not null, `items_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `cart` add unique `cart_consumer_id_unique`(`consumer_id`);');
    this.addSql('alter table `cart` add index `cart_items_id_index`(`items_id`);');

    this.addSql('create table `consumer` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `email` varchar(255) not null, `phone` numeric(10,0) not null, `vat` numeric(10,0) not null, `type` enum(\'CONSUMER\', \'PRODUCER\') not null default \'CONSUMER\', `cart_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `consumer` add unique `consumer_vat_unique`(`vat`);');
    this.addSql('alter table `consumer` add unique `consumer_cart_id_unique`(`cart_id`);');

    this.addSql('create table `order` (`id` int unsigned not null auto_increment primary key, `consumer_id` int unsigned null, `shipping_address_id` int unsigned null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `order` add index `order_consumer_id_index`(`consumer_id`);');
    this.addSql('alter table `order` add index `order_shipping_address_id_index`(`shipping_address_id`);');

    this.addSql('create table `consumer_addresses` (`consumer_id` int unsigned not null, `address_id` int unsigned not null, primary key (`consumer_id`, `address_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `consumer_addresses` add index `consumer_addresses_consumer_id_index`(`consumer_id`);');
    this.addSql('alter table `consumer_addresses` add index `consumer_addresses_address_id_index`(`address_id`);');

    this.addSql('create table `product_spec_category` (`id` int unsigned not null auto_increment primary key, `product_spec_id` int unsigned not null, `category_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `product_spec_category` add index `product_spec_category_product_spec_id_index`(`product_spec_id`);');
    this.addSql('alter table `product_spec_category` add index `product_spec_category_category_id_index`(`category_id`);');

    this.addSql('create table `product_spec_field` (`spec_id` int unsigned not null, `field_id` int unsigned not null, `category_id` int unsigned not null, `value` varchar(255) not null, primary key (`spec_id`, `field_id`, `category_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `product_spec_field` add index `product_spec_field_spec_id_index`(`spec_id`);');
    this.addSql('alter table `product_spec_field` add index `product_spec_field_field_id_index`(`field_id`);');
    this.addSql('alter table `product_spec_field` add index `product_spec_field_category_id_index`(`category_id`);');

    this.addSql('create table `shipment` (`id` int unsigned not null auto_increment primary key, `carrier_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `shipment` add index `shipment_carrier_id_index`(`carrier_id`);');

    this.addSql('create table `order_item` (`id` int unsigned not null auto_increment primary key, `quantity` numeric(10,0) not null, `price` numeric(10,0) not null, `order_id` int unsigned not null, `producer_product_id` int unsigned not null, `shipment_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `order_item` add index `order_item_order_id_index`(`order_id`);');
    this.addSql('alter table `order_item` add index `order_item_producer_product_id_index`(`producer_product_id`);');
    this.addSql('alter table `order_item` add index `order_item_shipment_id_index`(`shipment_id`);');

    this.addSql('create table `shipment_orders` (`shipment_id` int unsigned not null, `order_item_id` int unsigned not null, primary key (`shipment_id`, `order_item_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `shipment_orders` add index `shipment_orders_shipment_id_index`(`shipment_id`);');
    this.addSql('alter table `shipment_orders` add index `shipment_orders_order_item_id_index`(`order_item_id`);');

    this.addSql('create table `shipment_status` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `description` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `shipment_event` (`id` int unsigned not null auto_increment primary key, `date` datetime not null, `shipment_id` int unsigned not null, `address_id` int unsigned not null, `shipment_status_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `shipment_event` add index `shipment_event_shipment_id_index`(`shipment_id`);');
    this.addSql('alter table `shipment_event` add index `shipment_event_address_id_index`(`address_id`);');
    this.addSql('alter table `shipment_event` add index `shipment_event_shipment_status_id_index`(`shipment_status_id`);');

    this.addSql('alter table `category` add constraint `category_parent_id_foreign` foreign key (`parent_id`) references `category` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `category_fields` add constraint `category_fields_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `category_fields` add constraint `category_fields_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `field_possible_value` add constraint `field_possible_value_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade;');

    this.addSql('alter table `production_unit` add constraint `production_unit_address_id_foreign` foreign key (`address_id`) references `address` (`id`) on update cascade;');
    this.addSql('alter table `production_unit` add constraint `production_unit_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;');

    this.addSql('alter table `carrier` add constraint `carrier_production_unit_id_foreign` foreign key (`production_unit_id`) references `production_unit` (`id`) on update cascade;');

    this.addSql('alter table `producer_product` add constraint `producer_product_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;');
    this.addSql('alter table `producer_product` add constraint `producer_product_production_unit_id_foreign` foreign key (`production_unit_id`) references `production_unit` (`id`) on update cascade;');
    this.addSql('alter table `producer_product` add constraint `producer_product_product_spec_id_foreign` foreign key (`product_spec_id`) references `product_spec` (`id`) on update cascade;');

    this.addSql('alter table `cart_item` add constraint `cart_item_product_id_foreign` foreign key (`product_id`) references `producer_product` (`id`) on update cascade;');
    this.addSql('alter table `cart_item` add constraint `cart_item_cart_id_foreign` foreign key (`cart_id`) references `cart` (`id`) on update cascade;');

    this.addSql('alter table `cart` add constraint `cart_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade;');
    this.addSql('alter table `cart` add constraint `cart_items_id_foreign` foreign key (`items_id`) references `cart_item` (`id`) on update cascade;');

    this.addSql('alter table `consumer` add constraint `consumer_cart_id_foreign` foreign key (`cart_id`) references `cart` (`id`) on update cascade;');

    this.addSql('alter table `order` add constraint `order_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `order` add constraint `order_shipping_address_id_foreign` foreign key (`shipping_address_id`) references `address` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `consumer_addresses` add constraint `consumer_addresses_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `consumer_addresses` add constraint `consumer_addresses_address_id_foreign` foreign key (`address_id`) references `address` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `product_spec_category` add constraint `product_spec_category_product_spec_id_foreign` foreign key (`product_spec_id`) references `product_spec` (`id`) on update cascade;');
    this.addSql('alter table `product_spec_category` add constraint `product_spec_category_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade;');

    this.addSql('alter table `product_spec_field` add constraint `product_spec_field_spec_id_foreign` foreign key (`spec_id`) references `product_spec` (`id`) on update cascade;');
    this.addSql('alter table `product_spec_field` add constraint `product_spec_field_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade;');
    this.addSql('alter table `product_spec_field` add constraint `product_spec_field_category_id_foreign` foreign key (`category_id`) references `product_spec_category` (`id`) on update cascade;');

    this.addSql('alter table `shipment` add constraint `shipment_carrier_id_foreign` foreign key (`carrier_id`) references `carrier` (`id`) on update cascade;');

    this.addSql('alter table `order_item` add constraint `order_item_order_id_foreign` foreign key (`order_id`) references `order` (`id`) on update cascade;');
    this.addSql('alter table `order_item` add constraint `order_item_producer_product_id_foreign` foreign key (`producer_product_id`) references `producer_product` (`id`) on update cascade;');
    this.addSql('alter table `order_item` add constraint `order_item_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade;');

    this.addSql('alter table `shipment_orders` add constraint `shipment_orders_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `shipment_orders` add constraint `shipment_orders_order_item_id_foreign` foreign key (`order_item_id`) references `order_item` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `shipment_event` add constraint `shipment_event_shipment_id_foreign` foreign key (`shipment_id`) references `shipment` (`id`) on update cascade;');
    this.addSql('alter table `shipment_event` add constraint `shipment_event_address_id_foreign` foreign key (`address_id`) references `address` (`id`) on update cascade;');
    this.addSql('alter table `shipment_event` add constraint `shipment_event_shipment_status_id_foreign` foreign key (`shipment_status_id`) references `shipment_status` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `production_unit` drop foreign key `production_unit_address_id_foreign`;');

    this.addSql('alter table `order` drop foreign key `order_shipping_address_id_foreign`;');

    this.addSql('alter table `consumer_addresses` drop foreign key `consumer_addresses_address_id_foreign`;');

    this.addSql('alter table `shipment_event` drop foreign key `shipment_event_address_id_foreign`;');

    this.addSql('alter table `category` drop foreign key `category_parent_id_foreign`;');

    this.addSql('alter table `category_fields` drop foreign key `category_fields_category_id_foreign`;');

    this.addSql('alter table `product_spec_category` drop foreign key `product_spec_category_category_id_foreign`;');

    this.addSql('alter table `category_fields` drop foreign key `category_fields_field_id_foreign`;');

    this.addSql('alter table `field_possible_value` drop foreign key `field_possible_value_field_id_foreign`;');

    this.addSql('alter table `product_spec_field` drop foreign key `product_spec_field_field_id_foreign`;');

    this.addSql('alter table `production_unit` drop foreign key `production_unit_producer_id_foreign`;');

    this.addSql('alter table `producer_product` drop foreign key `producer_product_producer_id_foreign`;');

    this.addSql('alter table `carrier` drop foreign key `carrier_production_unit_id_foreign`;');

    this.addSql('alter table `producer_product` drop foreign key `producer_product_production_unit_id_foreign`;');

    this.addSql('alter table `shipment` drop foreign key `shipment_carrier_id_foreign`;');

    this.addSql('alter table `producer_product` drop foreign key `producer_product_product_spec_id_foreign`;');

    this.addSql('alter table `product_spec_category` drop foreign key `product_spec_category_product_spec_id_foreign`;');

    this.addSql('alter table `product_spec_field` drop foreign key `product_spec_field_spec_id_foreign`;');

    this.addSql('alter table `cart_item` drop foreign key `cart_item_product_id_foreign`;');

    this.addSql('alter table `order_item` drop foreign key `order_item_producer_product_id_foreign`;');

    this.addSql('alter table `cart` drop foreign key `cart_items_id_foreign`;');

    this.addSql('alter table `cart_item` drop foreign key `cart_item_cart_id_foreign`;');

    this.addSql('alter table `consumer` drop foreign key `consumer_cart_id_foreign`;');

    this.addSql('alter table `cart` drop foreign key `cart_consumer_id_foreign`;');

    this.addSql('alter table `order` drop foreign key `order_consumer_id_foreign`;');

    this.addSql('alter table `consumer_addresses` drop foreign key `consumer_addresses_consumer_id_foreign`;');

    this.addSql('alter table `order_item` drop foreign key `order_item_order_id_foreign`;');

    this.addSql('alter table `product_spec_field` drop foreign key `product_spec_field_category_id_foreign`;');

    this.addSql('alter table `order_item` drop foreign key `order_item_shipment_id_foreign`;');

    this.addSql('alter table `shipment_orders` drop foreign key `shipment_orders_shipment_id_foreign`;');

    this.addSql('alter table `shipment_event` drop foreign key `shipment_event_shipment_id_foreign`;');

    this.addSql('alter table `shipment_orders` drop foreign key `shipment_orders_order_item_id_foreign`;');

    this.addSql('alter table `shipment_event` drop foreign key `shipment_event_shipment_status_id_foreign`;');

    this.addSql('drop table if exists `address`;');

    this.addSql('drop table if exists `category`;');

    this.addSql('drop table if exists `field`;');

    this.addSql('drop table if exists `category_fields`;');

    this.addSql('drop table if exists `field_possible_value`;');

    this.addSql('drop table if exists `producer`;');

    this.addSql('drop table if exists `production_unit`;');

    this.addSql('drop table if exists `carrier`;');

    this.addSql('drop table if exists `product_spec`;');

    this.addSql('drop table if exists `producer_product`;');

    this.addSql('drop table if exists `cart_item`;');

    this.addSql('drop table if exists `cart`;');

    this.addSql('drop table if exists `consumer`;');

    this.addSql('drop table if exists `order`;');

    this.addSql('drop table if exists `consumer_addresses`;');

    this.addSql('drop table if exists `product_spec_category`;');

    this.addSql('drop table if exists `product_spec_field`;');

    this.addSql('drop table if exists `shipment`;');

    this.addSql('drop table if exists `order_item`;');

    this.addSql('drop table if exists `shipment_orders`;');

    this.addSql('drop table if exists `shipment_status`;');

    this.addSql('drop table if exists `shipment_event`;');
  }

}
