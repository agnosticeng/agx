import type { AuthService } from './service';

export class WebAuthHandler {
	constructor(private service: AuthService) {
		this.handle();
	}

	private async handle() {
		const url = new URL(window.location.href);
		if (url.searchParams.has('code') && url.searchParams.has('state')) {
			await this.service.handleRedirectCallback?.();

			url.searchParams.delete('code');
			url.searchParams.delete('state');
			window.history.replaceState({}, document.title, url);
		}
	}
}
