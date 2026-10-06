<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ArrowRight } from '@lucide/svelte';
	import { magnetic as magneticAction } from '$lib/motion/actions';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'brand';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		href?: string;
		variant?: Variant;
		size?: 'sm' | 'md' | 'lg';
		arrow?: boolean;
		magnetic?: boolean;
		full?: boolean;
		children: Snippet;
		icon?: Snippet;
	}

	let {
		href,
		variant = 'primary',
		size = 'md',
		arrow = false,
		magnetic = false,
		full = false,
		children,
		icon,
		class: className = '',
		...rest
	}: Props = $props();

	const noop = () => {};
	const mag = (node: HTMLElement) => (magnetic ? magneticAction(node, 0.18) : { destroy: noop });
</script>

{#snippet inner()}
	{#if icon}<span class="ico">{@render icon()}</span>{/if}
	<span class="label">{@render children()}</span>
	{#if arrow}
		<span class="arrow" aria-hidden="true">
			<ArrowRight size={16} strokeWidth={1.75} />
			<ArrowRight size={16} strokeWidth={1.75} />
		</span>
	{/if}
{/snippet}

{#if href}
	<a {href} class="btn {variant} {size} {className}" class:full use:mag>
		{@render inner()}
	</a>
{:else}
	<button type="button" class="btn {variant} {size} {className}" class:full use:mag {...rest}>
		{@render inner()}
	</button>
{/if}

<style>
	/* SymphoZen buttons: brand green, near-square corners, 650 weight */
	.btn {
		--btn-bg: var(--brand-primary);
		--btn-fg: #fff;
		--btn-bg-hover: var(--brand-primary-hover);
		--btn-border: transparent;
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		height: 3.25rem;
		padding: 0 1.4rem;
		border: 1px solid var(--btn-border);
		border-radius: var(--button-radius);
		background: var(--btn-bg);
		color: var(--btn-fg);
		font-size: 0.82rem;
		font-weight: 650;
		letter-spacing: 0;
		white-space: nowrap;
		isolation: isolate;
		overflow: hidden;
		transition:
			color var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}
	/* fill sweeps up from the baseline on hover */
	.btn::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--btn-bg-hover);
		transform: translateY(101%);
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.btn:hover::before {
		transform: translateY(0);
	}
	.btn:active {
		transform: scale(0.98);
	}
	.btn:disabled {
		opacity: 0.45;
		pointer-events: none;
	}

	.secondary {
		--btn-bg: transparent;
		--btn-fg: var(--text-primary);
		--btn-border: var(--border);
		--btn-bg-hover: var(--ink);
	}
	.secondary:hover {
		--btn-fg: #fff;
		--btn-border: var(--ink);
	}
	.ghost {
		--btn-bg: transparent;
		--btn-fg: var(--text-primary);
		--btn-bg-hover: var(--surface-soft);
		padding-inline: 0.9rem;
	}
	.inverse {
		--btn-bg: #fff;
		--btn-fg: var(--ink);
		--btn-bg-hover: var(--green-300);
	}
	.brand {
		--btn-bg: var(--brand-primary);
		--btn-bg-hover: var(--brand-primary-hover);
	}

	.sm {
		height: 2.6rem;
		padding: 0 1rem;
		font-size: 0.78rem;
	}
	.lg {
		height: 3.5rem;
		padding: 0 1.75rem;
		font-size: 0.88rem;
	}
	.full {
		width: 100%;
	}

	.ico {
		display: inline-flex;
	}

	/* two arrows: the first slides out as the second slides in */
	.arrow {
		position: relative;
		display: inline-flex;
		width: 16px;
		height: 16px;
		overflow: hidden;
	}
	.arrow :global(svg) {
		position: absolute;
		inset: 0;
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.arrow :global(svg:last-child) {
		transform: translateX(-120%);
	}
	.btn:hover .arrow :global(svg:first-child) {
		transform: translateX(120%);
	}
	.btn:hover .arrow :global(svg:last-child) {
		transform: translateX(0);
	}
</style>
