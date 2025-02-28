<script lang="ts">
	import type { ColumnDescriptor } from '$lib/olap-engine';
	import type { ChartSettingsType } from '@agnosticeng/dv';

	let {
		columns,
		settings = $bindable()
	}: {
		settings: ChartSettingsType;
		columns: Array<ColumnDescriptor>;
	} = $props();

	let showChartSettings = $state(false);

	const toggleChartSettings = () => {
		showChartSettings = !showChartSettings;
	};

	const handleChartTypeChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		settings.type = select.value as 'candle' | 'line' | 'bar';
		if (settings.type !== 'bar') {
			settings.z = undefined;
		}
	};

	const handleXAxisChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		const options = Array.from(select.options).map((o) => o.value);
		settings.x = options[select.selectedIndex];
	};

	const handleYAxisChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		const selectedOptions = Array.from(select.selectedOptions).map((option) => option.value);
		settings.y = selectedOptions;
	};

	const handleZAxisChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		const options = Array.from(select.options).map((o) => o.value);
		settings.z = options[select.selectedIndex];
		if (!settings.z) settings.z = undefined;
	};
</script>

{#if showChartSettings}
	<section class="chart-settings">
		<form>
			<div class="setting">
				<span>type</span>
				<select multiple value={settings.type} onchange={handleChartTypeChange} size={3}>
					<option value="line">line</option>
					<option value="candle">candle</option>
					<option value="bar">bar</option>
				</select>
			</div>

			<div class="setting">
				<span>x-axis</span>
				<select value={settings.x} onchange={handleXAxisChange} size={columns.length}>
					{#each columns as column}
						<option value={column.name}>{column.name}</option>
					{/each}
				</select>
			</div>

			<div class="setting">
				<span>y-axis</span>
				<div style="display: flex; gap: 5px;">
					<select
						multiple
						value={settings.y}
						onchange={handleYAxisChange}
						size={columns.length}
						disabled={settings.type === 'candle'}
					>
						{#each columns as column}
							<option value={column.name}>{column.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="setting">
				<span>z-axis</span>
				<div style="display: flex; gap: 5px;">
					<select
						value={settings.z}
						onchange={handleZAxisChange}
						size={columns.length + 1}
						disabled={settings.type !== 'bar'}
					>
						<option value="">none</option>
						{#each columns as column}
							<option value={column.name}>{column.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</form>
	</section>
{/if}

<svelte:window
	on:click={(e) => {
		const target = e.target as HTMLElement;

		const isTargetWithinSettings = target?.closest('.chart-settings');
		const isTargetWithinChartSettingsButton = target?.closest(
			'[data-action="toggle-chart-settings"]'
		);
		if (isTargetWithinChartSettingsButton || (!isTargetWithinSettings && showChartSettings)) {
			toggleChartSettings();
		}
	}}
/>

<style>
	.chart-settings {
		font-family: monospace;
		font-size: 10px;
		position: absolute;
		top: 10px;
		right: 10px;
		width: 200px;
		background: hsla(0, 0%, 5%, 0.8);
		border: 1px solid hsl(0deg 0% 20%);
		padding: 10px;
	}

	.chart-settings select {
		width: 80px;
		border: none;
		background: transparent;
		color: white;
		outline: none;
		color: grey;

		&:disabled,
		&:disabled option {
			opacity: 1;
			color: grey;
			& option:checked {
				color: white;
			}
		}

		& option:checked,
		& option:active {
			background: none;
		}
	}

	.chart-settings .setting {
		display: flex;
		justify-content: space-between;
		padding-bottom: 2px;
		margin-bottom: 5px;
	}

	select::-webkit-scrollbar {
		display: none;
	}
</style>
