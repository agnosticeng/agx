<script lang="ts">
	import { highlight_code_html } from '$lib/components/Editor';
	import { get_app_context } from '$lib/context';
	import { format_date } from '$lib/utils/date';

	const { history } = get_app_context();

	const sections = $derived(
		Object.groupBy(history.entries, (entry) => format_date(new Date(entry.timestamp), "dd MMM 'yy"))
	);

	function cut_off_for_preview(code: string) {
		const max_length = 100;
		const need_ellipsis = code.length > max_length;
		return need_ellipsis ? code.slice(0, max_length) + '\n...' : code;
	}
</script>

<ol role="menu">
	{#each Object.entries(sections) as [section, entries]}
		{#if entries}
			<li>
				<details>
					<summary tabindex="-1">{section}</summary>
					<ol role="menu">
						{#each entries as entry}
							<li
								tabindex="-1"
								oncontextmenu={(e) => {
									e.preventDefault();
								}}
								role="menuitem"
								onkeydown={(e) => e.key === 'Enter' && history.select(entry)}
								onclick={(e) => e.detail >= 2 && history.select(entry)}
							>
								<span class="time">{new Date(entry.timestamp).toLocaleTimeString('en-US')}</span>
								{@html highlight_code_html(cut_off_for_preview(entry.content))}
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

		cursor: default;

		summary + ol > & {
			margin-top: 4px;
			padding: 3px 0;

			overflow: hidden;

			user-select: none;
			-webkit-user-select: none;
		}

		&:focus {
			outline: none;
			background-color: hsl(210deg 100% 52%);
		}
	}
</style>
