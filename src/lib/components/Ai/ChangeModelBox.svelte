<script lang="ts">
	import type { Model } from './types';

	interface Props {
		models: Model[];
		model?: Model;
		onSelect?: (model: Model) => void;
	}

	let { models, model = $bindable(), onSelect }: Props = $props();
</script>

<div>
	<ul role="listbox">
		{#each models as m (m.name + m.brand)}
			{@const isSelected =
				m.brand === model?.brand && m.name === model?.name && m.baseURL === model?.baseURL}
			<li role="option" aria-selected={isSelected}>
				<button
					title={[m.brand, m.name].filter(Boolean).join(' • ')}
					type="button"
					onclick={() => ((model = m), onSelect?.(m))}
				>
					<span class="name">{m.name}</span>
					<span class="description">
						<span class="tag">{m.brand}</span>
					</span>
				</button>
			</li>
		{:else}
			<li role="option" aria-selected="false">
				<span>No model available</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	div {
		background-color: hsl(0, 0%, 10%);
		border: 1px solid hsl(0, 0%, 15%);
		border-radius: 6px;
		overflow: hidden;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	ul[role='listbox'] {
		padding: 4px;
		width: 265px;
		max-height: 265px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	li[role='option'] {
		width: 100%;

		&:not(:last-of-type) {
			padding-bottom: 2px;
		}

		& > span {
			display: block;
			padding: 4px 0;
			text-align: center;
		}

		& > button {
			height: 100%;
			width: 100%;
			overflow: hidden;
			text-align: start;
			padding: 6px;
			color: hsl(0, 0%, 80%);
			border-radius: 4px;

			& > span {
				display: block;

				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;

				&:first-of-type {
					font-family: monospace;
					margin-bottom: 3px;
				}

				&:last-of-type {
					color: hsl(0, 0%, 75%);
				}
			}
		}

		&:is(:hover, :focus-within) > button:not(:disabled) {
			background-color: hsl(0deg 0% 15%);
			color: hsl(0deg 0% 90%);
		}

		&:is([aria-selected='true']) > button:not(:disabled) {
			background-color: hsl(0deg 0% 20%);
			color: hsl(0deg 0% 90%);
		}
	}

	span.tag {
		display: inline-block;
		padding: 2px 4px;
		border-radius: 4px;
		background-color: hsl(0deg 0% 17%);
		margin-right: 4px;
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
