import {
	sqlite3Worker1Promiser,
	type BindingSpec,
	type ExecBaseOptions,
	type Sqlite3Static
} from '@sqlite.org/sqlite-wasm';
import { Migrator } from './Migrator.svelte';
import { migrations } from './migrations';
import type { SQLiteDB } from './types';

declare module '@sqlite.org/sqlite-wasm' {
	export const sqlite3Worker1Promiser: (params: { onready: () => void }) => Executor;
}

type BaseCommandArgs = { dbId: string };

type OpenCommandArgs = { filename?: string; flags?: string; vfs?: string };

type CommandArgsMapper = {
	open: OpenCommandArgs;
	close: BaseCommandArgs;
	exec: BaseCommandArgs & ExecBaseOptions & { rowMode: 'object'; sql: string };
	'config-get': never;
	export: BaseCommandArgs;
};

type BaseWorkerResponse<R> = {
	type: string;
	dbId: string;
	messageId: string;
	workerReceivedTime: number;
	workerRespondTime: number;
	departureTime: number;

	result: R;
};

type CommandResponseMapper = {
	open: BaseWorkerResponse<{ filename: string; dbId: string; vfs: string; persistent: boolean }>;
	close: BaseWorkerResponse<{ filename?: string }>;
	exec: BaseWorkerResponse<
		CommandArgsMapper['exec'] & { resultRows?: Array<{ [key: string]: any }> }
	>;
	'config-get': BaseWorkerResponse<{
		version: Sqlite3Static['version'];
		vfsList: string[];
		bigIntEnabled?: boolean;
	}>;
	export: BaseWorkerResponse<any>;
};

type Executor = <Cmd extends keyof CommandArgsMapper>(
	cmd: Cmd,
	args: CommandArgsMapper[Cmd]
) => Promise<CommandResponseMapper[Cmd]>;

export class SQLiteDatabase implements SQLiteDB {
	#executor?: Executor;
	#dbId?: string;

	#ready = $state(false);

	constructor() {
		this.#initialize()
			.then(() => (this.#ready = true))
			.catch((err) => {
				console.error('something went wrong at database initialization', err);
			});
		new Migrator(this, migrations);
	}

	get ready() {
		return this.#ready;
	}

	async #initialize() {
		this.#executor = await new Promise((resolve) => {
			const _promiser = sqlite3Worker1Promiser({
				onready: () => resolve(_promiser)
			});
		});

		await this.#open();
	}

	async #open() {
		if (!this.#executor) throw new Error('tried to open before initialized worker');
		try {
			const response = await this.#executor('open', { vfs: 'opfs', filename: 'file:database.db' });
			this.#dbId = response.dbId;
		} catch (err) {}
	}

	async exec(sql: string, bind?: BindingSpec) {
		if (!this.#executor) throw new Error('Must be initalized before exec');
		if (!this.#dbId) throw new Error('No database opened');

		try {
			const response = await this.#executor('exec', {
				dbId: this.#dbId,
				sql,
				rowMode: 'object',
				bind
			});

			return response.result.resultRows;
		} catch (err) {
			console.error(err);

			if (!(err instanceof Error)) {
				const e = new Error((err as any).result.message);
				e.stack = (err as any).result.stack;
				throw e;
			}

			throw err;
		}
	}
}
