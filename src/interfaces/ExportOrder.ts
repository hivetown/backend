import type { ExportAddress } from './ExportAddress';
import type { ExportOrderItem } from './ExportOrderItem';

export interface ExportOrder {
	id: number;
	shippingAddress: ExportAddress;
	generalStatus: string;
	totalPrice: number;
	items: ExportOrderItem[];
}
