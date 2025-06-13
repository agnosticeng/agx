<script lang="ts">
	interface Props {
		close?: () => void;
	}

	let { close }: Props = $props();
</script>

<div>
	<h2>Subscription</h2>
</div>

<style>
	h2 {
		margin: 0;
		padding: 3px 0 8px;
	}
</style>
