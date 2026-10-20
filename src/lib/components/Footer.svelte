<script lang="ts">
	import { ArrowUpRight, Phone, Mail, MessageCircle, MapPin, Clock } from '@lucide/svelte';
	import Logo from './Logo.svelte';
	import Button from './Button.svelte';
	import { courses, site, telHref, mailHref, whatsappHref } from '$lib/data/catalog';
	import { BRAND } from '$lib/data/site';
	import { reveal } from '$lib/motion/actions';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	const wa = whatsappHref();
	const popular = [...courses]
		.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.students - a.students)
		.slice(0, 6);
</script>

<footer class="footer" use:reveal>
	<div class="container-x">
		<div class="card" data-reveal>
			<div class="sign">
				<p class="eyebrow on-dark">Not sure which program fits?</p>
				<p class="t-h1 big">Talk to a <em>counsellor.</em></p>
			</div>
			<div class="act">
				<p>Fifteen minutes, free, no obligation. We’ll map the program, batch and mode that suit your goal.</p>
				<div class="btns">
					<Button variant="inverse" arrow onclick={() => enquiry.show({ kind: 'counselling' })}>Book free counselling</Button>
					{#if telHref}
						<a class="call" href={telHref}><Phone size={15} strokeWidth={1.8} /> {site.phone}</a>
					{/if}
				</div>
			</div>
		</div>

		<div class="cols">
			<div class="brand">
				<Logo tone="paper" tagline height={54} />
				<p>{site.taglineNote}</p>
			</div>
			<nav aria-label="Programs" class="col">
				<p class="head">Popular programs</p>
				{#each popular as c (c.id)}
					<a href="/courses/{c.id}">{c.title}</a>
				{/each}
				<a href="/courses" class="more">All {courses.length} programs →</a>
			</nav>
			<nav aria-label="Academy" class="col">
				<p class="head">Academy</p>
				<a href="/about">About us</a>
				<a href="/corporate-training">Corporate training</a>
				<a href="/courses">Programs & fees</a>
				<a href="/contact">Contact</a>
				<a href="https://www.symphozen.com/" target="_blank" rel="noopener">SymphoZen Labs <ArrowUpRight size={13} /></a>
			</nav>
			<div class="col reach">
				<p class="head">Get in touch</p>
				{#if telHref}<a href={telHref}><Phone size={14} strokeWidth={1.7} /> {site.phone}</a>{/if}
				{#if mailHref}<a href={mailHref}><Mail size={14} strokeWidth={1.7} /> {site.contactEmail}</a>{/if}
				{#if wa}<a href={wa} target="_blank" rel="noopener"><MessageCircle size={14} strokeWidth={1.7} /> Chat on WhatsApp</a>{/if}
				{#if site.address}<p><MapPin size={14} strokeWidth={1.7} /> <span>{site.address}</span></p>{/if}
				{#if site.hours}<p><Clock size={14} strokeWidth={1.7} /> <span>{site.hours}</span></p>{/if}
			</div>
		</div>

		<div class="base">
			<span>© {new Date().getFullYear()} {BRAND} · A SymphoZen Labs company</span>
			<span>{site.tagline}.</span>
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
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
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
		font-size: clamp(2.6rem, 6.5vw, 5.25rem);
	}
	.big em {
		color: var(--green-400);
	}
	.act {
		display: grid;
		gap: 1.25rem;
		justify-items: start;
		font-size: 1rem;
		max-width: 24rem;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.25rem;
	}
	.call {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: #fff;
		font-weight: 500;
	}
	.call:hover {
		color: var(--green-400);
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr));
		gap: 2rem;
		padding: clamp(2.5rem, 5vw, 4rem) 0;
	}
	.brand {
		display: grid;
		gap: 1.25rem;
		align-content: start;
		font-size: 0.92rem;
		max-width: 26rem;
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
	.col a,
	.reach p {
		display: inline-flex;
		align-items: flex-start;
		gap: 0.5rem;
		width: fit-content;
		transition: color var(--duration-normal) var(--ease-out);
	}
	.col a :global(svg),
	.reach p :global(svg) {
		flex: none;
		margin-top: 0.25rem;
	}
	.col a:hover {
		color: var(--green-400);
	}
	.more {
		color: #fff;
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

	@media (max-width: 960px) {
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
	@media (max-width: 520px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	/* room for the sticky mobile action bar */
	@media (max-width: 720px) {
		.footer {
			padding-bottom: 6rem;
		}
	}
</style>
