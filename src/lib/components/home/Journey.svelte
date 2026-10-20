<!--
	How joining works — six steps from the first call to career support,
	drawn as a path whose line fills in as the section scrolls past.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../Button.svelte';
	import { steps } from '$lib/data/academy';
	import { reveal } from '$lib/motion/actions';
	import { useGsap, prefersReducedMotion } from '$lib/motion/gsap';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	let root: HTMLElement;

	onMount(() => {
		if (prefersReducedMotion()) return;
		const { gsap } = useGsap();
		const ctx = gsap.context(() => {
			gsap.fromTo(
				'.fill',
				{ scaleX: 0 },
				{ scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.track', start: 'top 85%', end: 'bottom 45%', scrub: true } }
			);
		}, root);
		return () => ctx.revert();
	});
</script>

<section class="journey" bind:this={root} use:reveal>
	<div class="container-x">
		<header class="head">
			<p class="eyebrow" data-reveal>How it works</p>
			<h2 class="t-h2" data-reveal>From first call to<br /><em class="italic-accent">first offer.</em></h2>
		</header>

		<div class="track">
			<span class="line" aria-hidden="true"><span class="fill"></span></span>
			<ol class="steps">
				{#each steps as s, i (s.title)}
					<li data-reveal style="--i:{i}">
						<span class="dot t-num">{String(i + 1).padStart(2, '0')}</span>
						<h3 class="t-h3">{s.title}</h3>
						<p>{s.body}</p>
					</li>
				{/each}
			</ol>
		</div>

		<div class="cta" data-reveal>
			<p>The first two steps are free. Start with a conversation.</p>
			<Button arrow magnetic onclick={() => enquiry.show({ kind: 'counselling' })}>Book free counselling</Button>
		</div>
	</div>
</section>

<style>
	.journey {
		padding: var(--section-space) 0;
	}
	.head {
		display: grid;
		gap: 1.25rem;
		margin-bottom: clamp(3rem, 6vw, 5rem);
	}
	.track {
		position: relative;
	}
	.line {
		position: absolute;
		top: 1.35rem;
		left: 1.35rem;
		right: 1.35rem;
		height: 1px;
		background: var(--border-strong);
	}
	.fill {
		position: absolute;
		inset: 0;
		background: var(--brand-primary);
		transform-origin: left;
	}
	.steps {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 1.5rem;
	}
	.steps li {
		display: grid;
		gap: 0.75rem;
		align-content: start;
	}
	.dot {
		display: grid;
		place-items: center;
		width: 2.7rem;
		height: 2.7rem;
		margin-bottom: 0.75rem;
		border-radius: 50%;
		background: var(--background);
		border: 1px solid var(--brand-primary);
		color: var(--green-700);
		font-size: 0.95rem;
	}
	.steps li:nth-child(-n + 2) .dot {
		background: var(--brand-primary);
		color: #fff;
	}
	.steps .t-h3 {
		font-size: 1.1rem;
	}
	.steps p {
		font-size: 0.88rem;
		color: var(--text-secondary);
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem 2rem;
		margin-top: clamp(3rem, 5vw, 4rem);
		padding: 1.25rem 1.25rem 1.25rem 1.75rem;
		border-radius: var(--radius-xl);
		background: var(--green-100);
		color: var(--green-700);
		font-family: var(--font-display);
		font-size: clamp(1.15rem, 1.8vw, 1.45rem);
	}

	@media (max-width: 1100px) {
		.steps {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			row-gap: 2.5rem;
		}
		.line {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.steps {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 1.75rem;
		}
		.steps li {
			grid-template-columns: 2.7rem 1fr;
			column-gap: 1rem;
		}
		.dot {
			grid-row: span 2;
			margin: 0;
		}
	}
</style>
