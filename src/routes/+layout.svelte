<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	let { children } = $props();

	/** The learning room is a focused, full-screen app with its own chrome. */
	const immersive = $derived(page.url.pathname.startsWith('/learn'));

	onMount(() => {
		progress.hydrate();
		// While the page is scrolling, cards don't react to the pointer: otherwise each card
		// that slides under a resting cursor lifts and drops in turn, which reads as a glitch.
		const html = document.documentElement;
		let idle: ReturnType<typeof setTimeout>;
		const onScroll = () => {
			if (!html.classList.contains('is-scrolling')) html.classList.add('is-scrolling');
			clearTimeout(idle);
			idle = setTimeout(() => html.classList.remove('is-scrolling'), 160);
		};
		addEventListener('scroll', onScroll, { passive: true });
		return () => removeEventListener('scroll', onScroll);
	});

	// Page transitions — native View Transitions (fade + small rise, with
	// shared-element morphs for course covers). Browsers without support
	// simply navigate instantly.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<a class="skip-link" href="#main">Skip to content</a>

{#if !immersive}
	<Navbar />
{/if}

<main id="main" class:immersive>
	{@render children()}
</main>

{#if !immersive}
	<Footer />
{/if}

<style>
	main {
		view-transition-name: page;
		min-height: 100vh;
	}

	:global(::view-transition-old(page)) {
		animation: 220ms var(--ease-in-out) both page-out;
	}
	:global(::view-transition-new(page)) {
		animation: 520ms var(--ease-out) 60ms both page-in;
	}
	:global(::view-transition-group(*)) {
		animation-duration: 620ms;
		animation-timing-function: var(--ease-out);
	}
	/* keep the nav steady across pages */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation: none;
	}

	@keyframes -global-page-out {
		to {
			opacity: 0;
			transform: translateY(-8px);
		}
	}
	@keyframes -global-page-in {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-group(*)),
		:global(::view-transition-old(*)),
		:global(::view-transition-new(*)) {
			animation-duration: 160ms !important;
			transform: none !important;
		}
	}
</style>
