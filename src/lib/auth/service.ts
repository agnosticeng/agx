export interface AuthSession {
	idToken: string;
	expiresAt: number;
	user?: { sub?: string; name?: string; email?: string };
}

export interface AuthService {
	getSession(): MaybePromise<AuthSession | null>;
	setSession(session: AuthSession): MaybePromise<void>;
	clearSession(): MaybePromise<void>;
	onStateChange(callback: (session: AuthSession | null) => void): () => void;
	login?(): MaybePromise<void>;
	handleRedirectCallback?(url?: string): MaybePromise<void>;
}

export abstract class Notifier<T> {
	private callbacks = new Set<(value: T | null) => void>();

	protected register(callback: (value: T | null) => void) {
		this.callbacks.add(callback);
		return () => this.callbacks.delete(callback);
	}

	protected notify(value: T | null) {
		this.callbacks.forEach((callback) => callback(value));
	}
}
