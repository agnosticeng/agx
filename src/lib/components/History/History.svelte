<script lang="ts">
	import { get_app_context } from '$lib/context';
	import { show as showMenu } from './contextmenu';

	const { history } = get_app_context();
</script>

<ol>
	{#each history.entries as entry}
		<li>
			<details>
				<summary
					oncontextmenu={async (e) => {
						e.preventDefault();
						const element = e.currentTarget;
						element.classList.add('Selected');
						await showMenu(history, entry);
						element.classList.remove('Selected');
					}}
				>
					{new Date(entry.ts).toUTCString()}
				</summary>
				<pre>{entry.state}</pre>
			</details>
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

	summary {
		user-select: none;
		-webkit-user-select: none;

		cursor: pointer;

		padding: 3px 5px;
		border-radius: 3px;

		&:global(.Selected) {
			background-color: hsl(210deg 100% 52%);
		}
	}

	pre {
		padding-left: 14px;
		overflow-x: auto;
	}
</style>
