import type { Address } from '../entities';

export const metadataAddress = (address: Address): string => {
	return `${address.number} ${address.street} ${address.city} ${address.zipCode}`;
};
