<!--
	PriceTag — the offer price, the original price slashed beside it, and the
	saving. Currency + locale come from the CMS site settings.
-->
<script lang="ts">
	import type { Price } from '$lib/types';
	import { site } from '$lib/data/catalog';
	import { discountPercent, formatPrice } from '$lib/utils/course';

	interface Props {
		price: Price;
		size?: 'sm' | 'md' | 'lg';
		/** show the "Launch offer · Save 62%" line */
		note?: boolean;
	}
	let { price, size = 'md', note = false }: Props = $props();

	const fmt = (n: number) => formatPrice(n, site.currency, site.locale);
	const off = $derived(discountPercent(price.original, price.offer));
</script>

<div class="price {size}">
	<p class="row">
		<span class="offer t-num"><span class="sr-only">Offer price </span>{fmt(price.offer)}</span>
		{#if off}
			<s class="was"><span class="sr-only">Original price </span>{fmt(price.original)}</s>
			{#if !note}<span class="off">−{off}%</span>{/if}
		{/if}
	</p>
	{#if note && off}
		<p class="note">
			<span class="off">Save {off}%</span>
			<span>You save {fmt(price.original - price.offer)}</span>
		</p>
	{/if}
</div>

<style>
	.price {
		display: grid;
		gap: 0.45rem;
		min-width: 0;
	}
	.row {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.2rem 0.55rem;
	}
	.offer {
		color: var(--ink);
		line-height: 1;
		letter-spacing: -0.01em;
	}
	.was {
		color: var(--text-muted);
		text-decoration-thickness: 1.5px;
		text-decoration-color: rgb(144 148 140 / 0.85);
	}
	.off {
		display: inline-flex;
		align-items: center;
		height: 1.45rem;
		padding: 0 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--green-100);
		color: var(--green-700);
		font-size: 0.72rem;
		font-weight: 600;
		white-space: nowrap;
		align-self: center;
	}
	.note {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.4rem 0.6rem;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.sm .offer {
		font-size: 1.15rem;
	}
	.sm .was {
		font-size: 0.82rem;
	}
	.md .offer {
		font-size: 1.6rem;
	}
	.md .was {
		font-size: 0.95rem;
	}
	.lg .offer {
		font-size: clamp(2.4rem, 4vw, 3.1rem);
	}
	.lg .was {
		font-size: 1.15rem;
	}
</style>
