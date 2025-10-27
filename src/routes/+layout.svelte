<script lang="ts">
	import '$lib/styles/main.css';
	import { onMount } from 'svelte';

	import { MIGRATIONS } from '$lib/migrations';
	import { store } from '$lib/store';
	import { MigrationManager } from '@agnosticeng/migrate';

	import { createAuthService, checkLoginState, type AuthService } from '$lib/auth';
	import { detectRuntime, type Runtime } from '$lib/env/runtime';

	import { ContextMenu, ContextMenuState } from '$lib/components/ContextMenu';
	import { setAppContext } from '$lib/context';

	import { EXAMPLES_TABS } from '$lib/onboarding';

	let { children } = $props();
	let mounted = $state(false);
	let authenticated = $state(false);

	const contextmenu = new ContextMenuState();
	let authService = $state.raw<AuthService>();

	setAppContext({
		contextmenu,

		isAuthenticated() {
			return authenticated;
		},

		async login() {
			await authService?.login?.();
		},

		async logout() {
			await authService?.clearSession();
		},

		async getToken() {
			const session = await authService?.getSession();
			return session?.idToken;
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
		const runtime = detectRuntime();

		authService = createAuthService(runtime);
		authService.onStateChange((session) => (authenticated = !!session));

		checkLoginState(runtime, authService);
		authenticated = !!(await authService.getSession());

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
