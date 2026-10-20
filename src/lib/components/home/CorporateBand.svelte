<script lang="ts">
	import Button from '../Button.svelte';
	import { corporateOfferings } from '$lib/data/academy';
	import { reveal } from '$lib/motion/actions';
	import { enquiry } from '$lib/stores/enquiry.svelte';
</script>

<section class="corp" use:reveal>
	<div class="container-x">
		<div class="box noise">
			<div class="copy">
				<p class="eyebrow on-dark" data-reveal>Corporate & campus training</p>
				<h2 class="t-h2" data-reveal>Upskill your team.<br /><em>At scale.</em></h2>
				<p class="lead" data-reveal>
					Custom programs, workshops and bootcamps for companies and colleges — designed around your goals,
					delivered on-site or online by practitioner mentors.
				</p>
				<div class="btns" data-reveal>
					<Button variant="inverse" arrow onclick={() => enquiry.show({ kind: 'corporate' })}>Request a proposal</Button>
					<a class="more" href="/corporate-training">How it works →</a>
				</div>
			</div>
			<ul class="offers">
				{#each corporateOfferings as o, i (o.title)}
					<li data-reveal style="--i:{i}">
						<span class="t-num n">{String(i + 1).padStart(2, '0')}</span>
						<strong>{o.title}</strong>
						<span>{o.body}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.corp {
		padding: 0 0 var(--section-space);
	}
	.box {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		gap: clamp(2rem, 5vw, 5rem);
		padding: clamp(2rem, 5vw, 4.5rem);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(ellipse 60% 80% at 100% 0%, rgb(90 138 69 / 0.28), transparent 60%),
			var(--ink);
		color: var(--text-inverse-muted);
		overflow: hidden;
	}
	.copy {
		position: relative;
		display: grid;
		gap: 1.4rem;
		align-content: start;
	}
	.t-h2 {
		color: #fff;
	}
	.t-h2 em {
		color: var(--green-400);
	}
	.lead {
		max-width: 28rem;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem 1.5rem;
		margin-top: 0.5rem;
	}
	.more {
		color: #fff;
		font-weight: 500;
		font-size: 0.92rem;
		border-bottom: 1px solid rgb(255 255 255 / 0.4);
		padding-bottom: 0.15rem;
	}
	.more:hover {
		border-color: #fff;
	}
	.offers {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}
	.offers li {
		display: grid;
		gap: 0.5rem;
		align-content: start;
		padding: 1.4rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-inverse);
		background: rgb(255 255 255 / 0.03);
		font-size: 0.88rem;
	}
	.n {
		color: var(--green-400);
		font-size: 0.9rem;
	}
	.offers strong {
		color: #fff;
		font-weight: 600;
		font-size: 1rem;
	}
	@media (max-width: 960px) {
		.box {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 560px) {
		.offers {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
