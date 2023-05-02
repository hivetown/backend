import { Migration } from '@mikro-orm/migrations';

export class Migration20230502170501 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table `role` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `permissions` int not null) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `role` add unique `role_name_unique`(`name`);');

		this.addSql('alter table `user` add `role_id` int unsigned not null;');
		this.addSql('alter table `user` add constraint `user_role_id_foreign` foreign key (`role_id`) references `role` (`id`) on update cascade;');
		this.addSql('alter table `user` add index `user_role_id_index`(`role_id`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `user` drop foreign key `user_role_id_foreign`;');

		this.addSql('drop table if exists `role`;');

		this.addSql('alter table `user` drop index `user_role_id_index`;');
		this.addSql('alter table `user` drop `role_id`;');
	}
}
