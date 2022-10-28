import { Migration } from '@mikro-orm/migrations';

export class Migration20221028142300 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `product` modify `production_date` date not null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `product` modify `production_date` varchar(255) not null;');
	}
}
