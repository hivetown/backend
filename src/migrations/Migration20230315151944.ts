import { Migration } from '@mikro-orm/migrations';

export class Migration20230315151944 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `image` drop foreign key `image_consumer_image_id_foreign`;');

		this.addSql('alter table `image` drop index `image_consumer_image_id_unique`;');
		this.addSql('alter table `image` change `consumer_image_id` `consumer_id` int unsigned null;');
		this.addSql(
			'alter table `image` add constraint `image_consumer_id_foreign` foreign key (`consumer_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `image` add unique `image_consumer_id_unique`(`consumer_id`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `image` drop foreign key `image_consumer_id_foreign`;');

		this.addSql('alter table `image` drop index `image_consumer_id_unique`;');
		this.addSql('alter table `image` change `consumer_id` `consumer_image_id` int unsigned null;');
		this.addSql(
			'alter table `image` add constraint `image_consumer_image_id_foreign` foreign key (`consumer_image_id`) references `consumer` (`id`) on update cascade on delete set null;'
		);
		this.addSql('alter table `image` add unique `image_consumer_image_id_unique`(`consumer_image_id`);');
	}
}
