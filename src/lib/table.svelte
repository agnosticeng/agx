<script lang="ts">
	import type { CHResponse } from './query';

	let { response }: { response: CHResponse } = $props();
</script>

<section>
	<div>
		{#if response}
			<table>
				<thead>
					<tr>
						{#each response.meta as column (column.name)}
							<th>{column.name} ({column.type})</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each response.data as row (row)}
						<tr>
							{#each Object.entries(row) as [key, value] (key)}
								<td>{value}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>

<style>
	section {
		background: rgba(40, 40, 40, 1);
		color: #f6f6f6;

		& > div {
			height: 100%;
			width: 100%;
			overflow: auto;
		}
	}

	tr {
		height: 30px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		border: none;
	}

	th {
		text-align: left;
		font-size: 12px;
		border-bottom: 1px solid rgba(75, 75, 75, 1);
	}

	td {
		font-size: 12px;
	}

	th,
	td {
		padding: 0 5px;
		width: 100px;
	}
</style>
