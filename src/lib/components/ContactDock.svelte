<!--
	Always-there ways to reach the academy: a floating WhatsApp (or enquire)
	button on larger screens, and a sticky "Call · Free demo" bar on phones.
-->
<script lang="ts">
	import { MessageCircle, Phone, CalendarCheck } from '@lucide/svelte';
	import { telHref, whatsappHref } from '$lib/data/catalog';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	const wa = whatsappHref();
	let shown = $state(false);
</script>

<svelte:window onscroll={() => (shown = window.scrollY > 480)} />

{#if wa}
	<a class="fab" class:shown href={wa} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
		<MessageCircle size={22} strokeWidth={1.8} />
	</a>
{:else}
	<button class="fab" class:shown onclick={() => enquiry.show({ kind: 'counselling' })} aria-label="Talk to a counsellor">
		<MessageCircle size={22} strokeWidth={1.8} />
	</button>
{/if}

<div class="bar" class:shown>
	{#if telHref}
		<a class="b call" href={telHref}><Phone size={16} strokeWidth={1.8} /> Call us</a>
	{:else if wa}
		<a class="b call" href={wa} target="_blank" rel="noopener"><MessageCircle size={16} strokeWidth={1.8} /> WhatsApp</a>
	{/if}
	<button class="b demo" onclick={() => enquiry.show({ kind: 'demo' })}>
		<CalendarCheck size={16} strokeWidth={1.8} /> Book a free demo
	</button>
</div>

<style>
	.fab {
		position: fixed;
		right: clamp(1rem, 2.5vw, 1.75rem);
		bottom: clamp(1rem, 2.5vw, 1.75rem);
		z-index: 40;
		display: grid;
		place-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border: 0;
		border-radius: 50%;
		background: var(--brand-primary);
		color: #fff;
		box-shadow: 0 14px 34px rgb(90 138 69 / 0.35);
		opacity: 0;
		transform: translateY(12px) scale(0.9);
		pointer-events: none;
		transition:
			opacity var(--duration-slow) var(--ease-out),
			transform var(--duration-slow) var(--ease-out),
			background var(--duration-normal);
	}
	.fab.shown {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}
	.fab:hover {
		background: var(--brand-primary-hover);
	}

	.bar {
		display: none;
	}
	@media (max-width: 720px) {
		.fab {
			display: none;
		}
		.bar {
			position: fixed;
			inset: auto 0 0;
			z-index: 40;
			display: flex;
			gap: 0.5rem;
			padding: 0.6rem 0.75rem calc(0.6rem + env(safe-area-inset-bottom));
			background: rgb(252 252 250 / 0.92);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			border-top: 1px solid var(--border);
			transform: translateY(110%);
			transition: transform var(--duration-slow) var(--ease-out);
		}
		.bar.shown {
			transform: none;
		}
		.b {
			flex: 1;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 0.45rem;
			height: 2.9rem;
			border-radius: var(--button-radius);
			font-size: 0.85rem;
			font-weight: 650;
		}
		.call {
			border: 1px solid var(--border-strong);
			background: var(--surface);
			color: var(--ink);
		}
		.demo {
			border: 0;
			background: var(--brand-primary);
			color: #fff;
		}
	}
</style>
