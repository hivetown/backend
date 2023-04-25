import { Migration } from '@mikro-orm/migrations';

export class Migration20230315000243 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `producer_product` modify `current_price` double not null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `producer_product` modify `current_price` numeric(10,0) not null;');
	}
}
