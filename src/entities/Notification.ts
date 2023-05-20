import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';
import { container } from '..';

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
	public templateTitle!: string;

	@Property({ persist: false })
	public get title(): string {
		return `${this.templateTitle.replaceAll('{actor}', this.actor.name)}`;
	}

	@Property({ hidden: true })
	public templateMessage!: string;

	@Property({ persist: false })
	public get message(): string {
		return `${this.templateMessage.replaceAll('{actor}', this.actor.name)}`;
	}

	public static async create(actor: User, notifier: User, title: string, message: string) {
		const notification = new Notification();
		notification.actor = actor;
		notification.notifier = notifier;
		notification.templateTitle = title;
		notification.templateMessage = message;

		if (!notifier.disableEmails) {
			// Send email
			try {
				await container.email.send(notifier, notification.title, notification.message);
			} catch (error) {
				console.log('COULD NOT SEND EMAIL');
				console.error(error);
			}
		}

		return notification;
	}
}
