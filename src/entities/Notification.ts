import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';

@Entity()
export class Notification {
	@PrimaryKey()
	public id!: number;

	@ManyToOne(() => User)
	public actor!: User;

	@ManyToOne(() => User)
	public notifier!: User;

	@Property()
	public createdAt: Date = new Date();

	@Property()
	public readAt?: Date;

	@Property({ hidden: true })
	public templateMessage!: string;

	@Property({ persist: false })
	public get message(): string {
		return `${this.templateMessage.replaceAll('{actor}', this.actor.name)}`;
	}

	public static create(actor: User, notifier: User, templateMessage: string): Notification {
		const notification = new Notification();
		notification.actor = actor;
		notification.notifier = notifier;
		notification.templateMessage = templateMessage;
		return notification;
	}
}
