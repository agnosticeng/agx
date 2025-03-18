import type { Database } from '$lib/database';
import GAS_PRICE from './gas_price.sql?raw';
import TOKEN_PRICE from './token_price.sql?raw';

const KEY = 'onboarding';

export class Onboarding {
	#required = false;

	constructor(private db: Database) {
		if (typeof window === 'undefined') return;
		this.#required =
			!localStorage.getItem(KEY) &&
			(location.host === 'agx.app' || location.host.endsWith('.agx-80h.pages.dev'));
	}

	get required() {
		return this.#required;
	}

	async apply() {
		const counts = await this.getTabsCount();
		if (counts > 0) return;

		const values = new Array(2).fill(`(?,?,?,?,?)`).join(',\n');
		const tabs = [
			{ id: crypto.randomUUID(), name: 'Gas Price (Example)', content: GAS_PRICE },
			{ id: crypto.randomUUID(), name: 'Token Price (Example)', content: TOKEN_PRICE }
		]
			.map((t, index, a) => [t.id, t.name, t.content, index, index === a.length - 1 || null])
			.flat();

		await this.db.exec(
			`INSERT INTO tabs (id, name, content, tab_index, active) VALUES ${values}`,
			tabs
		);

		localStorage.setItem(KEY, Date.now().toString());
	}

	private async getTabsCount() {
		const rows = await this.db.exec('select count(*) as "count" from tabs');
		return Number(rows.at(0)?.count ?? 0);
	}
}
