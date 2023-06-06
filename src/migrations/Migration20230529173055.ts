import { Migration } from '@mikro-orm/migrations';

export class Migration20230529173055 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table `shipment` drop foreign key `shipment_carrier_id_foreign`;');

		this.addSql(
			'alter table `shipment` add constraint `shipment_carrier_id_foreign` foreign key (`carrier_id`) references `carrier` (`id`) on update cascade on delete set null;'
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table `shipment` drop foreign key `shipment_carrier_id_foreign`;');

		this.addSql(
			'alter table `shipment` add constraint `shipment_carrier_id_foreign` foreign key (`carrier_id`) references `carrier` (`id`) on delete set null;'
		);
	}
}
