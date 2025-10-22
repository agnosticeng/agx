<script lang="ts">
	import '$lib/styles/main.css';
	import { onMount } from 'svelte';

	import { MIGRATIONS } from '$lib/migrations';
	import { store } from '$lib/store';
	import { MigrationManager } from '@agnosticeng/migrate';

	import { createAuthRepository, initAuthBridge, login, type AuthRepository } from '$lib/auth';

	import { ContextMenu, ContextMenuState } from '$lib/components/ContextMenu';
	import { setAppContext } from '$lib/context';
	import { detectRuntime, type Runtime } from '$lib/env/runtime';

	import { EXAMPLES_TABS } from '$lib/onboarding';

	let { children } = $props();
	let mounted = $state(false);
	let authenticated = $state(false);

	const contextmenu = new ContextMenuState();
	let runtime = $state<Runtime>()!;
	let authRepo = $state.raw<AuthRepository>();

	setAppContext({
		contextmenu,

		getRuntime() {
			return runtime;
		},

		isAuthenticated() {
			return authenticated;
		},
		async login() {
			if (authRepo) await login(authRepo);
		},
		async logout() {
			await authRepo?.clearSession();
		},
		async getToken() {
			const session = await authRepo?.getSession();
			return session?.accessToken;
		}
	});

	async function displayOnboarding() {
		for (const example of EXAMPLES_TABS) {
			await store.exec(
				`INSERT INTO tabs (id, name, content, tab_index, active) VALUES (?, ?, ?, ?, ?)`,
				example
			);
		}
	}

	onMount(async () => {
		runtime = detectRuntime();

		authRepo = createAuthRepository(runtime);
		authRepo.onSessionChange((session) => (authenticated = !!session));

		initAuthBridge(runtime, authRepo);

		const session = await authRepo.getSession();
		authenticated = !!session;

		const m = new MigrationManager(store);
		await m.migrate(MIGRATIONS);

		const [{ count }] = await store.exec('SELECT COUNT(*) as count FROM tabs');

		if (count === 0) {
			await displayOnboarding();
		}

		mounted = true;
	});
</script>

{#if mounted}
	<ContextMenu state={contextmenu} />

	{@render children()}
{/if}
