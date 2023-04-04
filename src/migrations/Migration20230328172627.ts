import { Migration } from '@mikro-orm/migrations';

export class Migration20230328172627 extends Migration {
	async up(): Promise<void> {
		this.addSql('drop table if exists `consumer_addresses`;');

		this.addSql('alter table `address` add `consumer_id` int unsigned null;');
		this.addSql('alter table `address` modify `door` varchar(255) not null;');
		this.addSql(
			'alter table `address` add constraint `address_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `address` add index `address_consumer_id_index`(`consumer_id`);');
	}

	async down(): Promise<void> {
		this.addSql(
			'create table `consumer_addresses` (`consumer_id` int unsigned not null, `address_id` int unsigned not null, primary key (`consumer_id`, `address_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `consumer_addresses` add index `consumer_addresses_consumer_id_index`(`consumer_id`);');
		this.addSql('alter table `consumer_addresses` add index `consumer_addresses_address_id_index`(`address_id`);');

		this.addSql(
			'alter table `consumer_addresses` add constraint `consumer_addresses_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `consumer_addresses` add constraint `consumer_addresses_address_id_foreign` foreign key (`address_id`) references `address` (`id`) on update cascade on delete cascade;'
		);

		this.addSql('alter table `address` drop foreign key `address_consumer_id_foreign`;');

		this.addSql('alter table `address` modify `door` int not null;');
		this.addSql('alter table `address` drop index `address_consumer_id_index`;');
		this.addSql('alter table `address` drop `consumer_id`;');
	}
}
