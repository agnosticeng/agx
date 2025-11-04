import { decodeJwt } from 'jose/jwt/decode';
import type { AuthService } from './service';

export class EmbeddedAuthHandler {
	constructor(private service: AuthService) {
		this.handleURL();
	}

	private async handleURL() {
		const url = new URL(window.location.href);
		const token = url.searchParams.get('token');
		if (token) {
			const claims = decodeJwt(token);
			if (claims.exp) await this.service.setSession({ idToken: token, expiresAt: claims.exp });
		}
	}
}
