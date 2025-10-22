import type { AuthSession } from './AuthSession';

export interface AuthRepository {
	getSession(): Promise<AuthSession | null>;
	setSession(session: AuthSession): Promise<void>;
	clearSession(): Promise<void>;
	onSessionChange(callback: (session: AuthSession | null) => void): () => void;
}
