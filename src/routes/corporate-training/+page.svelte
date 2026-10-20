<script lang="ts">
	import { Check, Users, GraduationCap, PencilRuler, Zap } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';
	import CategoryIndex from '$lib/components/home/CategoryIndex.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import { corporateOfferings, corporateSteps } from '$lib/data/academy';
	import { BRAND } from '$lib/data/site';
	import { reveal } from '$lib/motion/actions';

	const icons = [Users, GraduationCap, PencilRuler, Zap];

	const benefits = [
		'Curriculum mapped to your roles, stack and goals',
		'Practitioner mentors with real-world projects',
		'On-site at your office or campus, or live online',
		'Assessments and an outcome report for every cohort',
		'Flexible schedules around your team’s workload',
		'Certificates for every participant'
	];

	const corpFaqs = [
		{
			q: 'Can you build a program around our own tools and stack?',
			a: 'Yes. We start with a discovery call, then design the curriculum around your tools, workflows and case studies, and review it with you before delivery begins.'
		},
		{
			q: 'Do you train on-site?',
			a: 'Yes — at your office or campus, live online, or a blend of the two. We can also run multi-city cohorts online with in-person workshops.'
		},
		{
			q: 'What is the minimum batch size?',
			a: 'We run programs for teams of any size, from a single focused workshop for a small team to multi-cohort academies for hundreds of people.'
		},
		{
			q: 'How do you measure outcomes?',
			a: 'Each cohort includes pre- and post-assessments, project reviews and a summary report for managers, so you can see what changed.'
		}
	];
</script>

<svelte:head>
	<title>Corporate & campus training — {BRAND}</title>
	<meta name="description" content="Custom training programs, workshops and bootcamps for companies and colleges — on-site or online, led by practitioner mentors from {BRAND}." />
</svelte:head>

<section class="hero container-x" use:reveal>
	<div class="copy">
		<p class="eyebrow" data-reveal>Corporate & campus training</p>
		<h1 class="t-h1" data-reveal>Upskill your teams.<br /><em class="italic-accent">At scale.</em></h1>
		<p class="lead" data-reveal>
			Custom programs, workshops and bootcamps for companies and colleges — designed around your goals and
			delivered by practitioner mentors, on-site or online.
		</p>
		<ul class="benefits" data-reveal>
			{#each benefits as b (b)}<li><Check size={15} strokeWidth={2.2} /> {b}</li>{/each}
		</ul>
	</div>
	<aside class="card" data-reveal id="proposal">
		<p class="eyebrow">Request a proposal</p>
		<p class="card-t">Tell us about your team.</p>
		<EnquiryForm kind="corporate" uid="corp" />
	</aside>
</section>

<section class="offer container-x" use:reveal>
	<header class="head">
		<p class="eyebrow" data-reveal>What we offer</p>
		<h2 class="t-h2" data-reveal>Training that fits<br />how you <em class="italic-accent">work.</em></h2>
	</header>
	<ul class="grid">
		{#each corporateOfferings as o, i (o.title)}
			{@const Icon = icons[i % icons.length]}
			<li data-reveal>
				<span class="ico"><Icon size={20} strokeWidth={1.6} /></span>
				<h3 class="t-h3">{o.title}</h3>
				<p>{o.body}</p>
			</li>
		{/each}
	</ul>
</section>

<section class="how" use:reveal>
	<div class="container-x">
		<header class="head">
			<p class="eyebrow on-dark" data-reveal>How it works</p>
			<h2 class="t-h2" data-reveal>From brief to <em>results.</em></h2>
		</header>
		<ol>
			{#each corporateSteps as s, i (s.title)}
				<li data-reveal>
					<span class="t-num n">{String(i + 1).padStart(2, '0')}</span>
					<h3 class="t-h3">{s.title}</h3>
					<p>{s.body}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<CategoryIndex />

<section class="faq container-x" use:reveal>
	<div class="f-head">
		<p class="eyebrow" data-reveal>Questions</p>
		<h2 class="t-h2" data-reveal>For teams & <em class="italic-accent">campuses.</em></h2>
		<div data-reveal><Button href="#proposal" arrow>Request a proposal</Button></div>
	</div>
	<div data-reveal><Faq items={corpFaqs} /></div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: start;
		padding-top: calc(var(--nav-height) + clamp(2.5rem, 6vw, 5rem));
		padding-bottom: var(--section-space);
	}
	.copy {
		display: grid;
		gap: 1.5rem;
		padding-top: 1rem;
	}
	.copy h1 {
		font-size: clamp(2.8rem, 6vw, 5.5rem);
	}
	.lead {
		font-size: var(--fs-body-lg);
		color: var(--text-secondary);
		max-width: 34rem;
	}
	.benefits {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem 1.5rem;
		font-size: 0.92rem;
	}
	.benefits li {
		display: flex;
		gap: 0.55rem;
		align-items: flex-start;
	}
	.benefits :global(svg) {
		flex: none;
		margin-top: 0.25rem;
		color: var(--brand-primary);
	}
	.card {
		display: grid;
		gap: 1rem;
		padding: clamp(1.5rem, 3vw, 2.25rem);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.06),
			var(--shadow-elevated);
		scroll-margin-top: calc(var(--bar-height) + 1.5rem);
	}
	.card-t {
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 2.4vw, 2rem);
		line-height: 1.1;
		color: var(--ink);
		margin-bottom: 0.5rem;
	}

	.head {
		display: grid;
		gap: 1.25rem;
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.offer {
		padding-bottom: var(--section-space);
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}
	.grid li {
		display: grid;
		gap: 0.8rem;
		align-content: start;
		padding: clamp(1.4rem, 2.5vw, 1.9rem);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.06);
	}
	.ico {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		margin-bottom: 0.4rem;
		border-radius: var(--radius-md);
		background: var(--green-100);
		color: var(--green-700);
	}
	.grid p {
		font-size: 0.92rem;
		color: var(--text-secondary);
	}

	.how {
		padding: var(--section-space) 0;
		background: var(--ink);
		color: var(--text-inverse-muted);
	}
	.how .t-h2 {
		color: #fff;
	}
	.how .t-h2 em {
		color: var(--green-400);
	}
	.how ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1.5rem;
	}
	.how li {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border-inverse);
	}
	.how .n {
		color: var(--green-400);
	}
	.how .t-h3 {
		color: #fff;
	}

	.faq {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
		gap: clamp(2rem, 5vw, 5rem);
		padding-top: var(--section-space);
		padding-bottom: var(--section-space);
		border-top: 1px solid var(--border);
	}
	.f-head {
		display: grid;
		gap: 1.25rem;
		align-content: start;
	}

	@media (max-width: 1100px) {
		.grid,
		.how ol {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 900px) {
		.hero,
		.faq {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 560px) {
		.grid,
		.how ol,
		.benefits {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
