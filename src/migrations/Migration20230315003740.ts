import { Migration } from '@mikro-orm/migrations';

export class Migration20230315003740 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `address` modify `latitude` double not null, modify `longitude` double not null;');

		this.addSql('alter table `producer` modify `phone` double not null, modify `vat` double not null;');

		this.addSql('alter table `producer_product` modify `current_price` double not null;');

		this.addSql('alter table `consumer` modify `phone` double not null, modify `vat` double not null;');

		this.addSql('alter table `order_item` modify `price` double not null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `address` modify `latitude` decimal(10,0) not null, modify `longitude` decimal(10,0) not null;');

		this.addSql('alter table `producer_product` modify `current_price` decimal(10,0) not null;');

		this.addSql('alter table `order_item` modify `price` decimal(10,0) not null;');

		this.addSql('alter table `producer` modify `phone` decimal(10,0) not null, modify `vat` decimal(10,0) not null;');

		this.addSql('alter table `consumer` modify `phone` decimal(10,0) not null, modify `vat` decimal(10,0) not null;');
	}
}
