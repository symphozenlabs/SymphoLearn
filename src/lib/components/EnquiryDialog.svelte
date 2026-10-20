<!--
	The site-wide enquiry modal (native <dialog>: focus trap, Esc and backdrop
	for free). Opened from anywhere with `enquiry.show({ kind, courseId })`.
-->
<script lang="ts">
	import { X, Phone, MessageCircle } from '@lucide/svelte';
	import EnquiryForm from './EnquiryForm.svelte';
	import { enquiry } from '$lib/stores/enquiry.svelte';
	import { courses, site, telHref, whatsappHref } from '$lib/data/catalog';

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (enquiry.open && !dialog.open) dialog.showModal();
		if (!enquiry.open && dialog.open) dialog.close();
	});

	const course = $derived(courses.find((c) => c.id === enquiry.courseId));
	const copy = $derived(
		{
			demo: {
				k: 'Free demo class',
				t: 'Sit in on a live class.',
				s: 'Meet your mentor, see how sessions run and ask anything — before you decide.'
			},
			counselling: {
				k: 'Free career counselling',
				t: 'Map your path with a counsellor.',
				s: 'Tell us your goal and we’ll suggest the program and batch that fit.'
			},
			course: {
				k: 'Enquire',
				t: 'Get batch dates & fees.',
				s: 'Leave your number and a counsellor will call you back with the details.'
			},
			corporate: {
				k: 'Corporate training',
				t: 'Train your team with us.',
				s: 'Tell us about your team and we’ll put together a tailored proposal.'
			},
			contact: { k: 'Contact', t: 'How can we help?', s: 'Leave your details and we’ll get back to you.' }
		}[enquiry.kind]
	);
	const wa = $derived(whatsappHref(course ? `Hi SymphoZen Academia, I’d like details about ${course.title}.` : undefined));

	function onclick(e: MouseEvent) {
		// a click on the backdrop lands on the <dialog> itself
		if (e.target === dialog) enquiry.close();
	}
</script>

<dialog bind:this={dialog} class="dlg" aria-labelledby="enq-title" onclose={() => enquiry.close()} {onclick}>
	<div class="box">
		<button class="x" onclick={() => enquiry.close()} aria-label="Close"><X size={18} strokeWidth={1.7} /></button>
		<header>
			<p class="eyebrow">{copy.k}</p>
			<h2 id="enq-title" class="t-h3 ttl">{copy.t}</h2>
			<p class="sub">{course ? `${course.title} — ` : ''}{copy.s}</p>
		</header>
		{#key `${enquiry.kind}:${enquiry.courseId}:${enquiry.open}`}
			<EnquiryForm kind={enquiry.kind} courseId={enquiry.courseId} size="compact" uid="dlg" />
		{/key}
		{#if telHref || wa}
			<div class="alt">
				<span>Prefer to talk now?</span>
				{#if telHref}<a href={telHref}><Phone size={14} strokeWidth={1.8} /> {site.phone}</a>{/if}
				{#if wa}<a href={wa} target="_blank" rel="noopener"><MessageCircle size={14} strokeWidth={1.8} /> WhatsApp</a>{/if}
			</div>
		{/if}
	</div>
</dialog>

<style>
	.dlg {
		/* Tailwind's reset zeroes the UA's `margin: auto` that centres a modal dialog */
		margin: auto;
		width: min(30rem, calc(100vw - 2rem));
		max-height: calc(100dvh - 2rem);
		padding: 0;
		border: 0;
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: var(--text-primary);
		box-shadow: var(--shadow-hero);
		overflow: auto;
	}
	.dlg[open] {
		animation: dlg-in var(--duration-slow) var(--ease-out);
	}
	.dlg::backdrop {
		background: rgb(23 25 22 / 0.5);
		backdrop-filter: blur(4px);
	}
	.box {
		position: relative;
		padding: clamp(1.5rem, 4vw, 2.1rem);
		display: grid;
		gap: 1.4rem;
	}
	.x {
		position: absolute;
		top: 0.9rem;
		right: 0.9rem;
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border: 0;
		border-radius: 50%;
		background: var(--surface-soft);
		color: var(--text-secondary);
	}
	.x:hover {
		color: var(--ink);
		background: var(--gray-200);
	}
	header {
		display: grid;
		gap: 0.6rem;
		padding-right: 2.5rem;
	}
	.ttl {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.85rem;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}
	.sub {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	.alt {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.1rem;
		padding-top: 1.1rem;
		border-top: 1px solid var(--border);
		font-size: 0.82rem;
		color: var(--text-muted);
	}
	.alt a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--ink);
		font-weight: 500;
	}
	.alt a:hover {
		color: var(--brand-primary);
	}
	@keyframes dlg-in {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
	}
</style>
