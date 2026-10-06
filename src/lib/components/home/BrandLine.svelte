<!--
	BrandLine — the signature "Learn with SymphoZen" line (copy from the CMS).
	A slow editorial marquee in the display serif: solid and outlined lines
	alternate, the brand word in italic sage. Reduced motion → one still line.
-->
<script lang="ts">
	import { site } from '$lib/data/catalog';

	// "Learn with SymphoZen" → lead "Learn with", brand word "SymphoZen"
	const words = site.tagline.trim().split(/\s+/);
	const brand = words.length > 1 ? words.pop()! : '';
	const lead = words.join(' ');
	const REPEAT = 4;
</script>

{#snippet line(outline: boolean)}
	<span class="item" class:outline>
		{lead}{#if brand}&nbsp;<em>{brand}</em>{/if}
	</span>
	<img class="mark" src="/brand/sympholearn-mark.svg" alt="" width="239" height="216" aria-hidden="true" />
{/snippet}

<section class="brandline" aria-label={site.tagline}>
	<div class="track" aria-hidden="true">
		{#each [0, 1] as half (half)}
			<div class="run">
				{#each Array(REPEAT) as _, i (i)}
					{@render line(i % 2 === 1)}
				{/each}
			</div>
		{/each}
	</div>
	<p class="still" aria-hidden="true">{lead}{#if brand}&nbsp;<em>{brand}</em>{/if}</p>
	<div class="note container-x">
		<span class="rule" aria-hidden="true"></span>
		<p>{site.taglineNote}</p>
		<span class="rule" aria-hidden="true"></span>
	</div>
</section>

<style>
	.brandline {
		position: relative;
		padding: clamp(3rem, 7vw, 6rem) 0 clamp(2.5rem, 5vw, 4.5rem);
		overflow: hidden;
		border-block: 1px solid var(--border);
		background:
			radial-gradient(ellipse 60% 80% at 50% 50%, var(--green-50), transparent 70%),
			var(--background);
	}
	.track {
		display: flex;
		width: max-content;
		animation: marquee 48s linear infinite;
	}
	.brandline:hover .track {
		animation-play-state: paused;
	}
	.run {
		display: flex;
		align-items: center;
		flex: none;
	}
	.item {
		flex: none;
		padding: 0 clamp(1.25rem, 3vw, 2.75rem);
		font-family: var(--font-display);
		font-weight: 500;
		font-size: clamp(2.75rem, 7.5vw, 7rem);
		line-height: 1.15;
		letter-spacing: -0.025em;
		color: var(--ink);
		white-space: nowrap;
	}
	.item em {
		font-style: italic;
		color: var(--brand-primary);
	}
	.item.outline {
		color: transparent;
		-webkit-text-stroke: 1px rgb(23 25 22 / 0.35);
	}
	.item.outline em {
		color: transparent;
		-webkit-text-stroke-color: rgb(90 138 69 / 0.7);
	}
	.mark {
		flex: none;
		width: clamp(2rem, 4vw, 3.4rem);
		height: auto;
	}
	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}

	.still {
		display: none;
		text-align: center;
		font-family: var(--font-display);
		font-weight: 500;
		font-size: clamp(2.5rem, 7vw, 6rem);
		line-height: 1.1;
		letter-spacing: -0.025em;
		color: var(--ink);
		padding-inline: var(--gutter);
	}
	.still em {
		font-style: italic;
		color: var(--brand-primary);
	}

	.note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		margin-top: clamp(1.5rem, 3vw, 2.5rem);
	}
	.note p {
		max-width: 34rem;
		text-align: center;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}
	.rule {
		flex: 0 1 4rem;
		height: 1px;
		background: var(--border-strong);
	}

	@media (prefers-reduced-motion: reduce) {
		.track {
			display: none;
		}
		.still {
			display: block;
		}
	}
	@media (max-width: 560px) {
		.rule {
			display: none;
		}
	}
</style>
