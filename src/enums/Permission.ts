/**
 * Permissions bits for user roles
 */
export enum Permission {
	NONE = 0b0,
	// Admin
	ALL_ADMIN = 0b11, // helper for all admin permissions
	CREATE_ADMIN = 0b1,
	DELETE_ADMIN = 0b10,
	// Categories
	ALL_CATEGORY = 0b1100, // helper for all category permissions
	WRITE_CATEGORY = 0b100,
	DELETE_CATEGORY = 0b1000,
	// Consumers
	ALL_CONSUMER = 0b1110000, // helper for all consumer permissions
	READ_OTHER_CONSUMER = 0b10000,
	WRITE_OTHER_CONSUMER = 0b100000,
	DELETE_OTHER_CONSUMER = 0b1000000,
	// Producers
	ALL_PRODUCER = 0b1110000000, // helper for all producer permissions
	READ_OTHER_PRODUCER = 0b10000000,
	WRITE_OTHER_PRODUCER = 0b100000000,
	DELETE_OTHER_PRODUCER = 0b1000000000,
	// Products
	ALL_PRODUCT = 0b110000000000, // helper for all product permissions
	WRITE_PRODUCT = 0b10000000000,
	DELETE_PRODUCT = 0b100000000000,

	// ALL
	ALL = ALL_ADMIN | ALL_CATEGORY | ALL_CONSUMER | ALL_PRODUCER | ALL_PRODUCT
}
