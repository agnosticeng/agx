<script lang="ts">
	import '$lib/styles/main.css';
	import { onMount } from 'svelte';

	import { store } from '$lib/store';
	import { MigrationManager } from '@agnosticeng/migrate';

	import { checkLoginState, getToken, onStateChange } from '$lib/auth';
	import { ContextMenu, ContextMenuState } from '$lib/components/ContextMenu';
	import { setAppContext } from '$lib/context';
	import { MIGRATIONS } from '$lib/migrations';
	import { EXAMPLES_TABS } from '$lib/onboarding';
	import {
		billing,
		handleSubscriptionRedirect,
		onSubscriptionChange,
		refresh as refreshSubscription,
		type Subscription
	} from '$lib/subscriptions';

	let { children } = $props();
	let mounted = $state(false);
	let authenticated = $state(false);
	let subscription = $state<Subscription | null>(null);

	const contextmenu = new ContextMenuState();
	setAppContext({
		contextmenu,
		isAuthenticated: () => authenticated,
		subscription: () => subscription
	});

	async function displayOnboarding() {
		for (const example of EXAMPLES_TABS) {
			await store.exec(
				`INSERT INTO tabs (id, name, content, tab_index, active) VALUES (?, ?, ?, ?, ?)`,
				example
			);
		}
	}

	$effect(() =>
		onStateChange((a) => {
			authenticated = a;
			if (authenticated) refreshSubscription();
		})
	);
	$effect(() =>
		onSubscriptionChange(async () => {
			const token = await getToken();
			if (token) subscription = await billing.getSubscription({ token });
		})
	);

	onMount(async () => {
		const m = new MigrationManager(store);
		await m.migrate(MIGRATIONS);

		const [{ count }] = await store.exec('SELECT COUNT(*) as count FROM tabs');

		if (count === 0) {
			await displayOnboarding();
		}

		await checkLoginState();
		await handleSubscriptionRedirect();

		mounted = true;
	});
</script>

{#if mounted}
	<ContextMenu state={contextmenu} />

	{@render children()}
{/if}
