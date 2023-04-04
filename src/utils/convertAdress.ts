import type { Address } from '../entities';
import type { ExportAddress } from '../interfaces/ExportAddress';

export const convertAddress = (address: Address): ExportAddress => ({
	number: address.number,
	door: address.door,
	floor: address.floor,
	zipCode: address.zipCode,
	street: address.street,
	parish: address.parish,
	county: address.county,
	city: address.city,
	district: address.district,
	latitude: address.latitude,
	longitude: address.longitude
});
