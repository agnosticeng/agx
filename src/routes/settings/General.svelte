<script lang="ts">
	import { login, logout } from '$lib/auth';
	import { getAppContext } from '$lib/context';

	interface Props {
		close?: () => void;
	}

	let { close }: Props = $props();
	const { isAuthenticated } = getAppContext();
</script>

<div>
	<h2>General</h2>
	{#if isAuthenticated()}
		<p>
			You are now logged in. Ask Agnostic to write SQL, find insights, or guide your next query.
		</p>
		<div>
			<button type="button" onclick={() => logout()}>Logout</button>
		</div>
	{:else}
		<p>
			Log in to start generating SQL with Agnostic AI. Ask questions, get queries, and explore your
			data faster than ever.
		</p>
		<div>
			<button type="button" onclick={() => login()}>Login</button>
		</div>
	{/if}
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
