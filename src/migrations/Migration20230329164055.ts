import { Migration } from '@mikro-orm/migrations';

export class Migration20230329164055 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `shipment_event` drop foreign key `shipment_event_status_id_foreign`;');

		this.addSql('drop table if exists `shipment_status`;');

		this.addSql('alter table `shipment_event` add `status` tinyint not null;');
		this.addSql('alter table `shipment_event` drop index `shipment_event_status_id_index`;');
		this.addSql('alter table `shipment_event` drop `status_id`;');
	}

	async down(): Promise<void> {
		this.addSql(
			'create table `shipment_status` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `description` varchar(255) not null) default character set utf8mb4 engine = InnoDB;'
		);

		this.addSql('alter table `shipment_event` add `status_id` int unsigned not null;');
		this.addSql(
			'alter table `shipment_event` add constraint `shipment_event_status_id_foreign` foreign key (`status_id`) references `shipment_status` (`id`) on update cascade;'
		);
		this.addSql('alter table `shipment_event` drop `status`;');
		this.addSql('alter table `shipment_event` add index `shipment_event_status_id_index`(`status_id`);');
	}
}
