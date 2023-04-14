import { Migration } from '@mikro-orm/migrations';

export class Migration20230414223017 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `producer` modify `phone` varchar(255) not null, modify `vat` varchar(255) not null;');

		this.addSql('alter table `consumer` modify `phone` varchar(255) not null, modify `vat` varchar(255) not null;');
	}

	async down(): Promise<void> {
		this.addSql('alter table `consumer` modify `phone` double not null, modify `vat` double not null;');

		this.addSql('alter table `producer` modify `phone` double not null, modify `vat` double not null;');
	}
}
