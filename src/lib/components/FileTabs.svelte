<script lang="ts">
	import type { Workspace } from '$lib/components/Editor';
	import Plus from '$lib/icons/Plus.svelte';
	import XMark from '$lib/icons/XMark.svelte';

	interface Props {
		workspace: Workspace;
	}

	let { workspace }: Props = $props();

	function addNew() {
		workspace.add({ id: crypto.randomUUID(), name: 'Untitled', contents: '' });
		workspace.focus();
	}
</script>

<div class="file-tabs">
	{#each workspace.files as file (file.id)}
		<div
			class="tab"
			role="button"
			tabindex="0"
			aria-current={file.id === workspace.current.id}
			onkeyup={() => {}}
			onclick={() => workspace.select(file.id)}
		>
			<span class="filename">{file.name}</span>
			<button
				class="remove"
				class:hidden={workspace.files.length === 1}
				onclick={(e) => {
					e.stopPropagation();
					workspace.remove(file);
				}}
			>
				<XMark size="10" />
			</button>
		</div>
	{/each}

	<button onclick={addNew} class="add-new" aria-label="Open new tab" title="Open new tab">
		<Plus size="14" />
	</button>
</div>

<style>
	.file-tabs {
		border: none;
		margin: 0;
		height: 100%;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;

		display: flex;
		align-items: center;
	}

	.file-tabs .tab {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		border: none;
		padding: 0 1rem;
		height: 100%;
		cursor: pointer;
		background-color: hsl(0deg 0% 5%);
	}

	.file-tabs .tab {
		--padding-left: 1.4rem;
		--padding-right: 1.4rem;
		padding: 0 var(--padding-right) 0 var(--padding-left);

		& > .remove {
			position: absolute;
			display: none;
			top: 0;
			right: 0;
			padding: 0 0.2rem;
			width: 1.2rem;
			height: 100%;
			cursor: pointer;
			background-color: none;

			& :global(svg) {
				width: 100%;
				height: 100%;
			}
		}

		&[aria-current='true'] {
			border: 1px solid hsl(0deg 0% 20%);
			border-bottom: none;
			z-index: 2;

			.remove:not(.hidden) {
				display: block;
			}
		}
	}

	.add-new {
		height: calc(100% - 8px);
		aspect-ratio: 1;
		padding: 4px;
		margin-left: 4px;
		border-radius: 4px;

		&:hover {
			cursor: pointer;
			background-color: hsl(0deg 0% 17%);
		}

		&:active {
			background-color: hsl(0deg 0% 20%);
		}

		& :global(svg) {
			width: 100%;
			height: 100%;
		}
	}

	button {
		appearance: none;
		-webkit-appearance: none;
		outline: none;
		border: none;
		background-color: transparent;
	}
</style>
