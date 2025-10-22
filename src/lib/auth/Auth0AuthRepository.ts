import { Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js';
import type { AuthRepository } from './AuthRepository';
import type { AuthSession } from './AuthSession';

if (!AUTH0_DOMAIN) throw new Error('AUTH0_DOMAIN is not defined');
if (!AUTH0_CLIENT_ID) throw new Error('AUTH0_CLIENT_ID is not defined');

export class Auth0AuthRepository implements AuthRepository {
	private callbacks = new Set<(session: AuthSession | null) => void>();
	private client: Auth0Client | null = null;

	private async getClient() {
		if (!this.client)
			this.client = await createAuth0Client({
				domain: AUTH0_DOMAIN,
				clientId: AUTH0_CLIENT_ID,
				authorizationParams: {
					redirect_uri: AUTH0_REDIRECT_URI || window.location.origin
				},
				cacheLocation: 'localstorage',
				useRefreshTokens: true
			});

		return this.client;
	}

	async getSession(): Promise<AuthSession | null> {
		const client = await this.getClient();
		try {
			const { id_token: token, expires_in } = await client.getTokenSilently({
				detailedResponse: true,
				cacheMode: 'off'
			});

			const user = await client.getUser();
			const expiresAt = Date.now() + expires_in * 1000;

			const session: AuthSession = { accessToken: token, user, expiresAt };
			await this.setSession(session);
			return session;
		} catch {
			return null;
		}
	}

	async setSession(session: AuthSession) {
		this.callbacks.forEach((callback) => callback(session));
	}

	async clearSession() {
		const client = await this.getClient();
		await client.logout({
			logoutParams: { returnTo: AUTH0_REDIRECT_URI || window.location.origin },
			openUrl: () => {}
		});

		this.callbacks.forEach((callback) => callback(null));
	}

	onSessionChange(callback: (session: AuthSession | null) => void) {
		this.callbacks.add(callback);

		return () => this.callbacks.delete(callback);
	}

	async login(openUrl?: (url: string) => Promise<void> | void) {
		const client = await this.getClient();
		await client.loginWithRedirect({ openUrl });
	}

	async handleRedirectCallback(url?: string): Promise<void> {
		const client = await this.getClient();
		const _result = await client.handleRedirectCallback(url);
		const user = await client.getUser();
		const tokens = await client.getTokenSilently({ detailedResponse: true, cacheMode: 'off' });
		const expiresAt = Date.now() + tokens.expires_in * 1000;
		const session: AuthSession = { accessToken: tokens.id_token, user, expiresAt };
		await this.setSession(session);
	}
}
