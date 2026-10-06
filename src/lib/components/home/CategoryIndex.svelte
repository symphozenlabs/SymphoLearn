<!--
	Disciplines as a bento of tiles. Each tile borrows its first course's cover
	and reveals the discipline's description on hover / focus.
-->
<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { categories, courses } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';

	const tiles = categories.map((c) => {
		const list = courses.filter((x) => x.category === c.id);
		return { ...c, count: list.length, cover: list[0]?.thumbnail ?? '', tone: list[0]?.tone ?? 'paper' };
	});
</script>

<section class="cats" id="categories" use:reveal>
	<div class="container-x">
		<header class="head">
			<p class="eyebrow" data-reveal>Disciplines</p>
			<h2 class="t-h2" data-reveal>Seven disciplines.<br /><em class="italic-accent">One</em> way of learning.</h2>
		</header>

		<ul class="bento">
			{#each tiles as t, i (t.id)}
				<li class="t{i}" data-reveal>
					<a href="/courses?category={t.id}" class="tile tone-{t.tone}">
						<img src={t.cover} alt="" loading="lazy" width="1600" height="1000" />
						<span class="shade" aria-hidden="true"></span>
						<span class="count">{t.count} {t.count === 1 ? 'course' : 'courses'}</span>
						<span class="text">
							<span class="name">{t.name}</span>
							<span class="desc">{t.description}</span>
						</span>
						<span class="go" aria-hidden="true"><ArrowRight size={16} strokeWidth={1.8} /></span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.cats {
		padding: var(--section-space) 0;
	}
	.head {
		display: grid;
		gap: 1.25rem;
		justify-items: end;
		text-align: right;
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
	}

	.bento {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: clamp(11rem, 16vw, 14rem);
		gap: clamp(0.75rem, 1.5vw, 1.1rem);
	}
	.t0 {
		grid-column: span 2;
		grid-row: span 2;
	}
	.t5,
	.t6 {
		grid-column: span 2;
	}

	.tile {
		position: relative;
		display: block;
		height: 100%;
		overflow: hidden;
		border-radius: var(--radius-xl);
		background: var(--surface-soft);
		color: #fff;
		isolation: isolate;
		transition:
			transform var(--duration-slow) var(--ease-out),
			box-shadow var(--duration-slow) var(--ease-out);
	}
	.tile:hover,
	.tile:focus-visible {
		transform: translateY(-4px);
		box-shadow: var(--shadow-elevated);
	}
	.tile img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: -2;
		transition: transform 1.4s var(--ease-out);
	}
	.tile:hover img {
		transform: scale(1.07);
	}
	.shade {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(to top, rgb(23 25 22 / 0.85) 0%, rgb(23 25 22 / 0.3) 50%, rgb(23 25 22 / 0) 85%);
		transition: opacity var(--duration-slow) var(--ease-out);
	}
	.count {
		position: absolute;
		top: 0.9rem;
		left: 0.9rem;
		height: 1.75rem;
		display: inline-flex;
		align-items: center;
		padding: 0 0.7rem;
		border-radius: var(--radius-pill);
		background: rgb(252 252 250 / 0.88);
		backdrop-filter: blur(8px);
		color: var(--ink);
		font-size: 0.74rem;
		font-weight: 500;
	}
	.text {
		position: absolute;
		left: 1.1rem;
		right: 4.25rem;
		bottom: 1rem;
		display: grid;
		gap: 0.25rem;
	}
	.name {
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2vw, 1.75rem);
		line-height: 1.1;
	}
	.t0 .name {
		font-size: clamp(1.8rem, 3.4vw, 3rem);
	}
	.desc {
		font-size: 0.84rem;
		color: rgb(255 255 255 / 0.8);
		max-height: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			max-height var(--duration-slow) var(--ease-out),
			opacity var(--duration-normal) var(--ease-out);
	}
	.tile:hover .desc,
	.tile:focus-visible .desc {
		max-height: 3rem;
		opacity: 1;
	}
	.t0 .desc {
		max-height: 3rem;
		opacity: 1;
	}
	.go {
		position: absolute;
		right: 0.9rem;
		bottom: 0.9rem;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: #fff;
		color: var(--ink);
		transform: rotate(-45deg);
		transition:
			transform var(--duration-slow) var(--ease-out),
			background var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out);
	}
	.tile:hover .go,
	.tile:focus-visible .go {
		transform: rotate(0);
		background: var(--brand-primary);
		color: #fff;
	}

	@media (max-width: 860px) {
		.head {
			justify-items: start;
			text-align: left;
		}
		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-auto-rows: 10.5rem;
		}
		.t0 {
			grid-column: 1 / -1;
			grid-row: span 2;
		}
		.t5,
		.t6 {
			grid-column: span 1;
		}
		.t6 {
			grid-column: 1 / -1;
		}
		.desc {
			display: none;
		}
		li:not(.t0) .name {
			font-size: 1.15rem;
		}
		li:not(.t0) .text {
			left: 0.85rem;
			right: 3rem;
			bottom: 0.85rem;
		}
		li:not(.t0) .go {
			width: 2rem;
			height: 2rem;
			right: 0.7rem;
			bottom: 0.7rem;
		}
	}
</style>
