import { type Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { openUrl } from '@tauri-apps/plugin-opener';

if (!AUTH0_DOMAIN) throw new Error('AUTH0_DOMAIN is not defined');
if (!AUTH0_CLIENT_ID) throw new Error('AUTH0_CLIENT_ID is not defined');

let client: Auth0Client;
async function init() {
	client = await createAuth0Client({
		domain: AUTH0_DOMAIN,
		clientId: AUTH0_CLIENT_ID,
		authorizationParams: {
			redirect_uri: AUTH0_REDIRECT_URI || window.location.origin
		},
		cacheLocation: 'localstorage',
		useRefreshTokens: true
	});
}

export async function checkLoginState(onStateChange?: () => void) {
	await init();

	if (PLATFORM === 'WEB') {
		if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
			await client.handleRedirectCallback();
			window.history.replaceState({}, document.title, '/');
			onStateChange?.();
		}
	}

	if (PLATFORM === 'NATIVE') {
		await onOpenUrl(async (urls) => {
			const url = urls
				.map((u) => new URL(u))
				.find((u) => u.searchParams.has('code') && u.searchParams.has('state'));

			if (url) {
				await client.handleRedirectCallback(url.toString());
				onStateChange?.();
			}
		});
	}
}

export async function isAuthenticated() {
	if (client) {
		return await client.isAuthenticated();
	}
	return false;
}

export async function getToken() {
	if (client) return await client.getTokenSilently();
}

export async function login() {
	if (client) {
		await client.loginWithRedirect({
			async openUrl(url) {
				if (PLATFORM === 'WEB') {
					window.location.assign(url);
				}

				if (PLATFORM === 'NATIVE') {
					await openUrl(url);
				}
			}
		});
	}
}

export async function logout() {
	if (client) {
		await client.logout({
			logoutParams: { returnTo: AUTH0_REDIRECT_URI || window.location.origin }
		});
	}
}
