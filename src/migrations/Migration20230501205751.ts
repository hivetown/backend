import { Migration } from '@mikro-orm/migrations';

export class Migration20230501205751 extends Migration {
	async up(): Promise<void> {
		this.addSql("alter table `user` add `type` enum('CONSUMER', 'PRODUCER') not null;");
	}

	async down(): Promise<void> {
		this.addSql('alter table `user` drop `type`;');
	}
}
