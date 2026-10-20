<script lang="ts">
	import { Monitor, School, Shuffle, Building2, Check, CalendarDays } from '@lucide/svelte';
	import { modes, batches } from '$lib/data/academy';
	import { reveal } from '$lib/motion/actions';

	const icons = { online: Monitor, classroom: School, hybrid: Shuffle, corporate: Building2 };
</script>

<section class="modes" id="modes" use:reveal>
	<div class="container-x">
		<header class="head editorial-grid">
			<p class="eyebrow" data-reveal>Modes of training</p>
			<h2 class="t-h2" data-reveal>Learn the way your<br />week <em class="italic-accent">works.</em></h2>
			<p class="aside" data-reveal>
				Same mentors, same projects, same certificate — choose the format that fits, and switch if your schedule
				changes.
			</p>
		</header>

		<ul class="grid">
			{#each modes as m, i (m.id)}
				{@const Icon = icons[m.id]}
				<li class="mode" data-reveal style="--i:{i}">
					<span class="num t-num">{String(i + 1).padStart(2, '0')}</span>
					<span class="ico"><Icon size={22} strokeWidth={1.5} /></span>
					<h3 class="t-h3">{m.title}</h3>
					<p>{m.lead}</p>
					<ul class="pts">
						{#each m.points as p (p)}<li><Check size={14} strokeWidth={2.2} /> {p}</li>{/each}
					</ul>
				</li>
			{/each}
		</ul>

		<div class="batches" data-reveal>
			<p class="b-k"><CalendarDays size={16} strokeWidth={1.6} /> Batch options</p>
			{#each batches as b (b.title)}
				<div class="b">
					<strong>{b.title}</strong>
					<span>{b.when} · {b.time}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.modes {
		padding: var(--section-space) 0;
		background: var(--surface-soft);
	}
	.head {
		align-items: end;
		row-gap: 1.25rem;
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.head .eyebrow {
		grid-column: 1 / -1;
	}
	.head h2 {
		grid-column: 1 / span 7;
	}
	.aside {
		grid-column: 9 / span 4;
		color: var(--text-secondary);
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}
	.mode {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: clamp(1.4rem, 2.5vw, 1.9rem);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.06);
		transition:
			transform var(--duration-slow) var(--ease-out),
			box-shadow var(--duration-slow) var(--ease-out);
	}
	.mode:hover {
		transform: translateY(-4px);
		box-shadow:
			0 0 0 1px rgb(90 138 69 / 0.25),
			var(--shadow-soft);
	}
	.num {
		position: absolute;
		top: 1.4rem;
		right: 1.5rem;
		font-size: 0.9rem;
		color: var(--text-muted);
	}
	.ico {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		margin-bottom: 0.5rem;
		border-radius: var(--radius-md);
		background: var(--green-100);
		color: var(--green-700);
	}
	.mode > p {
		font-size: 0.92rem;
		color: var(--text-secondary);
	}
	.pts {
		list-style: none;
		margin: auto 0 0;
		padding: 1rem 0 0;
		border-top: 1px solid var(--border);
		display: grid;
		gap: 0.45rem;
		font-size: 0.84rem;
	}
	.pts li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.pts :global(svg) {
		color: var(--brand-primary);
		flex: none;
	}

	.batches {
		display: grid;
		grid-template-columns: auto repeat(3, minmax(0, 1fr));
		align-items: center;
		gap: 1rem 2rem;
		margin-top: 1rem;
		padding: 1.25rem clamp(1.4rem, 2.5vw, 1.9rem);
		border-radius: var(--radius-xl);
		background: var(--ink);
		color: var(--text-inverse-muted);
	}
	.b-k {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.66rem;
		font-weight: 650;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--green-400);
	}
	.b {
		display: grid;
		gap: 0.15rem;
		font-size: 0.84rem;
	}
	.b strong {
		color: #fff;
		font-weight: 600;
		font-size: 0.95rem;
	}

	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 860px) {
		.head h2,
		.aside {
			grid-column: 1 / -1;
		}
		.batches {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 560px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
