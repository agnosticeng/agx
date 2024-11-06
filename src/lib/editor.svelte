<script lang="ts">
	import { Editor } from './editor';
	import { exec, type CHResponse } from './query';

	let { response = $bindable() }: { response: CHResponse } = $props();

	async function handleExec() {
		response = await exec(value);
		console.log(response);
	}

	let value = $state('');
</script>

<div>
	<Editor bind:value onExec={handleExec} />
</div>

<style>
	div {
		width: 100%;
		height: 50vh;
		padding: 2px;
		overflow: hidden;
	}
</style>
