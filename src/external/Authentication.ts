import { auth } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import firebaseServiceAccount from '../firebase-serviceAccount.json';
import type { AuthenticationUser } from '../interfaces/AuthenticationUser';
import type { User } from '../entities';

export class Authentication {
	private constructor() {
		initializeApp({
			credential: cert(firebaseServiceAccount as any)
		});
	}

	public userFromIdToken(idToken: string): Promise<AuthenticationUser | null> {
		return auth().verifyIdToken(idToken);
	}

	// Singleton
	private static instance: Authentication;

	public static getInstance(): Authentication {
		if (!Authentication.instance) {
			Authentication.instance = new Authentication();
		}
		return Authentication.instance;
	}

	public static async updateUserStatus(status: boolean, user: User): Promise<void> {
		await auth().updateUser(user.authId, {
			disabled: status
		});
	}
}
