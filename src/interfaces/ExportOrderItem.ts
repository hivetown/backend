export interface ExportOrderItem {
	producerProduct: {
		currentPrice: number;
		productionDate: Date;
		producer: {
			name: string;
			email: string;
			phone: number;
		};
		productionUnit: {
			name: string;
			address: {
				number: number;
				door: number;
				floor: number;
				zipCode: string;
				street: string;
				parish: string;
				county: string;
				city: string;
				district: string;
				latitude: number;
				longitude: number;
			};
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
			address: {
				number: number;
				door: number;
				floor: number;
				zipCode: string;
				street: string;
				parish: string;
				county: string;
				city: string;
				district: string;
				latitude: number;
				longitude: number;
			};
			status: {
				name: string;
			};
		}[];
	};
}
