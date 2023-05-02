import { Migration } from '@mikro-orm/migrations';

export class Migration20230502181932 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `user` drop foreign key `user_role_id_foreign`;');

		this.addSql('alter table `user` modify `role_id` int unsigned null;');
		this.addSql(
			'alter table `user` add constraint `user_role_id_foreign` foreign key (`role_id`) references `role` (`id`) on update cascade on delete set null;'
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table `user` drop foreign key `user_role_id_foreign`;');

		this.addSql('alter table `user` modify `role_id` int unsigned not null;');
		this.addSql('alter table `user` add constraint `user_role_id_foreign` foreign key (`role_id`) references `role` (`id`) on update cascade;');
	}
}
