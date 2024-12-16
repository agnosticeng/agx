<script lang="ts">
	import type { CHResponse } from '$lib/query';
	import { Types } from './utils';

	interface Props {
		response: CHResponse;
	}

	let { response }: Props = $props();

	const columns = $derived(response.meta);
	const rows = $derived(response.data);
</script>

<table class="Table">
	<thead class="Table-head Table-head__sticky">
		<tr class="Table-row">
			<th class="Table-cell Table-cell__width__min Table-cell__align__right"> # </th>
			{#each columns as { name, type }}
				{@const dir = Types.is_number(type) ? 'right' : 'left'}
				<th class="Table-cell Table-cell__align__{dir}">{name} ({Types.remove_nullable(type)})</th>
			{/each}
		</tr>
	</thead>
	<tbody class="Table-body">
		{#each rows as row, index}
			<tr class="Table-row">
				<td class="Table-cell Table-cell__width__min Table-cell__align__right">
					{index}
				</td>
				{#each columns as { name, type }}
					{@const value = row[name]}
					{@const dir = Types.is_number(type) ? 'right' : 'left'}
					<td class="Table-cell Table-cell__align__{dir}">
						{value}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	/* Reset */
	td,
	th {
		padding: 0;
	}

	.Table {
		width: 100%;
		border-collapse: collapse;
		border-spacing: 0;
	}

	.Table-head .Table-cell {
		border-top: 1px solid hsl(0deg 0% 12%);
	}

	.Table-cell {
		width: auto;
		padding: 0 0 0 12px;
		height: 26px;
	}

	.Table-row .Table-cell:last-child {
		padding-right: 20px;
	}

	.Table-cell__width__min {
		width: 1px;
		white-space: nowrap;
	}

	.Table-cell__align__right {
		text-align: right;
	}

	.Table-cell__align__left {
		text-align: left;
	}

	.Table-cell__align__center {
		text-align: center;
	}

	.Table-head.Table-head__sticky .Table-cell {
		background-color: hsl(0deg 0% 0%);
		position: sticky;
		top: 0;
		z-index: 1;
	}
</style>
