export interface AuthSession {
	accessToken: string;
	expiresAt: number;
	user?: { sub?: string; name?: string; email?: string };
}
