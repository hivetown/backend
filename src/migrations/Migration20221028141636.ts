import { Migration } from '@mikro-orm/migrations';

export class Migration20221028141636 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table `producer` modify `id` int unsigned not null auto_increment, modify `phone` varchar(255) not null, modify `vat` varchar(255) not null;'
		);

		this.addSql('alter table `product_specification` modify `id` int unsigned not null auto_increment;');

		this.addSql(
			'alter table `product` modify `id` int unsigned not null auto_increment, modify `specification_id` varchar(255) not null, modify `current_price` varchar(255) not null, modify `production_date` varchar(255) not null, modify `producer_id` varchar(255) not null;'
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table `producer` modify `id` int unsigned not null auto_increment, modify `phone` int not null, modify `vat` int not null;'
		);

		this.addSql('alter table `product_specification` modify `id` int unsigned not null auto_increment;');

		this.addSql(
			'alter table `product` modify `id` int unsigned not null auto_increment, modify `specification_id` int unsigned not null, modify `current_price` int not null, modify `production_date` datetime not null, modify `producer_id` int unsigned not null;'
		);
	}
}
