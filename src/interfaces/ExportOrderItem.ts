import type { ExportAddress } from './ExportAddress';

export interface ExportOrderItem {
	producerProduct: {
		currentPrice: number;
		productionDate: Date;
		producer: {
			name: string;
			email: string;
			phone: string;
		};
		productionUnit: {
			name: string;
			address: ExportAddress;
		};
		productSpec: {
			name: string;
			description: string;
		};
	};
	quantity: number;
	price: number;
	shipment: {
		carrier: {
			licensePlate: string;
		};
		events: {
			date: Date;
			address: ExportAddress;
			status: {
				name: string;
			};
		}[];
	};
}
