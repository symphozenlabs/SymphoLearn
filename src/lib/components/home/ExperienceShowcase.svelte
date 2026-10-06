<!--
	The learning room, shown as an annotated product shot. Callouts sit on
	separate parallax planes so the interface reads as a physical object.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Check, NotebookPen, Keyboard, RotateCcw } from '@lucide/svelte';
	import { reveal } from '$lib/motion/actions';
	import { useGsap, prefersReducedMotion } from '$lib/motion/gsap';
	import { getCourseSync } from '$lib/services/courseService';
	import { SEEDED_COURSE_ID } from '$lib/data/catalog';

	const course = getCourseSync(SEEDED_COURSE_ID)!;
	const sec = course.sections[1];

	let root: HTMLElement;

	onMount(() => {
		if (prefersReducedMotion()) return;
		const { gsap } = useGsap();
		const ctx = gsap.context(() => {
			gsap.utils.toArray<HTMLElement>('[data-depth]').forEach((el) => {
				const depth = Number(el.dataset.depth);
				gsap.fromTo(
					el,
					{ y: depth * 60 },
					{
						y: depth * -60,
						ease: 'none',
						scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true }
					}
				);
			});
			gsap.fromTo(
				'.shot',
				{ scale: 0.94, opacity: 0.6 },
				{
					scale: 1,
					opacity: 1,
					ease: 'none',
					scrollTrigger: { trigger: '.shot', start: 'top 95%', end: 'top 35%', scrub: true }
				}
			);
		}, root);
		return () => ctx.revert();
	});
</script>

<section class="exp" bind:this={root} use:reveal>
	<div class="container-x">
		<header class="head">
			<p class="eyebrow" data-reveal>The learning room</p>
			<h2 class="t-h2" data-reveal>A quiet room for <em class="italic-accent">focused</em> work.</h2>
			<p class="t-body-lg lead" data-reveal>
				No sidebars full of noise. The video, the path and the next step — and nothing that
				competes for your attention.
			</p>
		</header>

		<div class="stage">
			<div class="shot" aria-hidden="true">
				<div class="s-top">
					<span class="lg"><img src="/brand/sympholearn-mark.svg" alt="" width="239" height="216" />SymphoLearn</span>
					<span class="crumb">{course.title}</span>
					<span class="pbar"><i style="width:38%"></i></span>
				</div>
				<div class="s-body">
					<div class="s-video">
						<img src="/images/welcome-poster.jpg" alt="" loading="lazy" width="1280" height="720" />
						<div class="ctrl"><i></i><span>12:04 / 48:45</span></div>
					</div>
					<div class="s-side">
						<p class="t-label">Section 02 · {sec.title}</p>
						{#each sec.lessons as l, i (l.id)}
							<div class="s-row" class:done={i < 2} class:now={i === 2}>
								<span class="m">{#if i < 2}<Check size={10} strokeWidth={2.6} />{/if}</span>
								<span>{l.title}</span>
								<span class="d">{l.duration}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="note n1" data-depth="1.2">
				<RotateCcw size={16} strokeWidth={1.6} />
				<div><strong>Resume, exactly.</strong><span>Your position is saved to the second.</span></div>
			</div>
			<div class="note n2" data-depth="-0.8">
				<span class="seg"><i></i><i></i><i></i><i></i><i></i><i></i></span>
				<div><strong>Progress you can see.</strong><span>One segment per lesson.</span></div>
			</div>
			<div class="note n3" data-depth="0.6">
				<NotebookPen size={16} strokeWidth={1.6} />
				<div><strong>What this lesson covers.</strong><span>Key points beside every video.</span></div>
			</div>
			<div class="note n4" data-depth="-1.4">
				<Keyboard size={16} strokeWidth={1.6} />
				<div><strong>Keyboard first.</strong><span><kbd>Space</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>F</kbd></span></div>
			</div>
		</div>
	</div>
</section>

<style>
	.exp {
		padding: var(--section-space) 0 calc(var(--section-space) * 0.8);
		overflow: hidden;
	}
	.head {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: 2rem;
		row-gap: 1.25rem;
		margin-bottom: clamp(3rem, 7vw, 6rem);
	}
	.head .eyebrow {
		grid-column: 3 / -1;
	}
	.head h2 {
		grid-column: 3 / span 7;
	}
	.lead {
		grid-column: 8 / span 5;
		margin-top: 1rem;
	}

	.stage {
		position: relative;
		padding: 2rem 0;
	}
	.shot {
		width: min(100%, 64rem);
		margin-left: auto;
		margin-right: 4%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-hero);
		overflow: hidden;
		transform-origin: 50% 100%;
	}
	.s-top {
		display: grid;
		grid-template-columns: auto 1fr 9rem;
		align-items: center;
		gap: 1.5rem;
		height: 3rem;
		padding: 0 1.25rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.75rem;
	}
	.lg {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-weight: 600;
	}
	.lg img {
		width: 1.15rem;
		height: auto;
	}
	.crumb {
		color: var(--text-secondary);
		text-align: center;
	}
	.pbar {
		height: 3px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}
	.pbar i {
		display: block;
		height: 100%;
		background: var(--brand-primary);
	}
	.s-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 17rem;
	}
	.s-video {
		position: relative;
		background: var(--ink);
		aspect-ratio: 16 / 9;
	}
	.s-video img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.92;
	}
	.ctrl {
		position: absolute;
		left: 1rem;
		right: 1rem;
		bottom: 0.85rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.65rem;
		color: var(--ink);
	}
	.ctrl i {
		flex: 1;
		height: 2px;
		background: linear-gradient(to right, var(--brand-primary) 25%, rgb(23 25 22 / 0.15) 25%);
	}
	.s-side {
		padding: 1.25rem 0.75rem;
		border-left: 1px solid var(--border);
		font-size: 0.78rem;
	}
	.s-side .t-label {
		padding: 0 0.5rem 0.75rem;
		font-size: 0.58rem;
	}
	.s-row {
		display: grid;
		grid-template-columns: 1rem 1fr auto;
		gap: 0.6rem;
		align-items: center;
		padding: 0.6rem 0.5rem;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
	}
	.s-row.now {
		background: var(--surface-soft);
		color: var(--ink);
		font-weight: 500;
	}
	.m {
		display: grid;
		place-items: center;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		border: 1px solid var(--border-strong);
	}
	.done .m {
		background: var(--brand-primary);
		border-color: var(--brand-primary);
		color: #fff;
	}
	.now .m {
		border-color: var(--brand-primary);
		box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 10px var(--brand-primary);
	}
	.d {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.note {
		position: absolute;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		max-width: 16rem;
		padding: 1rem 1.1rem;
		background: rgb(255 255 255 / 0.92);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		font-size: 0.82rem;
	}
	.note > :global(svg) {
		flex: none;
		margin-top: 0.15rem;
		color: var(--brand-primary);
	}
	.note div {
		display: grid;
		gap: 0.15rem;
	}
	.note strong {
		font-weight: 500;
		color: var(--ink);
	}
	.note span {
		color: var(--text-secondary);
	}
	.n1 {
		left: 0;
		top: 18%;
	}
	.n2 {
		left: 6%;
		bottom: 8%;
	}
	.n3 {
		right: 0;
		top: -1%;
	}
	.n4 {
		right: 1%;
		bottom: -2%;
	}
	.seg {
		display: grid;
		grid-template-columns: repeat(6, 6px);
		gap: 2px;
		margin-top: 0.4rem;
	}
	.seg i {
		height: 4px;
		background: var(--border-strong);
	}
	.seg i:nth-child(-n + 3) {
		background: var(--brand-primary);
	}
	kbd {
		font: 500 0.66rem var(--font-body);
		padding: 0.05rem 0.35rem;
		border: 1px solid var(--border-strong);
		border-radius: 3px;
		color: var(--ink);
	}

	@media (max-width: 960px) {
		.head .eyebrow,
		.head h2,
		.lead {
			grid-column: 1 / -1;
		}
		.shot {
			margin-right: 0;
		}
		.s-body {
			grid-template-columns: 1fr;
		}
		.s-side {
			display: none;
		}
		.stage {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.75rem;
		}
		.shot {
			grid-column: 1 / -1;
			margin-bottom: 1rem;
		}
		.note {
			position: relative;
			inset: auto;
			max-width: none;
			transform: none !important;
		}
	}
	@media (max-width: 560px) {
		.stage {
			grid-template-columns: 1fr;
		}
		.s-top {
			grid-template-columns: auto 1fr;
		}
		.crumb {
			display: none;
		}
	}
</style>
