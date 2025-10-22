import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import type { Auth0AuthRepository } from './Auth0AuthRepository';

export class DesktopAuthBridge {
	constructor(private repo: Auth0AuthRepository) {
		onOpenUrl(this.handleOpenUrls.bind(this));
	}

	private async handleOpenUrls(urls: string[]) {
		const url = urls
			.map((u) => new URL(u))
			.find((u) => u.searchParams.has('code') && u.searchParams.has('state'));

		if (url) await this.repo.handleRedirectCallback(url.toString());
	}
}
