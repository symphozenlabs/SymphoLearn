<script lang="ts">
	import { ArrowRight, GraduationCap, Briefcase, Building2 } from '@lucide/svelte';
	import { audiences } from '$lib/data/academy';
	import { reveal } from '$lib/motion/actions';

	const icons = { students: GraduationCap, professionals: Briefcase, teams: Building2 };
</script>

<section class="aud" use:reveal>
	<div class="container-x">
		<header class="head">
			<p class="eyebrow" data-reveal>Who it’s for</p>
			<h2 class="t-h2" data-reveal>Wherever you’re starting,<br />there’s a <em class="italic-accent">path.</em></h2>
		</header>

		<ul class="cards">
			{#each audiences as a, i (a.id)}
				{@const Icon = icons[a.id as keyof typeof icons]}
				<li data-reveal style="--i:{i}">
					<a href={a.cta.href} class="card" class:dark={a.id === 'teams'}>
						<span class="ico"><Icon size={20} strokeWidth={1.6} /></span>
						<span class="t-label lbl">{a.label}</span>
						<span class="ttl">{a.title}</span>
						<span class="body">{a.body}</span>
						<span class="go">{a.cta.label} <ArrowRight size={15} strokeWidth={1.8} /></span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.aud {
		padding: var(--section-space) 0 calc(var(--section-space) * 0.6);
	}
	.head {
		display: grid;
		gap: 1.25rem;
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.25rem;
	}
	.card {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		padding: clamp(1.5rem, 3vw, 2.25rem);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.06);
		transition:
			transform var(--duration-slow) var(--ease-out),
			box-shadow var(--duration-slow) var(--ease-out);
	}
	.card:hover {
		transform: translateY(-6px);
		box-shadow:
			0 0 0 1px rgb(90 138 69 / 0.25),
			var(--shadow-elevated);
	}
	.ico {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		margin-bottom: 0.6rem;
		border-radius: 50%;
		background: var(--green-100);
		color: var(--green-700);
	}
	.ttl {
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 2.4vw, 2.1rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.body {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}
	.go {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: auto;
		padding-top: 1rem;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--brand-primary);
	}
	.go :global(svg) {
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.card:hover .go :global(svg) {
		transform: translateX(4px);
	}

	.dark {
		background: var(--ink);
		box-shadow: none;
	}
	.dark .ico {
		background: rgb(255 255 255 / 0.08);
		color: var(--green-400);
	}
	.dark .lbl {
		color: var(--text-inverse-faint);
	}
	.dark .ttl {
		color: #fff;
	}
	.dark .body {
		color: var(--text-inverse-muted);
	}
	.dark .go {
		color: var(--green-400);
	}

	@media (max-width: 900px) {
		.cards {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
