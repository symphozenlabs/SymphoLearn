<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import Hero from '$lib/components/home/Hero.svelte';
	import JourneyStory from '$lib/components/home/JourneyStory.svelte';
	import BrandLine from '$lib/components/home/BrandLine.svelte';
	import Audiences from '$lib/components/home/Audiences.svelte';
	import CourseGrid from '$lib/components/CourseGrid.svelte';
	import CategoryIndex from '$lib/components/home/CategoryIndex.svelte';
	import WhyAcademy from '$lib/components/home/WhyAcademy.svelte';
	import TrainingModes from '$lib/components/home/TrainingModes.svelte';
	import Journey from '$lib/components/home/Journey.svelte';
	import Testimonials from '$lib/components/home/Testimonials.svelte';
	import CorporateBand from '$lib/components/home/CorporateBand.svelte';
	import ContactSection from '$lib/components/home/ContactSection.svelte';
	import { BRAND } from '$lib/data/site';
	import { site } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';

	let { data } = $props();
</script>

<svelte:head>
	<title>{BRAND} — {site.tagline}</title>
	<meta name="description" content="{BRAND}: mentor-led career programs in UI/UX design, front-end and full-stack development and AI — live online, classroom and hybrid, with projects, certification and career support. Book a free demo." />
</svelte:head>

<Hero />
<JourneyStory />
<BrandLine />
<Audiences />

<section class="featured" use:reveal>
	<div class="container-x">
		<header class="head editorial-grid">
			<p class="eyebrow" data-reveal>Popular programs</p>
			<h2 class="t-h2" data-reveal>Programs built for<br />the <em class="italic-accent">job market.</em></h2>
			<div class="aside" data-reveal>
				<p>Each program is taught live by practitioners and ends with a capstone project you can show in interviews.</p>
				<a href="/courses" class="more">All programs & fees <ArrowRight size={15} strokeWidth={1.6} /></a>
			</div>
		</header>

		<CourseGrid courses={data.featured} layout="featured" />
	</div>
</section>

<CategoryIndex />
<WhyAcademy />
<TrainingModes />
<Journey />
<Testimonials />
<CorporateBand />
<ContactSection />

<style>
	.featured {
		padding: clamp(2rem, 5vw, 4rem) 0 var(--section-space);
	}
	.head {
		align-items: end;
		row-gap: 1.5rem;
		margin-bottom: clamp(3rem, 6vw, 5.5rem);
	}
	.head .eyebrow {
		grid-column: 1 / -1;
	}
	.head h2 {
		grid-column: 1 / span 7;
	}
	.aside {
		grid-column: 9 / span 4;
		display: grid;
		gap: 1.25rem;
		color: var(--text-secondary);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		width: fit-content;
		color: var(--ink);
		font-weight: 500;
		font-size: 0.92rem;
		border-bottom: 1px solid var(--ink);
		padding-bottom: 0.2rem;
	}
	.more :global(svg) {
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.more:hover :global(svg) {
		transform: translateX(4px);
	}
	@media (max-width: 860px) {
		.head h2,
		.aside {
			grid-column: 1 / -1;
		}
	}
</style>
