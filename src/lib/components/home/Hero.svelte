<!--
	Home hero — the promise, the two actions every visitor needs (free demo,
	explore programs), proof in numbers, and a free-counselling form right there.
-->
<script lang="ts">
	import { Star, Check, BadgeCheck } from '@lucide/svelte';
	import Button from '../Button.svelte';
	import EnquiryForm from '../EnquiryForm.svelte';
	import { stats, site, money, mentorProof } from '$lib/data/catalog';
	import { modes } from '$lib/data/academy';
	import { reveal, countUp } from '$lib/motion/actions';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	const learnersK = Math.floor(stats.learners / 1000);
</script>

<section class="hero noise" use:reveal>
	<img class="lotus" src="/brand/academia-mark.png" alt="" width="512" height="512" aria-hidden="true" />

	<div class="container-x grid">
		<div class="copy">
			<p class="eyebrow" data-reveal>{site.tagline}</p>
			<h1 class="title" data-reveal>
				Learn the skills<br />companies <em class="italic-accent">hire for.</em>
			</h1>
			<p class="sub" data-reveal>
				Mentor-led programs in UI/UX design, front-end and full-stack development and AI — live online, in the
				classroom or both. Real projects, a certificate and career support until you’re job-ready. Programs from
				<strong class="from">{money(stats.fromPrice)}</strong>.
			</p>
			<div class="ctas" data-reveal>
				<Button size="lg" arrow magnetic onclick={() => enquiry.show({ kind: 'demo' })}>Book a free demo</Button>
				<Button href="/courses" variant="secondary" size="lg">Explore programs</Button>
			</div>
			<ul class="ticks" data-reveal>
				<li><Check size={15} strokeWidth={2.2} /> Live, instructor-led</li>
				<li><Check size={15} strokeWidth={2.2} /> Weekday & weekend batches</li>
				<li><Check size={15} strokeWidth={2.2} /> Easy EMI</li>
			</ul>
		</div>

		<aside class="card" data-reveal id="counselling">
			<div class="card-head">
				<p class="eyebrow">Free career counselling</p>
				<p class="card-title">Not sure which program fits you?</p>
				<p class="card-sub">Tell us your goal — a counsellor will call you back with the right path.</p>
			</div>
			<EnquiryForm kind="counselling" size="compact" uid="hero" />
			<p class="trust">
				{#if stats.hasRatings}
					<span class="stars" aria-hidden="true">
						{#each Array(5) as _, i (i)}<Star size={12} strokeWidth={0} fill="currentColor" />{/each}
					</span>
					<span><strong>{stats.rating.toFixed(1)}/5</strong> from {stats.reviews.toLocaleString(site.locale)} learner reviews</span>
				{:else}
					<span class="stars" aria-hidden="true"><BadgeCheck size={14} strokeWidth={2} /></span>
					<span>Taught by a front-end architect with <strong>{mentorProof.years}+ years</strong> in industry</span>
				{/if}
			</p>
		</aside>

		<dl class="stats" data-reveal>
			{#if stats.hasLearners}
				<div>
					<dt>Learners trained</dt>
					<dd class="t-num"><span use:countUp={{ to: learnersK, pad: 1 }}>0</span>k<small>+</small></dd>
				</div>
			{:else}
				<div>
					<dt>Years in industry</dt>
					<dd class="t-num"><span use:countUp={{ to: mentorProof.years }}>00</span><small>+</small></dd>
				</div>
			{/if}
			<div>
				<dt>Career programs</dt>
				<dd class="t-num"><span use:countUp={{ to: stats.programs }}>00</span></dd>
			</div>
			{#if stats.hasRatings}
				<div>
					<dt>Average rating</dt>
					<dd class="t-num">{stats.rating.toFixed(1)}<small>/5</small></dd>
				</div>
			{:else}
				<div>
					<dt>Programs from</dt>
					<dd class="t-num">{money(stats.fromPrice)}</dd>
				</div>
			{/if}
			<div>
				<dt>Ways to learn</dt>
				<dd class="modes">{modes.slice(0, 3).map((m) => m.title).join(' · ')}</dd>
			</div>
		</dl>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		padding: calc(var(--nav-height) + clamp(2.5rem, 6vw, 5rem)) 0 clamp(3rem, 6vw, 5rem);
		background:
			radial-gradient(ellipse 60% 70% at 85% 10%, rgb(123 189 95 / 0.16), transparent 65%),
			radial-gradient(ellipse 50% 60% at 0% 100%, rgb(243 239 231 / 0.9), transparent 70%),
			var(--background);
	}
	.lotus {
		position: absolute;
		right: -6rem;
		bottom: -7rem;
		width: clamp(22rem, 38vw, 34rem);
		height: auto;
		opacity: 0.07;
		pointer-events: none;
	}
	.grid {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: center;
	}
	.copy {
		display: grid;
		gap: 1.5rem;
		justify-items: start;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: clamp(2.9rem, 6.3vw, 6rem);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
	}
	.sub {
		max-width: 36rem;
		font-size: clamp(1.02rem, 1.4vw, 1.15rem);
		line-height: 1.65;
		color: var(--text-secondary);
	}
	.sub .from {
		color: var(--text-primary, var(--ink));
		font-weight: 600;
		white-space: nowrap;
	}
	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 0.25rem;
	}
	.ticks {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.4rem;
		font-size: 0.86rem;
		color: var(--text-secondary);
	}
	.ticks li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.ticks :global(svg) {
		color: var(--brand-primary);
	}

	.card {
		display: grid;
		gap: 1.4rem;
		padding: clamp(1.4rem, 3vw, 2rem);
		background: var(--surface);
		border-radius: var(--radius-xl);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.06),
			var(--shadow-elevated);
	}
	.card-head {
		display: grid;
		gap: 0.55rem;
	}
	.card-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 2.3vw, 1.9rem);
		line-height: 1.12;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.card-sub {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	.trust {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding-top: 1.1rem;
		border-top: 1px solid var(--border);
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.trust strong {
		color: var(--ink);
		font-weight: 600;
	}
	.stars {
		display: inline-flex;
		gap: 1px;
		color: var(--brand-primary);
	}

	.stats {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		margin: clamp(1rem, 3vw, 2.5rem) 0 0;
		border-top: 1px solid var(--border);
	}
	.stats div {
		padding: 1.4rem 1.25rem 0 0;
	}
	.stats div + div {
		padding-left: 1.25rem;
		border-left: 1px solid var(--border);
	}
	dt {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	dd {
		margin: 0.45rem 0 0;
		font-size: clamp(2rem, 3.4vw, 3rem);
		line-height: 1;
		color: var(--ink);
	}
	dd small {
		font-size: 0.5em;
		color: var(--brand-primary);
		margin-left: 0.05em;
	}
	dd.modes {
		font-family: var(--font-body);
		font-size: 0.98rem;
		line-height: 1.45;
		padding-top: 0.35rem;
	}

	@media (max-width: 960px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.stats div:nth-child(3) {
			padding-left: 0;
			border-left: 0;
		}
		.stats div:nth-child(n + 3) {
			margin-top: 1rem;
			border-top: 1px solid var(--border);
		}
	}
</style>
