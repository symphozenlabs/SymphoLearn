<!--
	The closing section on home and contact pages: FAQs beside the enquiry form
	and every direct way to reach the academy.
-->
<script lang="ts">
	import { Phone, Mail, MessageCircle, MapPin, Clock } from '@lucide/svelte';
	import EnquiryForm from '../EnquiryForm.svelte';
	import Faq from '../Faq.svelte';
	import { faqs } from '$lib/data/academy';
	import { site, telHref, mailHref, whatsappHref } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';

	interface Props {
		/** render the heading as the page's h1 (contact page) */
		asPage?: boolean;
	}
	let { asPage = false }: Props = $props();

	const wa = whatsappHref();
</script>

<section class="contact" class:page={asPage} id="contact" use:reveal>
	<div class="container-x grid">
		<div class="left">
			<p class="eyebrow" data-reveal>{asPage ? 'Contact us' : 'Questions, answered'}</p>
			<svelte:element this={asPage ? 'h1' : 'h2'} class="t-h2 ttl" data-reveal>
				Ready to start? <em class="italic-accent">Let’s talk.</em>
			</svelte:element>
			<p class="lead" data-reveal>
				Leave your details and a counsellor will call you back within one working day — or reach us directly.
			</p>

			<ul class="reach" data-reveal>
				{#if telHref}<li><a href={telHref}><Phone size={16} strokeWidth={1.7} /><span><small>Call</small>{site.phone}</span></a></li>{/if}
				{#if wa}<li><a href={wa} target="_blank" rel="noopener"><MessageCircle size={16} strokeWidth={1.7} /><span><small>WhatsApp</small>Chat with a counsellor</span></a></li>{/if}
				{#if mailHref}<li><a href={mailHref}><Mail size={16} strokeWidth={1.7} /><span><small>Email</small>{site.contactEmail}</span></a></li>{/if}
				{#if site.address}<li><p><MapPin size={16} strokeWidth={1.7} /><span><small>Visit</small>{site.address}</span></p></li>{/if}
				{#if site.hours}<li><p><Clock size={16} strokeWidth={1.7} /><span><small>Hours</small>{site.hours}</span></p></li>{/if}
			</ul>

			<div class="faqs" data-reveal>
				<p class="t-label">Frequently asked</p>
				<Faq items={faqs} />
			</div>
		</div>

		<div class="right">
			<div class="card" data-reveal>
				<p class="card-k eyebrow">Send an enquiry</p>
				<EnquiryForm kind="contact" size="full" uid="contact" />
			</div>
		</div>
	</div>
</section>

<style>
	.contact {
		padding: var(--section-space) 0;
		border-top: 1px solid var(--border);
	}
	.contact.page {
		padding-top: calc(var(--nav-height) + clamp(2.5rem, 6vw, 5rem));
		border-top: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: clamp(2.5rem, 6vw, 6rem);
		align-items: start;
	}
	.left {
		display: grid;
		gap: 1.4rem;
	}
	.ttl {
		font-size: clamp(2.4rem, 4.6vw, 4rem);
	}
	.lead {
		color: var(--text-secondary);
		max-width: 30rem;
	}
	.reach {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
	}
	.reach a,
	.reach p {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		height: 100%;
		padding: 1rem 1.1rem;
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.06);
		font-size: 0.9rem;
		color: var(--ink);
		overflow-wrap: anywhere;
	}
	.reach a {
		transition: box-shadow var(--duration-normal);
	}
	.reach a:hover {
		box-shadow: 0 0 0 1px var(--brand-primary);
	}
	.reach :global(svg) {
		flex: none;
		margin-top: 0.15rem;
		color: var(--brand-primary);
	}
	.reach span {
		display: grid;
		gap: 0.1rem;
	}
	.reach small {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.faqs {
		display: grid;
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.right {
		position: sticky;
		top: calc(var(--bar-height) + 1.5rem);
	}
	.card {
		display: grid;
		gap: 1.25rem;
		padding: clamp(1.5rem, 3vw, 2.25rem);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.06),
			var(--shadow-soft);
	}
	@media (max-width: 960px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.right {
			position: static;
		}
	}
	@media (max-width: 520px) {
		.reach {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
