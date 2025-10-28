import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import type { AuthService } from './service';

export class DesktopAuthHandler {
	constructor(private service: AuthService) {
		onOpenUrl(this.handleOpenUrls.bind(this));
	}

	private async handleOpenUrls(urls: string[]) {
		const url = urls
			.map((u) => new URL(u))
			.find((u) => u.searchParams.has('code') && u.searchParams.has('state'));

		if (url) await this.service.handleRedirectCallback?.(url.toString());
	}
}
