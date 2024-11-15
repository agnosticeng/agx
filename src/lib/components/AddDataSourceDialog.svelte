<script lang="ts">
	import type { DataSource } from '$lib/datasources';
	import { slugify } from '$lib/slugify';
	import { dialog } from '@tauri-apps/api';
	import { appWindow } from '@tauri-apps/api/window';
	import { tick, type Snippet } from 'svelte';

	interface Props {
		children?: Snippet<[{ open: () => void }]>;
		onCreate?: (source: DataSource) => void | Promise<void>;
	}

	let { children, onCreate }: Props = $props();

	let modal: HTMLDialogElement;

	async function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		e.preventDefault();

		const form = e.currentTarget;
		const form_data = new FormData(form);
		const values = Object.fromEntries(form_data) as {
			name: string;
			slug: string;
			path: string;
			connection_type: 's3' | 'file';
		};

		const type = values.path
			.match(/.(csv|parquet)$/i)?.[1]
			?.toLowerCase()
			.replace(/^(csv|[a-z])/, (char) => char.toUpperCase());

		const source = {
			name: values.name,
			slug: values.slug,
			path: `${values.connection_type}('${values.path}', '${type!}')`,
			type: type as DataSource['type'],
			timestamp: Date.now()
		} satisfies DataSource;

		modal.close();
		await onCreate?.(source);
		form.reset();
	}

	let name_value = $state('');
	let path_value = $state('');

	async function open_file() {
		const path = await dialog.open({
			title: 'Open Sources',
			filters: [{ name: 'datasource files', extensions: ['csv', 'parquet'] }],
			multiple: false
		});

		if (typeof path === 'string') path_value = path;
	}

	function handleClickOutside(e: MouseEvent & { currentTarget: HTMLDialogElement }) {
		const rect = e.currentTarget.getBoundingClientRect();
		if (
			rect.left > e.clientX ||
			rect.right < e.clientX ||
			rect.top > e.clientY ||
			rect.bottom < e.clientY
		) {
			e.currentTarget.close();
		}
	}

	appWindow.onFileDropEvent(async (event) => {
		if (event.payload.type !== 'drop') return;
		const path = event.payload.paths[0];
		const ext = get_extension(path);
		if (ext && ['csv', 'parquet'].includes(ext.toLowerCase())) {
			if (!modal.open) {
				modal.showModal();
				await tick();
			}
			path_value = path;
			name_value = get_filename(path);
		}
	});

	function get_extension(path: string) {
		return path.split('.').pop();
	}

	function get_filename(path: string) {
		return path.split('/').pop()!.split('.').slice(0, -1).join('');
	}
</script>

{@render children?.({ open: () => modal.showModal() })}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={modal} onclick={handleClickOutside}>
	<h1>Add source</h1>
	<form onsubmit={handleSubmit}>
		<label>
			<span>Name:</span>
			<input
				type="text"
				placeholder="Ethereum events"
				name="name"
				required
				bind:value={name_value}
			/>
		</label>
		<label>
			<span>Slug:</span>
			<input
				type="text"
				placeholder="ethereum_event"
				name="slug"
				value={slugify(name_value)}
				readonly
			/>
		</label>
		<label>
			<span>File path:</span>
			<div>
				<input
					type="text"
					placeholder="https://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet"
					name="path"
					bind:value={path_value}
					required
				/>
				<button type="button" onclick={open_file}>Choose file</button>
			</div>
		</label>
		<label>
			<span>Connection type:</span>
			<select name="connection_type">
				<option value="s3" selected>S3</option>
				<option value="file">Local file</option>
			</select>
		</label>

		<div class="Actions">
			<button
				type="button"
				onclick={() => {
					modal.close();
					modal.querySelector('form')?.reset();
				}}>Cancel</button
			>
			<button type="submit">Add source</button>
		</div>
	</form>
</dialog>

<style>
	h1 {
		margin-top: 0;
	}

	dialog[open] {
		opacity: 1;
		transform: translateY(0);
	}

	dialog {
		border: none;
		margin-top: 0;
		border-radius: 6px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		width: 100%;
		max-width: 580px;

		opacity: 0;
		transform: translateY(-40%);

		transition:
			opacity 0.15s ease-out,
			transform 0.15s ease-out,
			overlay 0.15s ease-out allow-discrete,
			display 0.15s ease-out allow-discrete;
	}

	@starting-style {
		dialog[open] {
			opacity: 0;
			transform: translateY(-40%);
		}
	}

	form label {
		display: block;

		& ~ label {
			margin-top: 12px;
		}

		& > span {
			display: block;
			margin-bottom: 8px;
		}
	}

	input[type='text'] {
		width: 100%;
		background-color: hsl(0deg 0% 3%);
		border: 1px solid hsl(0deg 0% 3%);
		border-radius: 3px;
		padding: 5px 10px;

		outline: none;
		caret-color: currentcolor;

		&:not(:read-only):is(:focus-within, :hover) {
			border-color: hsl(0deg 0% 34%);
		}
	}

	label > div {
		display: flex;
		gap: 8px;
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		text-wrap: nowrap;
		background-color: hsl(0deg 0% 33%);
		padding: 2px 8px;
		border-radius: 3px;
		cursor: pointer;

		&:is(:active) {
			background-color: hsl(0deg 0% 52%);
		}
	}

	div.Actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		height: 28px;
	}
</style>
