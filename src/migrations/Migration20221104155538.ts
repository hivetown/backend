import { Migration } from '@mikro-orm/migrations';

export class Migration20221104155538 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table `producer` modify `id` int unsigned not null auto_increment, modify `phone` numeric(10,0) not null, modify `vat` numeric(10,0) not null;'
		);

		this.addSql(
			'alter table `product` modify `id` int unsigned not null auto_increment, modify `current_price` numeric(10,0) not null, modify `production_date` datetime not null, modify `producer_id` numeric(10,0) not null;'
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table `producer` modify `id` int unsigned not null auto_increment, modify `phone` varchar(255) not null, modify `vat` varchar(255) not null;'
		);

		this.addSql(
			'alter table `product` modify `id` int unsigned not null auto_increment, modify `current_price` varchar(255) not null, modify `production_date` date not null, modify `producer_id` varchar(255) not null;'
		);
	}
}
