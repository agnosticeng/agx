<script lang="ts">
	import { login } from '$lib/auth';
	import Sparkles from '$lib/icons/Sparkles.svelte';
</script>

<div class="login-wrapper">
	<Sparkles size="48" />
	<p>
		Log in to start generating SQL with Agnostic AI. Ask questions, get queries, and explore your
		data faster than ever.
	</p>
	<button type="button" onclick={() => login()}>Login</button>
</div>

<style>
	div {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 24px;
		padding: 0 32px;
	}

	div > p {
		margin: 0;
		text-align: center;
		font-size: 14px;
		line-height: 24px;
	}

	div > button {
		background-color: hsl(0deg 0% 90%);
		color: hsl(0deg 0% 27%);
		padding: 4px 6px;
		border-radius: 3px;
		font-size: 12px;

		&:hover {
			background-color: hsl(0deg 0% 86%);
			color: hsl(0deg 0% 14%);
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		font-size: 10px;
		font-weight: 500;

		&:is(:hover, :focus-within):not(:disabled) {
			cursor: pointer;
		}
	}
</style>
