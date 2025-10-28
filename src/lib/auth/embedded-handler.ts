import type { AuthService, AuthSession } from './service';

export class EmbeddedAuthHandler {
	constructor(private service: AuthService) {
		this.handleURL();
	}

	private async handleURL() {
		const url = new URL(window.location.href);
		const token = url.searchParams.get('token');
		if (token) {
			const decoded = JSON.parse(atob(token.split('.')[1]));
			const expiresAt = +(decoded.exp ?? Date.now() + 3600 * 1000);
			const session: AuthSession = { idToken: token, expiresAt };
			await this.service.setSession(session);
		}
	}
}
