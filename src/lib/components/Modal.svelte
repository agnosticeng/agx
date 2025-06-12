<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';

	let modal: HTMLDialogElement;

	interface Props {
		onclose?: HTMLDialogAttributes['onclose'];
		children?: Snippet;
	}

	let { children, onclose }: Props = $props();

	onMount(() => {
		if (modal.showModal) modal.showModal();
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLDialogElement) {
			if (e.key === 'Escape') e.target.close('dismiss');
		}
	}

	function handleClick(e: MouseEvent) {
		if (e.target instanceof HTMLDialogElement) {
			e.target.close('dismiss');
		}
	}

	function handleClose(e: Parameters<NonNullable<HTMLDialogAttributes['onclose']>>[0]) {
		e.currentTarget.addEventListener('animationend', () => onclose?.(e), { once: true });
	}

	export function close() {
		modal.close();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	class="modal"
	bind:this={modal}
	tabindex="-1"
	onclose={handleClose}
	onkeydown={handleKeydown}
	onclick={handleClick}
>
	{@render children?.()}
</dialog>

<style>
	dialog {
		display: block;
		inset: 0;
		margin-top: 0;
		overflow: hidden;
		transition: opacity 0.3s;
		animation: slide-out-up 0.3s cubic-bezier(0.25, 0, 0.3, 1) forwards;
		filter: drop-shadow(3px 5px 10px hsla(0deg 0% 0% / 10%));
		z-index: 2147483647;
		padding: 0;
		border: none;
		outline: 0;

		border-radius: 6px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;

		width: 100%;
		max-width: var(--modal-max-width, 420px);
	}

	dialog[open] {
		animation: slide-in-down 0.3s cubic-bezier(0.25, 0, 0.3, 1) forwards;
	}

	dialog:not([open]) {
		pointer-events: none;
		opacity: 0;
	}

	dialog::backdrop {
		backdrop-filter: grayscale(0.7) blur(3px);
	}

	@keyframes slide-out-up {
		to {
			transform: translateY(-100%);
		}
	}

	@keyframes slide-in-down {
		from {
			transform: translateY(-100%);
		}
	}
</style>
