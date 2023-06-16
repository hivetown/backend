export interface NotificationFilter {
	notifierId: number;
	unreadOnly?: boolean;
	after?: Date;
	before?: Date;
}
