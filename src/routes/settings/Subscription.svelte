<script lang="ts">
	import { getToken } from '$lib/auth';
	import { getAppContext } from '$lib/context';
	import { onMount } from 'svelte';

	interface Props {
		close?: () => void;
	}

	let { close }: Props = $props();

	const { isAuthenticated } = getAppContext();
	let subscription = $state(null);

	onMount(async () => {
		if (!isAuthenticated()) return;

		const token = await getToken();
		if (!token) return;
		const headers = new Headers();
		headers.set('Authorization', `Bearer ${token}`);
		headers.set('Accept', 'application/json');

		const response = await fetch(`${AGNOSTIC_API_URI}/billing/api/subscriptions`, {
			headers
		});

		if (!response.ok) return;
		subscription = await response.json();
	});

	async function checkout() {
		const token = await getToken();
		if (!token) return;

		const headers = new Headers();
		headers.set('Authorization', `Bearer ${token}`);
		headers.set('Accept', 'application/json');
		headers.set('Content-Type', 'application/json');

		const response = await fetch(`${AGNOSTIC_API_URI}/billing/api/checkout/session`, {
			method: 'POST',
			headers
		});

		if (!response.ok) {
			console.error(await response.text());
			return;
		}

		const json = await response.json();
		window.location = json.session_url;
	}

	async function portal() {
		const token = await getToken();
		if (!token) return;

		const headers = new Headers();
		headers.set('Authorization', `Bearer ${token}`);
		headers.set('Accept', 'application/json');
		headers.set('Content-Type', 'application/json');

		const response = await fetch(`${AGNOSTIC_API_URI}/billing/api/customer/portal`, {
			method: 'GET',
			headers
		});

		if (!response.ok) return;

		const { portal_url } = await response.json();
		window.location = portal_url;
	}
</script>

<div>
	<h2>Subscription</h2>

	{#if isAuthenticated()}
		<div>
			<p>Unleash the power of AGX!</p>

			{#if subscription}
				<button onclick={() => portal()}> Portal </button>
			{:else}
				<button onclick={() => checkout()}> Checkout </button>
			{/if}
		</div>
	{/if}
</div>

<style>
	h2 {
		margin: 0;
		padding: 3px 0 8px;
	}
</style>
