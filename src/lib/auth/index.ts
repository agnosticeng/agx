import { openUrl } from '$lib/env/open';
import type { Runtime } from '$lib/env/runtime';
import { Auth0AuthRepository } from './Auth0AuthRepository';
import type { AuthRepository } from './AuthRepository';
import type { AuthSession } from './AuthSession';
import { DesktopAuthBridge } from './DesktopAuthBridge';
import { EmbeddedAuthBridge } from './EmbeddedAuthBridge';
import { LocalStorageAuthRepository } from './LocalStorageAuthRepository';
import { WebAuthBridge } from './WebAuthBridge';

export function createAuthRepository(runtime: Runtime): AuthRepository {
	if (runtime === 'embedded') {
		return new LocalStorageAuthRepository();
	}

	return new Auth0AuthRepository();
}

export function initAuthBridge(runtime: Runtime, repo: AuthRepository) {
	if (runtime === 'embedded') new EmbeddedAuthBridge(repo);
	if (runtime === 'web' && repo instanceof Auth0AuthRepository) new WebAuthBridge(repo);
	if (runtime === 'desktop' && repo instanceof Auth0AuthRepository) new DesktopAuthBridge(repo);
}

export async function login(repo: AuthRepository) {
	if (repo instanceof Auth0AuthRepository) await repo.login(openUrl);
}

export type { AuthSession, AuthRepository };
