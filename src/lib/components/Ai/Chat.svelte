<script lang="ts">
	import { autoresize } from '$lib/actions/autoresize.svelte';
	import { scroll_to_bottom } from '$lib/actions/scrollToBottom.svelte';
	import Select from '$lib/components/Select.svelte';
	import CircleStack from '$lib/icons/CircleStack.svelte';
	import CircleStopSolid from '$lib/icons/CircleStopSolid.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import { getTextFromElement, transform } from '$lib/markdown';
	import type { Table } from '$lib/olap-engine';
	import DatasetsBox from './DatasetsBox.svelte';
	import Loader from './Loader.svelte';
	import type { ChatInput, ChatOutput } from './types';

	interface Props {
		messages?: ChatInput['messages'];
		onClearConversation?: () => void;
		datasets: Table[];
		dataset?: Table;
		onOpenInEditor?: (sql: string) => void;
	}

	let {
		messages = $bindable([]),
		onClearConversation,
		datasets,
		dataset = $bindable(),
		onOpenInEditor
	}: Props = $props();

	let loading = $state(false);
	let submitter = $state<HTMLButtonElement>();
	let message = $state('');
	let select = $state<ReturnType<typeof Select>>();
	let textarea = $state<HTMLTextAreaElement>();
	let abortController: AbortController | undefined;
	let chatMessages = $derived(messages.filter((m) => m.role === 'user' || m.role === 'assistant'));

	function getContextFromTable(table: Table): string {
		const columns = table.columns.map((col) => `- ${col.name} (${col.type})`).join('\n');
		return `## Table schema:\n${table.name}\nColumns:\n${columns}`;
	}

	$effect(() => {
		dataset ??= datasets?.at(0);
	});

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		let content = data.get('message');
		if (!content || typeof content !== 'string') return;
		content = content.trim();
		if (!content.length) return;

		message = '';
		messages = messages.concat({ content, role: 'user' });
		loading = true;

		try {
			abortController = new AbortController();
			const response = await fetch(event.currentTarget.action, {
				method: event.currentTarget.method,
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({
					messages: dataset
						? [{ role: 'user', content: getContextFromTable(dataset) }, ...messages]
						: messages,
					stream: false
				}),
				signal: abortController.signal
			});

			if (!response.ok) {
				console.error(await response.text());
				return;
			}

			const output: ChatOutput = await response.json();
			messages = messages.concat(output.message);
		} catch (e) {
			if (e === 'Canceled by user') {
				const last = messages.at(-1);
				messages = messages.slice(0, -1);
				if (last?.content) {
					message = last.content;
					textarea?.dispatchEvent(new InputEvent('input'));
				}
			}
		} finally {
			loading = false;
			abortController = undefined;
		}
	}

	async function handleClick(e: Event) {
		if ((e.target as HTMLButtonElement).classList.contains('copy')) {
			const parent = e
				.composedPath()
				.find((node) => (node as HTMLElement).classList.contains('code-block')) as HTMLElement;
			if (!parent) return;

			const code = parent.querySelector('pre code') as HTMLElement;
			if (!code) return;

			navigator.clipboard.writeText(getTextFromElement(code));
		}

		if ((e.target as HTMLButtonElement).classList.contains('open')) {
			const parent = e
				.composedPath()
				.find((node) => (node as HTMLElement).classList.contains('code-block')) as HTMLElement;
			if (!parent) return;

			const code = parent.querySelector('pre code') as HTMLElement;
			if (!code) return;

			onOpenInEditor?.(getTextFromElement(code));
		}
	}
</script>

{#snippet context(dataset: Table)}
	<h3><CircleStack size="12" /><span>{dataset.name.split('__').pop()}</span></h3>
{/snippet}

<div class="chat-container">
	<section
		class="conversation"
		use:scroll_to_bottom
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && textarea?.focus()}
	>
		{#each chatMessages as { role, content }, index}
			<article data-role={role}>
				<h2>
					{#if role === 'user'}
						You
					{:else if role === 'assistant'}
						Assistant
					{/if}
				</h2>
				{#if index === 0 && dataset}{@render context(dataset)}{/if}
				<p class="markdown" onclickcapture={handleClick}>
					{@html transform(content)}
				</p>
			</article>
		{/each}
		{#if loading}
			<article>
				<h2>Assistant</h2>
				<Loader />
			</article>
		{:else}
			<article>
				<h2>You</h2>
				{#if chatMessages.length === 0 && dataset}{@render context(dataset)}{/if}
				<form
					id="user-message"
					action="https://ai.agx.app/api/chat"
					method="POST"
					onsubmit={handleSubmit}
				>
					<textarea
						name="message"
						tabindex="0"
						rows="1"
						placeholder="Ask Agnostic AI"
						disabled={loading}
						use:autoresize
						bind:value={message}
						bind:this={textarea}
						onkeydown={(e) => {
							e.stopPropagation();
							if (e.code === 'Enter' && e.metaKey) {
								e.preventDefault();
								submitter?.click();
							}
						}}
					></textarea>
				</form>
			</article>
		{/if}
	</section>

	<div class="submitter">
		<button type="button" title="Add context" onclick={(e) => select?.open(e.currentTarget)}>
			<Plus size="12" />
		</button>
		<span class="separator"></span>
		<Select bind:this={select} placement="top-start">
			<DatasetsBox
				{datasets}
				onSelect={() => (
					select?.close(), abortController?.abort('Context changed'), onClearConversation?.()
				)}
				bind:dataset
			/>
		</Select>
		<select disabled>
			<option selected>Agnostic AI (v0)</option>
		</select>
		<span class="spacer"></span>
		{#if loading}
			<button
				type="button"
				title="Cancel"
				onclick={() => abortController?.abort('Canceled by user')}
			>
				<CircleStopSolid size="12" />
			</button>
		{:else}
			<button form="user-message" type="submit" bind:this={submitter} title="Send ⌘⏎">
				Send ⌘⏎
			</button>
		{/if}
	</div>
</div>

<style>
	.chat-container {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr minmax(0, auto);
	}

	.conversation {
		overflow-y: auto;
		padding-bottom: 36px;
		padding: 15px 20px 0;
	}

	.conversation > article {
		& ~ article {
			padding-top: 18px;
		}

		&:last-child {
			padding-bottom: 18px;
		}

		& :is(h2, h3) {
			margin: 0;
			margin-bottom: 12px;

			font-size: 12px;
			font-weight: 500;
			padding: 3px 5px;
			border-radius: 4px;
			background-color: hsl(0deg 0% 17%);

			display: flex;
			align-items: center;
			gap: 4px;
			max-width: fit-content;
			overflow: hidden;

			& > :global(svg) {
				flex-shrink: 0;
			}

			& > span {
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		& > p {
			margin: 0;
		}
	}

	textarea {
		appearance: none;
		resize: none;
		background-color: transparent;
		border-radius: 0;
		border: none;
		padding: 0;
		width: 100%;
		display: block;
		overflow: visible;
	}

	textarea:focus {
		outline: none;
	}

	.submitter {
		border-top: 1px solid hsl(0deg 0% 20%);
		padding: 6px 4px;
		width: 100%;
		overflow: hidden;

		display: flex;
		align-items: center;
		gap: 4px;

		& > span.separator {
			height: 100%;
			width: 1px;
			background-color: hsl(0deg 0% 20%);
		}

		& > span.spacer {
			flex: 1;
		}
	}

	.submitter > select {
		border: none;
		outline: none;
		background-color: transparent;
		color: hsl(0deg 0% 65%);
		font-size: 11px;
		border-radius: 4px;
		padding: 2px 0;

		&:disabled {
			appearance: none;
		}

		&:not(:disabled):hover {
			cursor: pointer;
			background-color: hsl(0deg 0% 10%);
		}
	}

	.submitter > button {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		height: 18px;
		border-radius: 3px;
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

		&[type='submit'] {
			aspect-ratio: initial;
			font-size: 11px;
			padding: 0 4px;
			background-color: hsl(0deg 0% 10%);

			&:not(:disabled):hover {
				color: hsl(0deg 0% 90%);
				background-color: transparent;
			}
		}
	}

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
