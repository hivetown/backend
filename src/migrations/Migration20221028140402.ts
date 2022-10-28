import { Migration } from '@mikro-orm/migrations';

export class Migration20221028140402 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table `producer` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `email` varchar(255) not null, `phone` int not null, `vat` int not null) default character set utf8mb4 engine = InnoDB;'
		);

		this.addSql(
			'create table `product_specification` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `description` varchar(255) not null, `image` varchar(255) not null) default character set utf8mb4 engine = InnoDB;'
		);

		this.addSql(
			'create table `product` (`id` int unsigned not null auto_increment primary key, `specification_id` int unsigned not null, `current_price` int not null, `production_date` datetime not null, `producer_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `product` add index `product_specification_id_index`(`specification_id`);');
		this.addSql('alter table `product` add index `product_producer_id_index`(`producer_id`);');

		this.addSql(
			'alter table `product` add constraint `product_specification_id_foreign` foreign key (`specification_id`) references `product_specification` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `product` add constraint `product_producer_id_foreign` foreign key (`producer_id`) references `producer` (`id`) on update cascade;'
		);
	}
}
