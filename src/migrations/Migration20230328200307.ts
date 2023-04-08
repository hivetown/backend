import { Migration } from '@mikro-orm/migrations';

export class Migration20230328200307 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create table `field_categories` (`field_id` int unsigned not null, `category_id` int unsigned not null, primary key (`field_id`, `category_id`)) default character set utf8mb4 engine = InnoDB;'
		);
		this.addSql('alter table `field_categories` add index `field_categories_field_id_index`(`field_id`);');
		this.addSql('alter table `field_categories` add index `field_categories_category_id_index`(`category_id`);');

		this.addSql(
			'alter table `field_categories` add constraint `field_categories_field_id_foreign` foreign key (`field_id`) references `field` (`id`) on update cascade on delete cascade;'
		);
		this.addSql(
			'alter table `field_categories` add constraint `field_categories_category_id_foreign` foreign key (`category_id`) references `category` (`id`) on update cascade on delete cascade;'
		);
	}

	async down(): Promise<void> {
		this.addSql('drop table if exists `field_categories`;');
	}
}
