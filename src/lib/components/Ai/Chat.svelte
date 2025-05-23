<script lang="ts">
	import { autoresize } from '$lib/actions/autoresize.svelte';
	import { scroll_to_bottom } from '$lib/actions/scrollToBottom.svelte';
	import { getToken } from '$lib/auth';
	import Select from '$lib/components/Select.svelte';
	import { getAppContext } from '$lib/context';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import CircleStack from '$lib/icons/CircleStack.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Stop from '$lib/icons/Stop.svelte';
	import { getTextFromElement, transform } from '$lib/markdown';
	import type { Table } from '$lib/olap-engine';
	import { onMount } from 'svelte';
	import { isAgnosticModel } from '.';
	import Login from '../Login.svelte';
	import ChangeModelBox from './ChangeModelBox.svelte';
	import DatasetsBox from './DatasetsBox.svelte';
	import Loader from './Loader.svelte';
	import { OpenAIClient } from './OpenAI';
	import type { ChatInput, Model } from './types';

	interface Props {
		messages?: ChatInput['messages'];
		onClearConversation?: () => void;
		datasets: Table[];
		dataset?: Table;
		onOpenInEditor?: (sql: string) => void;
		models: Model[];
		model: Model;
		onModelChange: (m: Model) => void;
	}

	let {
		messages = $bindable([]),
		onClearConversation,
		datasets,
		dataset = $bindable(),
		onOpenInEditor,
		models,
		model,
		onModelChange
	}: Props = $props();

	let loading = $state(false);
	let submitter = $state<HTMLButtonElement>();
	let message = $state('');
	let datasetSelectbox = $state<ReturnType<typeof Select>>();
	let textarea = $state<HTMLTextAreaElement>();
	let abortController: AbortController | undefined;
	let modelSelectbox = $state<ReturnType<typeof Select>>();
	let form = $state<HTMLFormElement>();
	const uid = $props.id();
	const { isAuthenticated } = getAppContext();
	const needToLogin = $derived(isAgnosticModel(model) && !isAuthenticated());

	function getContextFromTable(table: Table): string {
		const columns = table.columns.map((col) => `- ${col.name} (${col.type})`).join('\n');
		return `## Table schema:\n${table.name}\nColumns:\n${columns}`;
	}

	$effect(() => {
		dataset ??= datasets?.at(0);
	});

	onMount(() => form?.dispatchEvent(new SubmitEvent('submit')));
	const client = $derived(new OpenAIClient(model.baseURL));

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		const form = event.currentTarget;

		let token: string | undefined;
		if (isAgnosticModel(model)) {
			if (isAuthenticated()) token = await getToken();
			else return;
		}

		const lastMessage = messages.at(-1);
		if (lastMessage?.role !== 'user') {
			const data = new FormData(form);
			let content = data.get('message');
			if (!content || typeof content !== 'string') return;
			content = content.trim();
			if (!content.length) return;

			message = '';
			messages = messages.concat({ role: 'user', content });
		}

		loading = true;

		try {
			abortController = new AbortController();
			const completion = await client.createChatCompletion(
				{
					model: model.name,
					messages: dataset
						? [{ role: 'system', content: getContextFromTable(dataset) }, ...messages]
						: messages,
					stream: false
				},
				{ signal: abortController.signal, token }
			);

			messages = messages.concat(completion.choices[0].message);
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
	{#if needToLogin}
		<div class="login-wrapper"><Login /></div>
	{:else}
		<section
			class="conversation"
			use:scroll_to_bottom
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && textarea?.focus()}
		>
			{#each messages as { role, content }, index}
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
					{#if messages.length === 0 && dataset}{@render context(dataset)}{/if}
					<form id="{uid}-user-message" method="POST" onsubmit={handleSubmit} bind:this={form}>
						<textarea
							name="message"
							tabindex="0"
							rows="1"
							placeholder="Ask {model.name}"
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
	{/if}

	<div class="submitter">
		<button
			type="button"
			title="Add context"
			onclick={(e) => datasetSelectbox?.open(e.currentTarget)}
		>
			<Plus size="12" />
		</button>
		<Select bind:this={datasetSelectbox} placement="top-start">
			<DatasetsBox
				{datasets}
				onSelect={() => (
					datasetSelectbox?.close(),
					abortController?.abort('Context changed'),
					onClearConversation?.()
				)}
				bind:dataset
			/>
		</Select>
		<span class="separator"></span>
		<button
			type="button"
			title="Change model"
			onclick={(e) => modelSelectbox?.open(e.currentTarget)}
			disabled={models.length === 1}
			class="select-trigger"
		>
			<span>{model.name}</span>
			{#if models.length > 1}
				<ChevronDown size="12" />
			{/if}
		</button>
		<Select bind:this={modelSelectbox} placement="top-start" id="change-model">
			<ChangeModelBox
				{models}
				bind:model
				onSelect={(m) => {
					modelSelectbox?.close();
					abortController?.abort('Model changed');
					onModelChange(m);
				}}
			/>
		</Select>
		<span class="spacer"></span>
		{#if loading}
			<button
				type="button"
				title="Cancel"
				onclick={() => abortController?.abort('Canceled by user')}
			>
				<Stop size="11" />
			</button>
		{:else}
			<button
				form="{uid}-user-message"
				type="submit"
				bind:this={submitter}
				title="Send ⌘⏎"
				disabled={needToLogin}
			>
				Send ⌘⏎
			</button>
		{/if}
	</div>
</div>

<style>
	.chat-container {
		--submitter-height: 34px;

		height: 100%;
		width: 100%;
	}

	.login-wrapper {
		height: calc(100% - var(--submitter-height));
	}

	.conversation {
		height: calc(100% - var(--submitter-height));
		overflow-y: auto;
		padding: 15px 20px 0;
		padding-bottom: 36px;
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
		min-height: 15px;
		display: block;
		overflow: visible;
	}

	textarea:focus {
		outline: none;
	}

	.submitter {
		border-top: 1px solid hsl(0deg 0% 20%);
		padding: 6px 4px;
		height: var(--submitter-height);
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

		&.select-trigger {
			aspect-ratio: initial;
			padding: 0 4px;
			display: flex;
			gap: 4px;
		}
	}

	:global(body:has(#change-model)) .select-trigger :global(> svg) {
		transform-origin: center;
		transform: rotate(180deg);
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
