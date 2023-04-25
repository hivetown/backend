export interface LineItem {
	price_data: {
		currency: string;
		product_data: {
			name: string;
			description: string;
			images: string[];
		};
		unit_amount: number; // in cents
	};
	quantity: number;
}
