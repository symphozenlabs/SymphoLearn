<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import TrainingModes from '$lib/components/home/TrainingModes.svelte';
	import Journey from '$lib/components/home/Journey.svelte';
	import { BRAND } from '$lib/data/site';
	import { site, stats, mentorProof } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	const values = [
		{ title: 'Proof over paperwork', body: 'Every program ends in work you can show — a capstone, a portfolio, a story for your interview.' },
		{ title: 'Practitioners teach', body: 'Mentors who build, design and analyse for a living, and bring this week’s problems into class.' },
		{ title: 'Calm, focused learning', body: 'Small batches, clear plans and steady feedback — progress you can feel every week.' },
		{ title: 'With you after class', body: 'Recordings, doubt support and career help that continue until you are ready for interviews.' }
	];
</script>

<svelte:head>
	<title>About — {BRAND}</title>
	<meta name="description" content="{BRAND} is the training academy of SymphoZen Labs: mentor-led, project-first career programs. {site.tagline}." />
</svelte:head>

<section class="intro container-x editorial-grid" use:reveal>
	<p class="eyebrow k" data-reveal>About {BRAND}</p>
	<h1 class="t-h1" data-reveal>Beyond classrooms.<br />Into <em class="italic-accent">possibilities.</em></h1>
	<div class="lead" data-reveal>
		<p>
			{BRAND} is the training academy of SymphoZen Labs. We teach the skills we use every day — building
			software, working with data and AI, designing products and growing brands — to people who want to do that
			work too.
		</p>
		<p>
			Our programs are taught live by practitioners, built around real projects and followed by career support,
			because a certificate opens a door but a portfolio walks you through it.
		</p>
	</div>
</section>

<section class="numbers container-x" use:reveal>
	<dl>
		{#if stats.hasLearners}
			<div data-reveal><dt>Learners trained</dt><dd class="t-num">{stats.learnersLabel}</dd></div>
		{:else}
			<div data-reveal><dt>Years in industry</dt><dd class="t-num">{mentorProof.years}<small>+</small></dd></div>
		{/if}
		<div data-reveal><dt>Career programs</dt><dd class="t-num">{stats.programs}</dd></div>
		<div data-reveal><dt>Disciplines</dt><dd class="t-num">{stats.disciplines}</dd></div>
		{#if stats.hasRatings}
			<div data-reveal><dt>Average rating</dt><dd class="t-num">{stats.rating.toFixed(1)}<small>/5</small></dd></div>
		{:else}
			<div data-reveal><dt>Guest lectures</dt><dd class="t-num">{mentorProof.lectures}<small>+</small></dd></div>
		{/if}
	</dl>
</section>

<section class="mv container-x" use:reveal>
	<div class="card" data-reveal>
		<p class="eyebrow">Our mission</p>
		<p class="mv-t">Make career-ready skills accessible — taught by people who use them, measured by what learners can build.</p>
	</div>
	<div class="card dark" data-reveal>
		<p class="eyebrow on-dark">Our vision</p>
		<p class="mv-t">A generation of professionals who learned by doing, and keep learning long after the classroom.</p>
	</div>
</section>

<section class="values container-x" use:reveal>
	<header class="v-head">
		<p class="eyebrow" data-reveal>What we believe</p>
		<h2 class="t-h2" data-reveal>How we <em class="italic-accent">teach.</em></h2>
	</header>
	<ol>
		{#each values as v, i (v.title)}
			<li data-reveal>
				<span class="t-num n">{String(i + 1).padStart(2, '0')}</span>
				<h3 class="t-h3">{v.title}</h3>
				<p>{v.body}</p>
			</li>
		{/each}
	</ol>
</section>

<TrainingModes />
<Journey />

<section class="end container-x" use:reveal>
	<h2 class="t-h2" data-reveal>Come and see a class.</h2>
	<div class="btns" data-reveal>
		<Button size="lg" arrow magnetic onclick={() => enquiry.show({ kind: 'demo' })}>Book a free demo</Button>
		<Button size="lg" href="/courses" variant="secondary">Explore programs</Button>
	</div>
</section>

<style>
	.intro {
		padding-top: calc(var(--nav-height) + clamp(3rem, 8vw, 6.5rem));
		padding-bottom: clamp(3rem, 6vw, 5rem);
		row-gap: 1.75rem;
	}
	.k {
		grid-column: 1 / -1;
	}
	.intro h1 {
		grid-column: 1 / span 8;
		font-size: clamp(2.8rem, 6.5vw, 6rem);
	}
	.lead {
		grid-column: 7 / span 6;
		display: grid;
		gap: 1rem;
		margin-top: 1rem;
		font-size: var(--fs-body-lg);
		color: var(--text-secondary);
	}
	.numbers dl {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		margin: 0;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.numbers div {
		padding: 1.75rem 1.25rem;
	}
	.numbers div + div {
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
		margin: 0.5rem 0 0;
		font-size: clamp(2.4rem, 4.5vw, 3.75rem);
		line-height: 1;
		color: var(--ink);
	}
	dd small {
		font-size: 0.45em;
		color: var(--brand-primary);
	}
	.mv {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
		padding-top: var(--section-space);
	}
	.card {
		display: grid;
		gap: 1.25rem;
		align-content: start;
		padding: clamp(1.75rem, 4vw, 3rem);
		border-radius: var(--radius-xl);
		background: var(--green-100);
	}
	.card.dark {
		background: var(--ink);
	}
	.mv-t {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 2.6vw, 2.2rem);
		line-height: 1.25;
		color: var(--ink);
	}
	.dark .mv-t {
		color: #fff;
	}
	.values {
		padding-top: var(--section-space);
	}
	.v-head {
		display: grid;
		gap: 1.25rem;
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.values ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1.5rem;
	}
	.values li {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		padding-top: 1.25rem;
		border-top: 1px solid var(--ink);
	}
	.n {
		color: var(--brand-primary);
	}
	.values p {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}
	.end {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding-top: clamp(3rem, 6vw, 5rem);
		padding-bottom: var(--section-space);
		border-top: 1px solid var(--border);
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	@media (max-width: 960px) {
		.intro h1,
		.lead {
			grid-column: 1 / -1;
		}
		.numbers dl {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.numbers div:nth-child(3) {
			border-left: 0;
		}
		.numbers div:nth-child(n + 3) {
			border-top: 1px solid var(--border);
		}
		.mv {
			grid-template-columns: minmax(0, 1fr);
		}
		.values ol {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 560px) {
		.values ol {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
