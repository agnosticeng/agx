<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import General from './General.svelte';
	import Subscription from './Subscription.svelte';

	let modal = $state<ReturnType<typeof Modal>>();
	let open = $state(false);

	const routes = ['General', 'Subscription'] as const;
	let route = $state<(typeof routes)[number]>('General');

	export function show(predefinedRoute: typeof route = 'General') {
		route = predefinedRoute;
		open = true;
	}
</script>

{#if open}
	<Modal onclose={() => (open = false)} bind:this={modal} --modal-max-width="680px">
		<h1>Settings</h1>
		<div class="settings-container">
			<nav>
				<ul role="listbox">
					{#each routes as path}
						<li role="option" aria-selected={route === path}>
							<button onclick={() => (route = path)}>{path}</button>
						</li>
					{/each}
				</ul>
			</nav>
			<section>
				{#if route === 'General'}<General close={() => (open = false)} />{/if}
				{#if route === 'Subscription'}<Subscription close={() => (open = false)} />{/if}
			</section>
		</div>
	</Modal>
{/if}

<style>
	h1 {
		padding: 16px 18px;
		margin: 0;
		border-bottom: 1px solid hsl(0deg 0% 20%);
	}

	.settings-container {
		display: grid;
		grid-template-columns: auto 1fr;
	}

	nav {
		width: 236px;
		padding: 16px 18px;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	li[role='option'] {
		width: 100%;

		&:not(:last-of-type) {
			padding-bottom: 6px;
		}

		& > button {
			height: 100%;
			width: 100%;
			overflow: hidden;
			text-align: start;
			padding: 6px;
			color: hsl(0, 0%, 80%);
			border-radius: 4px;
		}

		&:is(:hover, :focus-within) > button:not(:disabled) {
			background-color: hsl(0deg 0% 15%);
			color: hsl(0deg 0% 90%);
		}

		&:is([aria-selected='true']) > button:not(:disabled) {
			background-color: hsl(0deg 0% 20%);
			color: hsl(0deg 0% 90%);
		}
	}

	section {
		padding: 16px 18px;
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		background: none;
		font-size: inherit;
		font-weight: 500;

		&:is(:hover, :focus-within):not(:disabled) {
			cursor: pointer;
		}
	}
</style>
