import type { Collection } from '@mikro-orm/core';
import type { OrderItem, ShipmentEvent } from '../entities';
import { ShipmentStatus } from '../enums/ShipmentStatus';
import type { ExportOrderItem } from '../interfaces/ExportOrderItem';

// necessária para não retornar ao cliente ids, e tudo aquilo que não é necessário
export const convertExportOrderItem = (orderItems: Collection<OrderItem>): any[] => {
	const items = orderItems.getItems();
	const res: ExportOrderItem[] = new Array(orderItems.length);
	for (let i = 0; i < items.length; i++) {
		const orderItem = items[i];
		const { producerProduct, quantity, price, shipment } = orderItem;
		res[i] = {
			producerProduct: {
				currentPrice: producerProduct.currentPrice,
				productionDate: producerProduct.productionDate,
				producer: {
					name: producerProduct.producer.name,
					email: producerProduct.producer.email,
					phone: producerProduct.producer.phone
				},
				productionUnit: {
					name: producerProduct.productionUnit.name,
					address: {
						number: producerProduct.productionUnit.address.number,
						door: producerProduct.productionUnit.address.door,
						floor: producerProduct.productionUnit.address.floor,
						zipCode: producerProduct.productionUnit.address.zipCode,
						street: producerProduct.productionUnit.address.street,
						parish: producerProduct.productionUnit.address.parish,
						county: producerProduct.productionUnit.address.county,
						city: producerProduct.productionUnit.address.city,
						district: producerProduct.productionUnit.address.district,
						latitude: producerProduct.productionUnit.address.latitude,
						longitude: producerProduct.productionUnit.address.longitude
					}
				},
				productSpec: {
					name: producerProduct.productSpec.name,
					description: producerProduct.productSpec.description
				}
			},
			quantity,
			price,
			shipment: {
				carrier: {
					licensePlate: shipment.carrier?.licensePlate
				},
				events: shipment.events.getItems().map((event: ShipmentEvent) => ({
					date: event.date,
					address: {
						number: event.address.number,
						door: event.address.door,
						floor: event.address.floor,
						zipCode: event.address.zipCode,
						street: event.address.street,
						parish: event.address.parish,
						county: event.address.county,
						city: event.address.city,
						district: event.address.district,
						latitude: event.address.latitude,
						longitude: event.address.longitude
					},
					status: {
						name: ShipmentStatus[event.status]
					}
				}))
			}
		};
		i++;
	}
	return res;
};
