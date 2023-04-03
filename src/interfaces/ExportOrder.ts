import type { ExportOrderItem } from './ExportOrderItem';

export interface ExportOrder {
	id: number;
	shippingAddress: {
		number: string;
		street: string;
		zipCode: string;
		city: string;
		country: string;
	};
	generalStatus: string;
	totalPrice: number;
	items: ExportOrderItem[];
}
