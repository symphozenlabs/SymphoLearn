<!--
	How joining works — six steps from the first call to career support.

	When the path scrolls into view it plays once, in order: each dot fills
	green with a ripple, its title and text rise in, and the connector to the
	next step draws itself. It always ends in the same place — every dot and
	every connector the same green — then a soft light keeps flowing along the
	path. Without JS the finished path is simply shown.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../Button.svelte';
	import { steps } from '$lib/data/academy';
	import { reveal } from '$lib/motion/actions';
	import { prefersReducedMotion } from '$lib/motion/gsap';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	/** time between one step lighting up and the next (ms) */
	const STEP = 420;

	let track: HTMLElement;
	let lit = $state(-1); // last step that has lit up
	let flowing = $state(-1); // last connector that has started drawing
	let done = $state(false);

	onMount(() => {
		const timers: number[] = [];
		const play = () => {
			if (prefersReducedMotion()) {
				lit = flowing = steps.length - 1;
				done = true;
				return;
			}
			steps.forEach((_, i) => {
				timers.push(window.setTimeout(() => (lit = i), i * STEP));
				timers.push(window.setTimeout(() => (flowing = i), i * STEP + 60));
			});
			timers.push(window.setTimeout(() => (done = true), steps.length * STEP + 300));
		};
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting) return;
				io.disconnect();
				play();
			},
			{ threshold: 0.35 }
		);
		io.observe(track);
		return () => {
			io.disconnect();
			timers.forEach(clearTimeout);
		};
	});
</script>

<section class="journey" use:reveal>
	<div class="container-x">
		<header class="head">
			<p class="eyebrow" data-reveal>How it works</p>
			<h2 class="t-h2" data-reveal>From first call to<br /><em class="italic-accent">first offer.</em></h2>
		</header>

		<ol class="steps" class:done bind:this={track} style="--step:{STEP}ms">
			{#each steps as s, i (s.title)}
				<li class:on={lit >= i} class:flow={flowing >= i} style="--i:{i}">
					<span class="dot t-num">{String(i + 1).padStart(2, '0')}</span>
					{#if i < steps.length - 1}
						<span class="seg" aria-hidden="true"><i></i></span>
					{/if}
					<h3 class="t-h3">{s.title}</h3>
					<p>{s.body}</p>
				</li>
			{/each}
		</ol>

		<div class="cta" data-reveal>
			<p>The first two steps are free. Start with a conversation.</p>
			<Button arrow magnetic onclick={() => enquiry.show({ kind: 'counselling' })}>Book free counselling</Button>
		</div>
	</div>
</section>

<style>
	.journey {
		--dot: 2.7rem;
		--gap: 1.5rem;
		--row-gap: 2.5rem;
		padding: var(--section-space) 0;
	}
	.head {
		display: grid;
		gap: 1.25rem;
		margin-bottom: clamp(3rem, 6vw, 5rem);
	}

	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: var(--row-gap) var(--gap);
	}
	.steps li {
		position: relative;
		display: grid;
		gap: 0.75rem;
		align-content: start;
		cursor: default;
	}

	/* — dot: finished state by default (no JS); outlined until its step lights up — */
	.dot {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: var(--dot);
		height: var(--dot);
		margin-bottom: 0.75rem;
		border-radius: 50%;
		border: 1px solid var(--brand-primary);
		background: var(--brand-primary);
		color: #fff;
		font-size: 0.95rem;
		box-shadow: 0 8px 20px rgb(90 138 69 / 0.28);
		transition:
			background 350ms var(--ease-out),
			color 350ms var(--ease-out),
			border-color 350ms var(--ease-out),
			box-shadow 350ms var(--ease-out),
			transform var(--duration-slow) var(--ease-out);
	}
	/* ripple that leaves the dot as it lights up */
	.dot::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 50%;
		border: 2px solid var(--brand-primary);
		opacity: 0;
		pointer-events: none;
	}
	.on .dot {
		animation: pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.on .dot::after {
		animation: ripple 900ms var(--ease-out);
	}
	:global(html.js) .steps li:not(.on) .dot {
		background: var(--background);
		border-color: var(--border-strong);
		color: var(--text-muted);
		box-shadow: none;
	}

	/* — text rises in behind its dot — */
	.steps .t-h3 {
		font-size: 1.1rem;
		transition:
			opacity 500ms var(--ease-out),
			transform var(--duration-slow) var(--ease-out),
			color var(--duration-normal);
	}
	.steps p {
		font-size: 0.88rem;
		color: var(--text-secondary);
		transition:
			opacity 500ms var(--ease-out) 90ms,
			transform var(--duration-slow) var(--ease-out) 90ms;
	}
	:global(html.js) .steps li:not(.on) :is(.t-h3, p) {
		opacity: 0;
		transform: translateY(14px);
	}

	/* — connector from this dot to the next: a hairline track, a green fill that draws — */
	.seg {
		position: absolute;
		top: calc(var(--dot) / 2);
		left: var(--dot);
		width: calc(100% + var(--gap) - var(--dot));
		height: 2px;
		translate: 0 -50%;
		border-radius: 2px;
		background: var(--gray-200);
		overflow: hidden;
	}
	.seg i {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		background: var(--brand-primary);
		transform-origin: left center;
		/* starts 60ms after its dot, arrives just before the next one lights up */
		transition: transform calc(var(--step) - 80ms) linear;
		overflow: hidden;
	}
	:global(html.js) .steps li:not(.flow) .seg i {
		transform: scaleX(0);
	}
	/* once the path is complete, a soft light keeps flowing along it */
	.done .seg i::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.8), transparent);
		transform: translateX(-100%);
		animation: sweep 5s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.28s + 0.4s);
	}

	/* — hover: the step lifts and its title turns green — */
	.steps li:hover .dot {
		transform: translateY(-3px) scale(1.06);
		box-shadow:
			0 0 0 6px var(--green-100),
			0 12px 24px rgb(90 138 69 / 0.3);
	}
	.steps li:hover .t-h3 {
		color: var(--brand-primary);
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

	@keyframes pop {
		0% {
			transform: scale(0.7);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes ripple {
		0% {
			opacity: 0.7;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.9);
		}
	}
	@keyframes sweep {
		0% {
			transform: translateX(-100%);
		}
		24%,
		100% {
			transform: translateX(100%);
		}
	}
	@keyframes sweep-down {
		0% {
			transform: translateY(-100%);
		}
		24%,
		100% {
			transform: translateY(100%);
		}
	}

	/* three per row: no connector out of the last step of a row */
	@media (max-width: 1100px) {
		.steps {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.steps li:nth-child(3n) .seg {
			display: none;
		}
	}

	/* one column: dots on the left, the connector runs down to the next dot */
	@media (max-width: 640px) {
		.journey {
			--row-gap: 1.75rem;
		}
		.steps {
			grid-template-columns: minmax(0, 1fr);
		}
		.steps li {
			grid-template-columns: var(--dot) 1fr;
			column-gap: 1rem;
			row-gap: 0.4rem;
		}
		.dot {
			grid-row: span 2;
			margin: 0;
		}
		.steps li:nth-child(3n) .seg {
			display: block;
		}
		.seg {
			top: var(--dot);
			left: calc(var(--dot) / 2);
			width: 2px;
			height: calc(100% - var(--dot) + var(--row-gap));
			translate: -50% 0;
		}
		.seg i {
			transform-origin: center top;
		}
		:global(html.js) .steps li:not(.flow) .seg i {
			transform: scaleY(0);
		}
		.done .seg i::after {
			background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.8), transparent);
			transform: translateY(-100%);
			animation-name: sweep-down;
		}
	}
</style>
