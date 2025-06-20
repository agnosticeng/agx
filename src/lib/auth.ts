import { Auth0Client } from '@auth0/auth0-spa-js';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { openUrl as openUrlWithBrowser } from '@tauri-apps/plugin-opener';
import mitt from 'mitt';

if (!AUTH0_DOMAIN) throw new Error('AUTH0_DOMAIN is not defined');
if (!AUTH0_CLIENT_ID) throw new Error('AUTH0_CLIENT_ID is not defined');

const emitter = mitt<{ 'auth:changed': boolean }>();
const noop = () => {};

let client: Auth0Client;
async function init() {
	client = new Auth0Client({
		domain: AUTH0_DOMAIN,
		clientId: AUTH0_CLIENT_ID,
		authorizationParams: {
			redirect_uri: AUTH0_REDIRECT_URI || window.location.origin
		},
		cacheLocation: 'localstorage',
		useRefreshTokens: true
	});

	await client.checkSession().catch(() => logout(true));

	emitter.emit('auth:changed', await client.isAuthenticated());
}

export async function checkLoginState() {
	await init();

	if (PLATFORM === 'WEB') {
		if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
			await client.handleRedirectCallback();
			window.history.replaceState({}, document.title, '/');
			emitter.emit('auth:changed', true);
		}
	}

	if (PLATFORM === 'NATIVE') {
		await onOpenUrl(async (urls) => {
			const url = urls
				.map((u) => new URL(u))
				.find((u) => u.searchParams.has('code') && u.searchParams.has('state'));

			if (url) {
				await client.handleRedirectCallback(url.toString());
				emitter.emit('auth:changed', true);
			}
		});
	}
}

export function onStateChange(cb: (authenticated: boolean) => unknown) {
	emitter.on('auth:changed', cb);
	return () => emitter.off('auth:changed', cb);
}

export async function isAuthenticated() {
	if (client) return await client.isAuthenticated();
	return false;
}

export async function getToken() {
	if (client) {
		const tokens = await client.getTokenSilently({ detailedResponse: true });
		return tokens.id_token;
	}
}

export async function login() {
	if (client) await client.loginWithRedirect({ openUrl });
}

export async function logout(silently = true) {
	if (client) {
		await client.logout({
			logoutParams: { returnTo: AUTH0_REDIRECT_URI || window.location.origin },
			openUrl: silently ? noop : openUrl
		});
		emitter.emit('auth:changed', false);
	}
}

export async function openUrl(url: string) {
	if (PLATFORM === 'WEB') window.location.assign(url);
	if (PLATFORM === 'NATIVE') await openUrlWithBrowser(url);
}
