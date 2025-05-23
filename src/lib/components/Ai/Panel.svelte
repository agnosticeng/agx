<script lang="ts">
	import Plus from '$lib/icons/Plus.svelte';
	import type { Table } from '$lib/olap-engine';
	import { tick } from 'svelte';
	import type { Chat } from '.';
	import Tab from '../Tab.svelte';
	import ChatComponent from './Chat.svelte';
	import type { Model } from './types';

	interface Props {
		datasets: Table[];
		chats?: Chat[];
		focused?: number;
		onCloseAllTab?: () => void;
		onOpenInEditor?: (sql: string) => void;
		models: Model[];
		selectedModel: Model;
		onModelChange: (m: Model) => void;
	}

	let {
		chats = $bindable([]),
		focused = $bindable(0),
		datasets,
		onCloseAllTab,
		onOpenInEditor,
		models,
		selectedModel,
		onModelChange
	}: Props = $props();

	const current = $derived(chats.at(focused));
	let scrollContainer = $state<HTMLElement>();

	function close(index: number) {
		chats = chats.toSpliced(index, 1);
		focused = Math.max(0, focused - 1);
		if (chats.length === 0) onCloseAllTab?.();
	}

	async function add(name: string) {
		chats = [...chats, { id: crypto.randomUUID(), messages: [], name, dataset: datasets.at(0) }];
		focused = chats.length - 1;
		await tick();
		scrollContainer?.scroll({ left: scrollContainer.scrollWidth, behavior: 'smooth' });
	}
</script>

<div class="container">
	<nav>
		<div class="scroll-tab-container" bind:this={scrollContainer}>
			{#each chats as chat, index (chat.id)}
				<Tab
					active={index === focused}
					label={chat.name}
					onClose={() => close(index)}
					onSelect={() => (focused = index)}
				/>
			{/each}
			<button class="add-chat" onclick={() => add('New Chat')}><Plus size="14" /></button>
		</div>
	</nav>
	{#each chats as chat (chat.id)}
		<div style:display={chat.id === current?.id ? '' : 'none'}>
			<ChatComponent
				bind:dataset={chat.dataset}
				{datasets}
				bind:messages={chat.messages}
				onClearConversation={() => (chat.messages = [])}
				{onOpenInEditor}
				{models}
				model={selectedModel}
				{onModelChange}
			/>
		</div>
	{/each}
</div>

<style>
	.container {
		--tab-height: 28px;
		background-color: hsl(0deg 0% 5%);
		border-left: 1px solid hsl(0deg 0% 20%);

		height: 100%;
		width: 100%;
	}

	nav {
		height: var(--tab-height);
		white-space: nowrap;
		position: relative;
		overflow: hidden;

		& > div {
			height: 100%;
			overflow-x: auto;
			overflow-y: visible;
			scrollbar-width: none;

			display: flex;
			align-items: center;
			justify-content: start;

			padding-right: 4px;
		}

		&::before {
			content: '';
			position: absolute;
			height: 1px;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: hsl(0deg 0% 20%);
			z-index: 1;
		}

		& button.add-chat {
			margin-left: 4px;
			display: grid;
			place-items: center;
			aspect-ratio: 1;
			height: 18px;
			border-radius: 4px;
			background-color: transparent;
			color: hsl(0deg 0% 80%);
			border: none;

			&:disabled {
				color: hsl(0deg 0% 65%);
			}

			&:not(:disabled):hover {
				color: hsl(0deg 0% 90%);
				background-color: hsl(0deg 0% 10%);
			}
		}
	}

	div.container > div {
		height: calc(100% - var(--tab-height));
	}

	/* Reset button style */
	button {
		appearance: none;
		outline: none;
		border: none;
		background: none;
		padding: 0;

		&:not(:disabled):hover {
			cursor: pointer;
		}
	}
</style>
