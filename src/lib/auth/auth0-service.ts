import { openUrl } from '$lib/env/open';
import { Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js';
import { Notifier, type AuthService, type AuthSession } from './service';

export class Auth0AuthService extends Notifier<AuthSession> implements AuthService {
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

	async getSession() {
		const client = await this.getClient();
		try {
			const { id_token: token, expires_in } = await client.getTokenSilently({
				detailedResponse: true,
				cacheMode: 'off'
			});

			const user = await client.getUser();
			const expiresAt = Date.now() + expires_in * 1000;

			const session: AuthSession = { idToken: token, user, expiresAt };
			await this.setSession(session);
			return session;
		} catch {
			return null;
		}
	}

	async setSession(session: AuthSession) {
		this.notify(session);
	}

	async clearSession() {
		const client = await this.getClient();
		await client.logout({
			logoutParams: { returnTo: AUTH0_REDIRECT_URI || window.location.origin },
			openUrl: () => {}
		});

		this.notify(null);
	}

	onStateChange(callback: (session: AuthSession | null) => void) {
		return this.register(callback);
	}

	async login() {
		const client = await this.getClient();
		await client.loginWithRedirect({ openUrl });
	}

	async handleRedirectCallback(url?: string) {
		const client = await this.getClient();
		const _result = await client.handleRedirectCallback(url);
		const user = await client.getUser();
		const tokens = await client.getTokenSilently({ detailedResponse: true, cacheMode: 'off' });
		const expiresAt = Date.now() + tokens.expires_in * 1000;
		const session: AuthSession = { idToken: tokens.id_token, user, expiresAt };
		await this.setSession(session);
	}
}
