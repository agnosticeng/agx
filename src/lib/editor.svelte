<script lang="ts">
	import { exec, type CHResponse } from './query';

	let { response = $bindable() }: { response: CHResponse } = $props();

	async function handleKeyDown(event: KeyboardEvent) {
		if (!(event.currentTarget instanceof HTMLTextAreaElement)) return;
		if (!event.currentTarget.value) return;
		if (event.code === 'Enter' && event.metaKey) {
			response = await exec(event.currentTarget.value);
			console.log(response);
		}
	}
</script>

<textarea
	id="greet-input"
	placeholder="Enter a query..."
	onkeydown={handleKeyDown}
	autocapitalize="off"
	autocomplete="off"
	spellcheck="false"
></textarea>

<style>
	textarea {
		display: block;
		width: 100%;
		font-family: monospace;
		height: 50vh;
		background: black;
		border: none;
		resize: none;
		padding: 2px;
		color: white;
		outline: none;
		border: none;
	}
</style>
