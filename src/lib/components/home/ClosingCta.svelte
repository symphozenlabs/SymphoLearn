<script lang="ts">
	import { reveal } from '$lib/motion/actions';
	import Button from '../Button.svelte';
	import { SEEDED_COURSE_ID } from '$lib/data/catalog';
</script>

<section class="cta" use:reveal>
	<div class="container-x editorial-grid">
		<p class="eyebrow k" data-reveal>Lesson 01 · 0:46</p>
		<h2 class="t-display msg" data-reveal>
			Your first lesson is <em class="italic-accent">forty-six</em> seconds long.
		</h2>
		<div class="act" data-reveal>
			<p>Start with something small. The rest of the journey has a way of following.</p>
			<div class="btns">
				<Button href="/learn/{SEEDED_COURSE_ID}" size="lg" arrow magnetic>Watch lesson 01</Button>
				<Button href="/courses" variant="ghost" size="lg">Browse courses</Button>
			</div>
		</div>
	</div>
</section>

<style>
	.cta {
		padding: var(--section-space) 0;
		border-top: 1px solid var(--border);
	}
	.k {
		grid-column: 1 / span 3;
		padding-top: 1rem;
	}
	.msg {
		grid-column: 3 / span 9;
		font-size: clamp(2.8rem, 7vw, 6.5rem);
	}
	.act {
		grid-column: 8 / span 5;
		margin-top: clamp(2.5rem, 5vw, 4.5rem);
		display: grid;
		gap: 1.75rem;
		color: var(--text-secondary);
		font-size: 1.05rem;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	@media (max-width: 860px) {
		.k,
		.msg {
			grid-column: 1 / -1;
		}
		.act {
			grid-column: 2 / -1;
		}
	}
</style>
