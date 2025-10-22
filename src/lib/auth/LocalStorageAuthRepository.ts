import type { AuthRepository } from './AuthRepository';
import type { AuthSession } from './AuthSession';

export class LocalStorageAuthRepository implements AuthRepository {
	private callbacks = new Set<(session: AuthSession | null) => void>();
	private readonly KEY = 'auth_session';

	async getSession(): Promise<AuthSession | null> {
		const raw = localStorage.getItem(this.KEY);
		return raw ? JSON.parse(raw) : null;
	}

	async setSession(session: AuthSession): Promise<void> {
		localStorage.setItem(this.KEY, JSON.stringify(session));

		this.callbacks.forEach((callback) => callback(session));
	}

	async clearSession(): Promise<void> {
		localStorage.removeItem(this.KEY);

		this.callbacks.forEach((callback) => callback(null));
	}

	onSessionChange(callback: (session: AuthSession | null) => void) {
		this.callbacks.add(callback);

		return () => this.callbacks.delete(callback);
	}
}
