<script lang="ts">
	import { Star } from '@lucide/svelte';
	import Avatar from '../Avatar.svelte';
	import { courses, stats } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';

	const reviews = courses
		.flatMap((c) => c.reviews.map((r) => ({ ...r, course: c })))
		.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date))
		.slice(0, 6);
</script>

{#if reviews.length}
	<section class="tst" use:reveal>
		<div class="container-x">
			<header class="head">
				<p class="eyebrow" data-reveal>What our learners say</p>
				<h2 class="t-h2" data-reveal>Results that speak<br />for <em class="italic-accent">themselves.</em></h2>
				<p class="score" data-reveal><span class="t-num">{stats.rating.toFixed(1)}</span> / 5 average across {stats.reviews.toLocaleString()} reviews</p>
			</header>

			<div class="grid">
				{#each reviews as r, i (r.course.id + r.id)}
					<figure class="review" class:lead={i === 0} data-reveal>
						<div class="stars" aria-label="{r.rating} out of 5 stars">
							{#each Array(5) as _, k (k)}
								<Star size={14} strokeWidth={0} fill={k < r.rating ? 'currentColor' : 'var(--border-strong)'} />
							{/each}
						</div>
						<blockquote>“{r.body}”</blockquote>
						<figcaption>
							<Avatar person={{ name: r.author, avatar: '' }} size={36} />
							<span>
								<strong>{r.author}</strong>
								{r.role} · <a href="/courses/{r.course.id}">{r.course.title}</a>
							</span>
						</figcaption>
					</figure>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.tst {
		padding: var(--section-space) 0;
		border-top: 1px solid var(--border);
	}
	.head {
		display: grid;
		gap: 1.25rem;
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.score {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	.score .t-num {
		font-size: 1.6rem;
		color: var(--ink);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.25rem;
	}
	.review {
		margin: 0;
		padding: clamp(1.4rem, 2.5vw, 2rem);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.06);
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.review.lead {
		background: var(--green-100);
		box-shadow: none;
	}
	.review.lead blockquote {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 1.8vw, 1.5rem);
		line-height: 1.35;
		color: var(--ink);
	}
	.stars {
		display: flex;
		gap: 2px;
		color: var(--brand-primary);
	}
	blockquote {
		margin: 0;
		font-size: 0.98rem;
		line-height: 1.6;
	}
	figcaption {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: auto;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	figcaption span {
		display: grid;
	}
	figcaption strong {
		font-weight: 600;
		color: var(--ink);
		font-size: 0.9rem;
	}
	figcaption a {
		color: var(--brand-primary);
	}
	figcaption a:hover {
		text-decoration: underline;
	}
	@media (max-width: 900px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
