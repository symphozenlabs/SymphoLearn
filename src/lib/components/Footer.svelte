<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import Logo from './Logo.svelte';
	import Button from './Button.svelte';
	import { categories, SEEDED_COURSE_ID } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';
</script>

<footer class="footer" use:reveal>
	<div class="container-x">
		<div class="card" data-reveal>
			<div class="sign">
				<p class="eyebrow on-dark">Your place is saved</p>
				<p class="t-h1 big">Keep <em>learning.</em></p>
			</div>
			<div class="act">
				<p>Small, steady steps compound. Pick up exactly where you left off.</p>
				<Button href="/dashboard" variant="inverse" arrow>Open my learning</Button>
			</div>
		</div>

		<div class="cols">
			<div class="brand">
				<Logo tone="paper" />
				<p>Learning, designed as a journey.</p>
			</div>
			<nav aria-label="Learn" class="col">
				<p class="head">Learn</p>
				<a href="/courses">Explore courses</a>
				<a href="/dashboard">My learning</a>
				<a href="/courses/{SEEDED_COURSE_ID}">Start here</a>
			</nav>
			<nav aria-label="Disciplines" class="col">
				<p class="head">Disciplines</p>
				{#each categories.slice(0, 5) as c (c.id)}
					<a href="/courses?category={c.id}">{c.name}</a>
				{/each}
			</nav>
			<nav aria-label="Company" class="col">
				<p class="head">From</p>
				<a href="https://www.symphozen.com/" target="_blank" rel="noopener">
					SymphoZen Labs <ArrowUpRight size={13} />
				</a>
			</nav>
		</div>

		<div class="base">
			<span>© {new Date().getFullYear()} SymphoLearn</span>
			<span>Made for learners who come back tomorrow.</span>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		background: var(--ink);
		color: rgb(255 255 255 / 0.65);
		padding: clamp(3rem, 6vw, 5rem) 0 2rem;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		overflow: hidden;
	}
	.card {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		align-items: end;
		gap: 2rem;
		padding: clamp(1.75rem, 4vw, 3.25rem);
		border-radius: var(--radius-xl);
		border: 1px solid rgb(255 255 255 / 0.08);
		background:
			radial-gradient(ellipse 70% 90% at 0% 0%, rgb(90 138 69 / 0.22), transparent 60%),
			rgb(255 255 255 / 0.03);
	}
	.sign {
		display: grid;
		gap: 1.25rem;
	}
	.big {
		color: #fff;
		font-size: clamp(2.8rem, 7.5vw, 6rem);
	}
	.big em {
		color: var(--green-300);
	}
	.act {
		display: grid;
		gap: 1.25rem;
		justify-items: start;
		font-size: 1rem;
		max-width: 22rem;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr));
		gap: 2rem;
		padding: clamp(2.5rem, 5vw, 4rem) 0;
	}
	.brand {
		display: grid;
		gap: 1rem;
		align-content: start;
		font-size: 0.92rem;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.92rem;
	}
	.head {
		font-size: 0.66rem;
		font-weight: 650;
		letter-spacing: 0.19em;
		text-transform: uppercase;
		color: #fff;
		margin-bottom: 0.5rem;
	}
	.col a {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		width: fit-content;
		transition: color var(--duration-normal) var(--ease-out);
	}
	.col a:hover {
		color: var(--green-300);
	}
	.base {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgb(255 255 255 / 0.1);
		font-size: 0.82rem;
		color: rgb(255 255 255 / 0.65);
	}

	@media (max-width: 860px) {
		.card {
			grid-template-columns: 1fr;
		}
		.cols {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.brand {
			grid-column: 1 / -1;
		}
	}
</style>
