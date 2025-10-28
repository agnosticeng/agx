import { Notifier, type AuthService, type AuthSession } from './service';

export class InMemoryAuthService extends Notifier<AuthSession> implements AuthService {
	#session: AuthSession | null = null;

	getSession() {
		return this.#session;
	}

	setSession(session: AuthSession) {
		this.#session = session;
		this.notify(session);
	}

	clearSession(): MaybePromise<void> {
		this.#session = null;
		this.notify(null);
	}

	onStateChange(callback: (session: AuthSession | null) => void): () => void {
		return this.register(callback);
	}
}
