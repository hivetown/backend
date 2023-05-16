import type { Address } from '../entities';

export function calcularDistancia(add1: Address, add2: Address): number {
	const R = 6371; // Raio médio da Terra em quilômetros
	const dLat = toRadians(add2.latitude - add1.latitude);
	const dLon = toRadians(add2.longitude - add1.longitude);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(add1.latitude)) * Math.cos(toRadians(add2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // Distância em quilômetros
	return distance;
}

function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}
