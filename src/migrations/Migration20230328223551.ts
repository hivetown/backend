import { Migration } from '@mikro-orm/migrations';

export class Migration20230328223551 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `producer_product` add `stock` int not null;');
		this.addSql('alter table `producer_product` drop `status`;');
	}

	async down(): Promise<void> {
		this.addSql("alter table `producer_product` add `status` enum('AVAILABLE', 'SOLD_OUT') not null;");
		this.addSql('alter table `producer_product` drop `stock`;');
	}
}
