import { Migration } from '@mikro-orm/migrations';

export class Migration20230408232742 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `order` add `payment` varchar(255) null;');
		this.addSql('alter table `order` add unique `order_payment_unique`(`payment`);');
	}

	async down(): Promise<void> {
		this.addSql('alter table `order` drop index `order_payment_unique`;');
		this.addSql('alter table `order` drop `payment`;');
	}
}
