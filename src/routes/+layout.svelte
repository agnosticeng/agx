<script lang="ts">
	import '$lib/styles/main.css';
	import { onMount } from 'svelte';

	import { MIGRATIONS } from '$lib/migrations';
	import { store } from '$lib/store';
	import { MigrationManager } from '@agnosticeng/migrate';

	import { checkLoginState, createAuthService, type AuthService } from '$lib/auth';
	import { detectRuntime } from '$lib/env/runtime';

	import { ContextMenu, ContextMenuState } from '$lib/components/ContextMenu';
	import { setAppContext } from '$lib/context';
	import { SQLiteTabRepository } from '$lib/repositories/tabs';

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

	const tabRepository = new SQLiteTabRepository(store);

	async function displayExample() {
		const params = new URLSearchParams(window.location.search);
		const example = params.get('example');
		if (example)
			await tabRepository.insert({ id: crypto.randomUUID(), name: 'Preview', content: example });
	}

	async function displayOpenWith() {
		const params = new URLSearchParams(window.location.search);
		const query = params.get('open-query');

		if (query) {
			await tabRepository.insert({ id: crypto.randomUUID(), name: 'Untitled', content: query });
		}
	}

	onMount(async () => {
		const runtime = detectRuntime();

		authService = createAuthService(runtime);
		authService.onStateChange((session) => (authenticated = !!session));

		checkLoginState(runtime, authService);
		authenticated = !!(await authService.getSession());

		const migration = new MigrationManager(store);
		await migration.migrate(MIGRATIONS);

		if (runtime === 'embedded') await displayOpenWith();
		const count = await tabRepository.count();
		if (count === 0) await displayExample();

		mounted = true;
	});
</script>

{#if mounted}
	<ContextMenu state={contextmenu} />

	{@render children()}
{/if}

<svelte:head>
	<script>
		(function () {
			const urlParams = new URLSearchParams(window.location.search);
			const theme =
				urlParams.get('theme') ||
				localStorage.getItem('theme') ||
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			document.documentElement.setAttribute('data-theme', theme);
		})();
	</script>
</svelte:head>

<style>
	:global([data-theme='light']) {
		filter: invert(1) hue-rotate(180deg);
	}
</style>
