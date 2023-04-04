import { Migration } from '@mikro-orm/migrations';

export class Migration20230327144936 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `producer` add `auth_id` varchar(255) not null;');
		this.addSql('alter table `producer` add unique `producer_auth_id_unique`(`auth_id`);');

		this.addSql('alter table `consumer` add `auth_id` varchar(255) not null;');
		this.addSql('alter table `consumer` add unique `consumer_auth_id_unique`(`auth_id`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `producer` drop index `producer_auth_id_unique`;');
		this.addSql('alter table `producer` drop `auth_id`;');

		this.addSql('alter table `consumer` drop index `consumer_auth_id_unique`;');
		this.addSql('alter table `consumer` drop `auth_id`;');
	}
}
