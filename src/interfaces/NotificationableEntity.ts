import type { User } from '../entities';

export interface NotificableEntity {
	makeMessage(actor: User): string;
}
