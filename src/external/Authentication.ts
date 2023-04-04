import { auth } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import firebaseServiceAccount from '../firebase-serviceAccount.json';
import type { AuthenticationUser } from '../interfaces/AuthenticationUser';

export class Authentication {
	private constructor() {
		initializeApp({
			credential: cert(firebaseServiceAccount as any)
		});
	}

	public async userFromIdToken(idToken: string): Promise<AuthenticationUser | null> {
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
}
