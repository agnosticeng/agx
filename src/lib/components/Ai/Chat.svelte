<script lang="ts">
	import { autoresize } from '$lib/actions/autoresize.svelte';
	import { scroll_to_bottom } from '$lib/actions/scrollToBottom.svelte';
	import Send from '$lib/icons/Send.svelte';
	import Sparkles from '$lib/icons/Sparkles.svelte';
	import UserCircle from '$lib/icons/UserCircle.svelte';
	import { transform } from '$lib/markdown';
	import Loader from './Loader.svelte';
	import type { ChatInput, ChatOutput } from './types';

	interface Props {
		messages?: ChatInput['messages'];
	}

	let { messages = $bindable([]) }: Props = $props();

	let loading = $state(false);
	let submitter = $state<HTMLButtonElement>();
	let message = $state('');

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		let content = data.get('message');
		if (!content || typeof content !== 'string') return;
		content = content.trim();
		if (!content.length) return;

		event.currentTarget.message.value = '';
		event.currentTarget.message.style.height = '';
		messages = messages.concat({ content, role: 'user' });
		loading = true;

		try {
			const response = await fetch(event.currentTarget.action, {
				method: event.currentTarget.method,
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({ messages, stream: false })
			});

			if (!response.ok) {
				console.error(await response.text());
				return;
			}

			const output: ChatOutput = await response.json();
			messages = messages.concat(output.message);
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<div class="agents"></div>
	<section class="conversation" use:scroll_to_bottom>
		{#each messages.filter((m) => m.role === 'user' || m.role === 'assistant') as { role, content }}
			<article data-role={role}>
				<h2>
					{#if role === 'user'}
						<UserCircle size="18" /> You
					{:else if role === 'assistant'}
						<Sparkles size="18" /> Ai Assistant
					{/if}
				</h2>
				<p class="markdown">
					{@html transform(content)}
				</p>
			</article>
		{/each}
		{#if loading}
			<article>
				<Loader />
			</article>
		{/if}
	</section>
	<div class="submitter">
		<form action="https://ai.agx.app/api/chat" method="POST" onsubmit={handleSubmit}>
			<textarea
				name="message"
				tabindex="0"
				rows="1"
				placeholder="Ask Agnostic Ai"
				disabled={loading}
				use:autoresize
				bind:value={message}
				onkeydown={(e) => {
					e.stopPropagation();
					if (e.code === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						submitter?.click();
					}
				}}
			></textarea>
			<div class="actions">
				<select>
					<option selected>Agnostic Ai (alpha)</option>
				</select>
				<button type="submit" disabled={!message || loading} bind:this={submitter}>
					<Send size="16" />
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.container {
		padding: 14px 20px;
		padding-top: 0;
		background-color: hsl(0deg 0% 5%);
		border-left: 1px solid hsl(0deg 0% 20%);

		height: 100%;
		width: 100%;
		display: grid;
		gap: 8px;
		grid-template-rows: 28px 1fr minmax(0px, auto);
		position: relative;
	}

	.conversation {
		overflow-y: auto;
		padding-bottom: 36px;
	}

	.conversation > article {
		margin-bottom: 18px;
		padding-bottom: 8px;

		&:not(:last-child) {
			border-bottom: 1px solid hsl(0deg 0% 20%);
		}

		& h2 {
			margin: 0;
			font-size: 13px;
			display: flex;
			align-items: center;
			gap: 8px;
		}
	}

	.submitter {
		max-width: 48rem;
		width: 100%;
		margin: 12px auto 0;
	}

	form {
		background-color: hsl(0deg 0% 15%);
		padding: 6px;
		border-radius: 4px;
		padding: 0 6px 6px;
	}

	textarea {
		appearance: none;
		resize: none;
		background-color: transparent;
		border-radius: 0;
		border: none;
		padding: 8px 4px;
		max-height: 25dvh;
		width: 100%;
		display: block;
	}

	textarea:focus {
		outline: none;
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 4px;
	}

	.actions > select {
		border: none;
		outline: none;
		background-color: transparent;
		color: hsl(0deg 0% 65%);
		font-size: 11px;
	}

	button[type='submit'] {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		height: 22px;
		border-radius: 4px;
		background-color: transparent;
		color: hsl(0deg 0% 80%);
		border: none;

		&:disabled {
			color: hsl(0deg 0% 65%);
		}

		&:not(:disabled):hover {
			cursor: pointer;
			color: hsl(0deg 0% 90%);
			background-color: hsl(0deg 0% 10%);
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		background: none;
		padding: 0;
	}
</style>
