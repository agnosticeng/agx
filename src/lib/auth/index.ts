import { detectRuntime, type Runtime } from '$lib/env/runtime';
import { Auth0AuthService } from './auth0-service';
import { DesktopAuthHandler } from './desktop-handler';
import { EmbeddedAuthHandler } from './embedded-handler';
import { InMemoryAuthService } from './inmemory-service';
import type { AuthService, AuthSession } from './service';
import { WebAuthHandler } from './web-handler';

export function createAuthService(runtime: Runtime): AuthService {
	if (runtime === 'embedded') {
		return new InMemoryAuthService();
	}

	return new Auth0AuthService();
}

export function checkLoginState(runtime: Runtime, service: AuthService) {
	if (runtime === 'embedded') new EmbeddedAuthHandler(service);
	if (runtime === 'web') new WebAuthHandler(service);
	if (runtime === 'desktop') new DesktopAuthHandler(service);
}

export function isAuthEnabled() {
	const runtime = detectRuntime();
	return runtime === 'embedded' || Boolean(AUTH0_CLIENT_ID && AUTH0_DOMAIN);
}

export type { AuthService, AuthSession };
