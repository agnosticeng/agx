<script lang="ts">
	import { getToken, openUrl } from '$lib/auth';
	import { getAppContext } from '$lib/context';
	import { billing, isSubscriptionActive } from '$lib/subscriptions';

	interface Props {
		close?: () => void;
	}

	let { close }: Props = $props();

	const { isAuthenticated, subscription: getSubscription } = getAppContext();
	const subscription = $derived(getSubscription());

	async function checkout() {
		const token = await getToken();
		if (!token) return;

		const url = await billing.createCheckoutSession({ token });
		if (url) await openUrl(url);
	}

	async function portal() {
		const token = await getToken();
		if (!token) return;

		const url = await billing.getCustomerPortal({ token });
		if (url) await openUrl(url);
	}
</script>

<div>
	<h2>Subscription</h2>

	{#if isSubscriptionActive(subscription)}
		<p>
			Thanks for subscribing — you now have full access to agx Pro. Enjoy enhanced performance with
			agp, priority features, and a faster, smarter analytics experience.
		</p>
	{:else}
		<p>
			Subscribe to unlock the full power of agx — get deeper control with agp, faster queries,
			advanced features, and early access to what's coming next.
		</p>
	{/if}

	<div>
		{#if subscription}
			<button onclick={() => portal()}>Portal</button>
		{:else}
			<button onclick={() => checkout()}>Subscribe</button>
		{/if}
	</div>
</div>

<style>
	h2 {
		margin: 0;
		padding: 3px 0 8px;
	}

	p {
		margin: 0;
		font-size: 12px;
		color: hsl(0deg 0% 86%);
	}

	div > div {
		padding: 28px 0 14px;
	}

	div > button {
		background-color: hsl(0deg 0% 90%);
		color: hsl(0deg 0% 27%);
		padding: 4px 6px;
		border-radius: 3px;
		font-size: 12px;

		&:hover {
			background-color: hsl(0deg 0% 86%);
			color: hsl(0deg 0% 14%);
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		font-size: 10px;
		font-weight: 500;

		&:is(:hover, :focus-within):not(:disabled) {
			cursor: pointer;
		}
	}
</style>
