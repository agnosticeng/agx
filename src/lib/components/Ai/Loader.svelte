<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 24 }: Props = $props();
</script>

<svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
	<circle class="dot" cx="4" cy="12" r="3" />
	<circle class="dot dot_1" cx="12" cy="12" r="3" />
	<circle class="dot dot_2" cx="20" cy="12" r="3" />
</svg>

<style>
	svg > circle {
		animation: fade 0.8s linear infinite;
	}

	svg > circle:nth-child(2) {
		animation-delay: -0.65s;
	}

	svg > circle:nth-child(3) {
		animation-delay: -0.5s;
	}

	@keyframes fade {
		93.75%,
		100% {
			r: 3px;
		}
		46.875% {
			r: 0.2px;
		}
	}
</style>
