import { Migration } from '@mikro-orm/migrations';

export class Migration20230520164115 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table `notification` (`id` int unsigned not null auto_increment primary key, `actor_id` int unsigned not null, `notifier_id` int unsigned not null, `created_at` datetime not null, `read_at` datetime null, `template_message` varchar(255) not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `notification` add index `notification_actor_id_index`(`actor_id`);');
		this.addSql('alter table `notification` add index `notification_notifier_id_index`(`notifier_id`);');

		this.addSql(
			'alter table `notification` add constraint `notification_actor_id_foreign` foreign key (`actor_id`) references `user` (`id`) on update cascade;'
		);
		this.addSql(
			'alter table `notification` add constraint `notification_notifier_id_foreign` foreign key (`notifier_id`) references `user` (`id`) on update cascade;'
		);
	}

	async down(): Promise<void> {
		this.addSql('drop table if exists `notification`;');
	}
}
