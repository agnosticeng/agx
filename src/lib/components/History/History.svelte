<script lang="ts">
	import { get_app_context } from '$lib/context';
	import { format_date } from '$lib/utils/date';
	import { generate } from '../Editor/html_generater';

	const { history } = get_app_context();

	const sections = $derived(
		Object.groupBy(history.entries, (entry) => format_date(new Date(entry.timestamp), "dd MMM 'yy"))
	);

	function handleKeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLOListElement }) {
		if (!(e.target instanceof HTMLElement)) return;
		const host = e.currentTarget;
		const fucusable_elements = Array.from<HTMLElement>(
			host.querySelectorAll('[tabindex]:is(summary, li)')
		);

		const index = fucusable_elements.indexOf(e.target);

		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();

			const direction = e.key === 'ArrowDown' ? 1 : -1;
			const length = fucusable_elements.length;
			const nextIndex = (length + index + direction) % length;

			const next = fucusable_elements[nextIndex];

			fucusable_elements.forEach((e) => (e.tabIndex = -1));

			next.tabIndex = 0;
			next.focus();
		}
	}
</script>

<ol onkeydown={handleKeydown} role="menu">
	{#each Object.entries(sections) as [section, entries]}
		{#if entries}
			<li>
				<details>
					<summary tabindex="-1">{section}</summary>
					<ol>
						{#each entries as entry}
							<li tabindex="-1">
								<span class="time">{new Date(entry.timestamp).toLocaleTimeString('en-US')}</span>
								{@html generate(entry.content)}
							</li>
						{/each}
					</ol>
				</details>
			</li>
		{/if}
	{/each}
</ol>

<style>
	ol {
		list-style: none;
		margin: 0;
		padding: 0;

		flex: 1;
		overflow-y: auto;

		summary + & {
			padding-left: 18px;
		}
	}

	summary {
		user-select: none;
		-webkit-user-select: none;

		cursor: pointer;

		padding: 3px 5px;
		border-radius: 3px;

		&:focus {
			outline: none;
			background-color: hsl(210deg 100% 52%);
		}
	}

	.time {
		font-size: 10px;
		color: hsl(0deg 0% 96%);
	}

	li {
		padding: 3px 5px;
		border-radius: 3px;

		summary + ol > & {
			padding: 3px 0;
		}

		&:focus {
			outline: none;
			background-color: hsl(210deg 100% 52%);
		}
	}
</style>
