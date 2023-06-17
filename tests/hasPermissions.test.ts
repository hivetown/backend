import type { User } from '../src/entities/User';
import { Permission } from '../src/enums/Permission';
import { UserType } from '../src/enums/UserType';
import { hasPermissions } from '../src/utils/hasPermission';

let user: User; // Variável para armazenar o usuário

beforeAll(() => {
	user = {
		id: 1,
		authId: '123',
		name: 'John Doe',
		email: 'johnD@gmail.com',
		phone: '912345678',
		vat: '123456789',
		type: UserType.Consumer,
		disableEmails: false
	};

	return user;
});

test('no permissions user example', () => {
	const noPermissions = hasPermissions(user, Permission.READ_OTHER_CONSUMER);
	expect(noPermissions).toBe(false);
});

test('read/write other consumer permission example', () => {
	const role = {
		id: 1,
		name: 'AccountManager',
		permissions: Permission.READ_OTHER_CONSUMER
	};

	user.role = role;

	const readOtherConsumer = hasPermissions(user, Permission.READ_OTHER_CONSUMER);
	const writeOtherConsumer = hasPermissions(user, Permission.WRITE_OTHER_CONSUMER);

	const readOtherProducer = hasPermissions(user, Permission.READ_OTHER_PRODUCER);
	const writeOtherProducer = hasPermissions(user, Permission.WRITE_OTHER_PRODUCER);

	expect(readOtherConsumer).toBe(true);
	expect(writeOtherConsumer).toBe(false);

	expect(readOtherProducer).toBe(false);
	expect(writeOtherProducer).toBe(false);
});

test('read/write other user (consumero or producer) permission example', () => {
	const role = {
		id: 2,
		name: 'AccountEditor',
		permissions:
			Permission.READ_OTHER_CONSUMER | Permission.WRITE_OTHER_CONSUMER | Permission.READ_OTHER_PRODUCER | Permission.WRITE_OTHER_PRODUCER
	};

	user.role = role;

	const readOtherConsumer = hasPermissions(user, Permission.READ_OTHER_CONSUMER);
	const writeOtherConsumer = hasPermissions(user, Permission.WRITE_OTHER_CONSUMER);

	const readOtherProducer = hasPermissions(user, Permission.READ_OTHER_PRODUCER);
	const writeOtherProducer = hasPermissions(user, Permission.WRITE_OTHER_PRODUCER);

	const writeCategory = hasPermissions(user, Permission.WRITE_CATEGORY);

	expect(readOtherConsumer).toBe(true);
	expect(writeOtherConsumer).toBe(true);

	expect(readOtherProducer).toBe(true);
	expect(writeOtherProducer).toBe(true);

	expect(writeCategory).toBe(false);
});

test('all permissions user example', () => {
	const role = {
		id: 3,
		name: 'Admin',
		permissions: Permission.ALL
	};

	user.role = role;

	const readOtherConsumer = hasPermissions(user, Permission.READ_OTHER_CONSUMER);
	const writeOtherConsumer = hasPermissions(user, Permission.WRITE_OTHER_CONSUMER);

	const readOtherProducer = hasPermissions(user, Permission.READ_OTHER_PRODUCER);
	const writeOtherProducer = hasPermissions(user, Permission.WRITE_OTHER_PRODUCER);

	const writeCategory = hasPermissions(user, Permission.WRITE_CATEGORY);
	const deleteCategory = hasPermissions(user, Permission.DELETE_CATEGORY);

	const writeProduct = hasPermissions(user, Permission.WRITE_PRODUCT);
	const deleteProduct = hasPermissions(user, Permission.DELETE_PRODUCT);

	const createAdmin = hasPermissions(user, Permission.CREATE_ADMIN);
	const deleteAdmin = hasPermissions(user, Permission.DELETE_ADMIN);

	expect(readOtherConsumer).toBe(true);
	expect(writeOtherConsumer).toBe(true);

	expect(readOtherProducer).toBe(true);
	expect(writeOtherProducer).toBe(true);

	expect(writeCategory).toBe(true);
	expect(deleteCategory).toBe(true);

	expect(writeProduct).toBe(true);
	expect(deleteProduct).toBe(true);

	expect(createAdmin).toBe(true);
	expect(deleteAdmin).toBe(true);
});
