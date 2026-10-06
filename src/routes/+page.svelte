<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import HeroStory from '$lib/components/HeroStory.svelte';
	import CourseGrid from '$lib/components/CourseGrid.svelte';
	import CategoryIndex from '$lib/components/home/CategoryIndex.svelte';
	import WhyPlatform from '$lib/components/home/WhyPlatform.svelte';
	import ExperienceShowcase from '$lib/components/home/ExperienceShowcase.svelte';
	import ClosingCta from '$lib/components/home/ClosingCta.svelte';
	import BrandLine from '$lib/components/home/BrandLine.svelte';
	import { reveal } from '$lib/motion/actions';

	let { data } = $props();
</script>

<svelte:head>
	<title>SymphoLearn — Learning is a journey</title>
</svelte:head>

<HeroStory />
<BrandLine />

<section class="featured" use:reveal>
	<div class="container-x">
		<header class="head editorial-grid">
			<p class="eyebrow" data-reveal>Featured courses</p>
			<h2 class="t-h2" data-reveal>Courses worth<br />your <em class="italic-accent">time.</em></h2>
			<div class="aside" data-reveal>
				<p>Hand-picked paths from people who do this work every day. Each one ends with something you can show.</p>
				<a href="/courses" class="more">All courses <ArrowRight size={15} strokeWidth={1.6} /></a>
			</div>
		</header>

		<CourseGrid courses={data.featured} layout="featured" />
	</div>
</section>

<CategoryIndex />
<WhyPlatform />
<ExperienceShowcase />
<ClosingCta />

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
		grid-column: 2 / span 6;
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
