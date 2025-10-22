import type { Auth0AuthRepository } from './Auth0AuthRepository';

export class WebAuthBridge {
	constructor(private repo: Auth0AuthRepository) {
		this.handle();
	}

	private async handle() {
		const url = new URL(window.location.href);
		if (url.searchParams.has('code') && url.searchParams.has('state')) {
			await this.repo.handleRedirectCallback();
			url.searchParams.delete('code');
			url.searchParams.delete('state');
			window.history.replaceState({}, document.title, url);
		}
	}
}
