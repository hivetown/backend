export interface AuthenticationUser {
	/**
	 * User email
	 */
	email?: string;
	email_verified?: boolean;
	/**
	 * Expiration (Unix epoch)
	 */
	exp: number;
	/**
	 * Issued at (Unix epoch)
	 */
	iat: number;
	/**
	 * User phone number
	 */
	phone_number?: string;
	/**
	 * User picture URL
	 */
	picture?: string;
	/**
	 * User id
	 */
	uid: string;
}
