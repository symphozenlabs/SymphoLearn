<!--
	FAQ — native <details> accordion (works without JS, searchable with Ctrl F).
-->
<script lang="ts">
	import { Plus } from '@lucide/svelte';

	interface Props {
		items: { q: string; a: string }[];
	}
	let { items }: Props = $props();
</script>

<div class="faq">
	{#each items as item, i (item.q)}
		<details open={i === 0}>
			<summary>
				<span>{item.q}</span>
				<span class="pm" aria-hidden="true"><Plus size={16} strokeWidth={1.8} /></span>
			</summary>
			<p>{item.a}</p>
		</details>
	{/each}
</div>

<style>
	.faq {
		border-top: 1px solid var(--border);
	}
	details {
		border-bottom: 1px solid var(--border);
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1.3rem 0;
		cursor: pointer;
		list-style: none;
		font-size: clamp(1rem, 1.4vw, 1.12rem);
		font-weight: 500;
		color: var(--ink);
		transition: color var(--duration-normal);
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary:hover {
		color: var(--brand-primary);
	}
	.pm {
		flex: none;
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		border: 1px solid var(--border);
		transition:
			transform var(--duration-slow) var(--ease-out),
			background var(--duration-normal),
			color var(--duration-normal);
	}
	details[open] .pm {
		transform: rotate(45deg);
		background: var(--brand-primary);
		border-color: var(--brand-primary);
		color: #fff;
	}
	details p {
		max-width: 44rem;
		padding: 0 3.5rem 1.4rem 0;
		color: var(--text-secondary);
		animation: open var(--duration-slow) var(--ease-out);
	}
	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
</style>
