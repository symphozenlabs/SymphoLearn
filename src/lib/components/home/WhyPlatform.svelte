<script lang="ts">
	import { reveal, countUp } from '$lib/motion/actions';
	import Button from '../Button.svelte';

	const principles = [
		{
			title: 'Clarity',
			body: 'Every lesson has one purpose and ends with something you made. No filler, no padding, no forty-minute intros.'
		},
		{
			title: 'Continuity',
			body: 'Close the tab mid-sentence. When you return, the video, the lesson and your place in the course are waiting.'
		},
		{
			title: 'Craft',
			body: 'Courses are produced like products — scripted, edited and revised with learners, then maintained as tools change.'
		}
	];
</script>

<section class="why" use:reveal>
	<div class="container-x editorial-grid">
		<aside class="visual" data-reveal>
			<div class="panel">
				<p class="eyebrow">Learners, in numbers</p>
				<div class="stat">
					<span class="t-num big"><span use:countUp={{ to: 94 }}>00</span><small>%</small></span>
					<span class="cap">of learners who start a course complete its first section.</span>
				</div>
				<div class="rows">
					<div><span class="t-num"><span use:countUp={{ to: 12 }}>00</span>k</span><span>learners this year</span></div>
					<div><span class="t-num">4.8</span><span>average rating</span></div>
					<div><span class="t-num"><span use:countUp={{ to: 46 }}>00</span>s</span><span>to your first lesson</span></div>
				</div>
			</div>
		</aside>

		<div class="copy">
			<p class="eyebrow" data-reveal>Why SymphoLearn</p>
			<h2 class="t-h2" data-reveal>Built like a product,<br />not a <em class="italic-accent">playlist.</em></h2>
			<p class="t-body-lg lead" data-reveal>
				Most learning platforms are libraries. We designed a path — fewer, better courses, a calm
				interface and progress you can feel.
			</p>

			<ol class="principles">
				{#each principles as p, i (p.title)}
					<li data-reveal style="--i:{i}">
						<span class="t-num n">{String(i + 1).padStart(2, '0')}</span>
						<h3 class="t-h3">{p.title}</h3>
						<p>{p.body}</p>
					</li>
				{/each}
			</ol>

			<div data-reveal>
				<Button href="/courses" variant="secondary" arrow>Explore the catalog</Button>
			</div>
		</div>
	</div>
</section>

<style>
	.why {
		padding: var(--section-space) 0;
	}
	.visual {
		grid-column: 1 / span 5;
		position: sticky;
		top: calc(var(--nav-height) + 2rem);
		align-self: start;
	}
	.panel {
		position: relative;
		background: var(--green-100);
		color: var(--gray-950);
		border-radius: var(--radius-xl);
		padding: clamp(1.5rem, 3vw, 2.5rem);
		min-height: 34rem;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.panel .eyebrow {
		background: #fff;
	}
	.stat {
		margin: auto 0;
		padding: 3rem 0;
	}
	.big {
		display: flex;
		align-items: flex-start;
		font-size: clamp(5.5rem, 11vw, 9rem);
		line-height: 0.85;
		letter-spacing: -0.04em;
	}
	.big {
		color: var(--ink);
	}
	.big small {
		font-size: 0.35em;
		color: var(--brand-primary);
		margin-top: 0.15em;
	}
	.cap {
		display: block;
		max-width: 19rem;
		margin-top: 1.5rem;
		color: var(--green-700);
		font-size: 0.95rem;
	}
	.rows {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
	}
	.rows div {
		display: grid;
		gap: 0.25rem;
		padding: 0.9rem 1rem;
		border-radius: var(--radius-lg);
		background: #fff;
	}
	.rows .t-num {
		font-size: 1.6rem;
		color: var(--ink);
	}
	.rows div > span:last-child {
		font-size: 0.74rem;
		color: var(--text-secondary);
		line-height: 1.35;
	}

	.copy {
		grid-column: 7 / span 6;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-top: 2rem;
	}
	.lead {
		max-width: 31rem;
	}
	.principles {
		list-style: none;
		margin: 2rem 0 1.5rem;
		padding: 0;
	}
	.principles {
		display: grid;
		gap: 0.75rem;
	}
	.principles li {
		display: grid;
		grid-template-columns: 3rem 1fr;
		column-gap: 0.5rem;
		padding: 1.4rem 1.5rem;
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.06);
	}
	/* each principle steps further in */
	.principles li:nth-child(2) {
		margin-left: 8%;
	}
	.principles li:nth-child(3) {
		margin-left: 16%;
	}
	.n {
		grid-row: span 2;
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		background: var(--green-100);
		color: var(--green-700);
		font-size: 0.9rem;
	}
	.principles p {
		margin-top: 0.5rem;
		color: var(--text-secondary);
		max-width: 28rem;
	}

	@media (max-width: 960px) {
		.visual {
			position: relative;
			top: 0;
			grid-column: 1 / -1;
			order: 2;
			margin-top: 3rem;
		}
		.panel {
			min-height: 26rem;
		}
		.copy {
			grid-column: 1 / -1;
			padding-top: 0;
		}
		.principles li:nth-child(n) {
			margin-left: 0;
		}
	}
</style>
