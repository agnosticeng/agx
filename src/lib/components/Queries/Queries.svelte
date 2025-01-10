<script lang="ts">
	import { get_app_context } from '$lib/context';
	import type { Query } from '$lib/repositories/queries';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	interface Props {
		queries?: Query[];

		onopen?: (query: Query) => MaybePromise<void>;
		ondelete?: (query: Query) => MaybePromise<void>;
		onrename?: (query: Query) => MaybePromise<void>;
	}

	let { queries = [], onopen, ondelete, onrename }: Props = $props();

	const { context_menu } = get_app_context();

	let editing_id = $state<Query['id']>();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			editing_id = undefined;
		}
	}

	let input = $state.raw<HTMLInputElement>();
	$effect(() => input?.focus());
</script>

<ol role="menu">
	{#each queries as query (query.id)}
		<li
			tabindex="-1"
			oncontextmenu={(e) => {
				e.preventDefault();
				context_menu.show({
					items: [
						{
							label: 'Open',
							onClick: () => onopen?.(query)
						},
						{
							label: 'Rename',
							onClick: () => (editing_id = query.id)
						},
						{ is_separator: true },
						{
							label: 'Delete',
							onClick: () => ondelete?.(query)
						}
					],
					position: { x: e.clientX, y: e.clientY }
				});
			}}
			role="menuitem"
			onkeydown={(e) => {
				if (e.key === 'Enter' && !editing_id) {
					e.preventDefault();
					editing_id = query.id;
				}
			}}
			onclick={async (e) => {
				if (e.detail >= 2) {
					await onopen?.(query);
					e.currentTarget.blur();
				}
			}}
		>
			<div>
				{#if editing_id === query.id}
					<form
						onsubmit={async (e) => {
							e.preventDefault();
							const form_data = new FormData(e.currentTarget);
							const name = form_data.get('name') as string;
							if (name && name !== query.name) {
								await onrename?.({ ...query, name });
							}
							editing_id = undefined;
						}}
					>
						<input
							bind:this={input}
							type="text"
							name="name"
							value={query.name}
							onkeydown={handleKeydown}
							onblur={() => (editing_id = undefined)}
							autocomplete="off"
						/>
					</form>
				{:else}
					<span class="name">{query.name}</span>
				{/if}
				<span class="time">{dayjs(query.createdAt).fromNow()}</span>
			</div>
		</li>
	{/each}
</ol>

<style>
	ol {
		list-style: none;
		margin: 0;
		padding: 0;

		flex: 1;
		overflow-y: auto;
	}

	li {
		padding: 3px 5px;
		border-radius: 3px;

		cursor: default;
		user-select: none;
		-webkit-user-select: none;

		display: flex;
		align-items: center;
		gap: 5px;

		& > div {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 2px;
			overflow: hidden;

			& > form {
				width: 100%;

				& > input {
					appearance: none;
					-webkit-appearance: none;
					width: 100%;
					height: 18px;
					font-weight: 500;
					outline: none;
					margin: 0;
					padding: 0;
					border: none;
				}
			}

			& > span.name {
				display: block;
				height: 18px;
				font-weight: 500;
				padding: 3px 0;
				line-height: 1.15;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				font-weight: 500;
			}

			& > span.time {
				font-size: 10px;
				color: hsl(0deg 0% 60%);
			}
		}

		&:is(:focus-within) {
			outline: none;
			background-color: hsl(0deg 0% 19% / 100%);
		}
	}
</style>
