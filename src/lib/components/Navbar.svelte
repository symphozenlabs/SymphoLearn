<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { Search, ChevronDown, ArrowUpRight } from '@lucide/svelte';
	import Logo from './Logo.svelte';
	import Button from './Button.svelte';
	import SearchDialog from './SearchDialog.svelte';
	import { categories } from '$lib/data/catalog';
	import { countByCategory } from '$lib/services/courseService';

	let scrolled = $state(false);
	let menuOpen = $state(false);
	let catsOpen = $state(false);
	let searchOpen = $state(false);
	let catsWrap = $state<HTMLElement>();

	const links = [
		{ href: '/courses', label: 'Explore' },
		{ href: '/dashboard', label: 'My Learning' }
	];

	const isActive = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');

	afterNavigate(() => {
		menuOpen = false;
		catsOpen = false;
	});

	$effect(() => {
		document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
	});

	function onwindowkeydown(e: KeyboardEvent) {
		const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]');
		if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
			e.preventDefault();
			searchOpen = true;
		}
		if (e.key === 'Escape') {
			catsOpen = false;
			menuOpen = false;
		}
	}

	function onwindowclick(e: MouseEvent) {
		if (catsOpen && catsWrap && !catsWrap.contains(e.target as Node)) catsOpen = false;
	}
</script>

<svelte:window
	onscroll={() => (scrolled = window.scrollY > 24)}
	onkeydown={onwindowkeydown}
	onclick={onwindowclick}
/>

<header class="nav" class:scrolled class:menu-open={menuOpen}>
	<div class="bar container-x">
		<Logo />

		<nav class="primary" aria-label="Primary">
			{#each links as link (link.href)}
				<a href={link.href} class="link" class:active={isActive(link.href)} aria-current={isActive(link.href) ? 'page' : undefined}>
					{link.label}
				</a>
			{/each}
			<div class="cats" bind:this={catsWrap}>
				<button
					class="link"
					aria-expanded={catsOpen}
					aria-controls="cats-menu"
					onclick={() => (catsOpen = !catsOpen)}
				>
					Categories <ChevronDown size={14} strokeWidth={1.75} class="chev" />
				</button>
				{#if catsOpen}
					<div id="cats-menu" class="cats-menu">
						<p class="t-label">Browse by discipline</p>
						<ul>
							{#each categories as c, i (c.id)}
								<li style="--i:{i}">
									<a href="/courses?category={c.id}">
										<span>{c.name}</span>
										<span class="count">{String(countByCategory(c.id)).padStart(2, '0')}</span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</nav>

		<div class="actions">
			<button class="search-btn" onclick={() => (searchOpen = true)} aria-label="Search courses (Ctrl K)">
				<Search size={17} strokeWidth={1.6} />
				<span class="search-text">Search</span>
				<kbd>⌘K</kbd>
			</button>
			<Button href="/courses" size="sm" arrow>Get started</Button>
		</div>

		<button
			class="burger"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={menuOpen}
			aria-controls="mobile-menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span></span><span></span>
		</button>
	</div>
</header>

<div id="mobile-menu" class="sheet" class:open={menuOpen} aria-hidden={!menuOpen} inert={!menuOpen}>
	<nav aria-label="Mobile" class="container-x">
		<ul class="big">
			<li style="--i:0"><a href="/courses">Explore</a></li>
			<li style="--i:1"><a href="/dashboard">My Learning</a></li>
			<li style="--i:2"><a href="/courses#categories">Categories</a></li>
			<li style="--i:3">
				<button onclick={() => { menuOpen = false; searchOpen = true; }}>Search</button>
			</li>
		</ul>
		<div class="sheet-foot" style="--i:4">
			<Button href="/courses" arrow full>Get started</Button>
			<a href="https://www.symphozen.com/" class="t-label zen" rel="noopener" target="_blank">
				A SymphoZen Labs product <ArrowUpRight size={12} />
			</a>
		</div>
	</nav>
</div>

<SearchDialog bind:open={searchOpen} />

<style>
	.nav {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		height: var(--nav-height);
		border-bottom: 1px solid transparent;
		transition:
			background var(--duration-slow) var(--ease-out),
			border-color var(--duration-slow) var(--ease-out),
			backdrop-filter var(--duration-slow) var(--ease-out);
	}
	.nav.scrolled {
		background: rgb(252 252 250 / 0.78);
		border-bottom-color: var(--border);
		backdrop-filter: blur(14px) saturate(1.2);
		-webkit-backdrop-filter: blur(14px) saturate(1.2);
	}
	.nav.menu-open {
		background: var(--background);
		border-bottom-color: transparent;
	}
	.bar {
		height: 100%;
		display: flex;
		align-items: center;
		gap: 2.75rem;
	}

	.primary {
		display: flex;
		align-items: center;
		gap: 1.9rem;
	}
	.link {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.4rem 0;
		background: none;
		border: 0;
		font-size: 0.98rem;
		letter-spacing: -0.025em;
		color: var(--text-primary);
		transition: color var(--duration-normal) var(--ease-out);
	}
	.link:hover,
	.link.active,
	.link[aria-expanded='true'] {
		color: var(--ink);
	}
	/* active indicator — a hairline that draws in from the left */
	.link::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: var(--ink);
		transform: scaleX(0);
		transform-origin: right;
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.link:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}
	.link.active::after {
		transform: scaleX(1);
		background: var(--brand-primary);
	}
	.link :global(.chev) {
		transition: transform var(--duration-normal) var(--ease-out);
	}
	.link[aria-expanded='true'] :global(.chev) {
		transform: rotate(180deg);
	}

	.cats {
		position: relative;
	}
	.cats-menu {
		position: absolute;
		top: calc(100% + 1rem);
		left: -1.25rem;
		width: 19rem;
		padding: 1.1rem 0.6rem 0.6rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-elevated);
		animation: menu-in var(--duration-normal) var(--ease-out);
	}
	.cats-menu .t-label {
		padding: 0 0.65rem 0.6rem;
	}
	.cats-menu ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.cats-menu li {
		animation: menu-in var(--duration-slow) var(--ease-out) both;
		animation-delay: calc(var(--i) * 25ms);
	}
	.cats-menu a {
		display: flex;
		justify-content: space-between;
		padding: 0.55rem 0.65rem;
		border-radius: var(--radius-md);
		font-size: 0.92rem;
		transition:
			background var(--duration-fast) var(--ease-out),
			padding var(--duration-normal) var(--ease-out);
	}
	.cats-menu a:hover {
		background: var(--surface-soft);
		padding-left: 0.9rem;
	}
	.count {
		font-family: var(--font-display);
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	@keyframes menu-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}

	.actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.search-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		height: 2.4rem;
		padding: 0 0.6rem 0 0.8rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: rgb(255 255 255 / 0.5);
		color: var(--text-muted);
		font-size: 0.86rem;
		transition:
			border-color var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out);
	}
	.search-btn:hover {
		border-color: var(--border-strong);
		color: var(--ink);
	}
	.search-text {
		min-width: 6rem;
		text-align: left;
	}
	kbd {
		font: 500 0.66rem var(--font-body);
		padding: 0.15rem 0.4rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.burger {
		display: none;
		margin-left: auto;
		width: 2.75rem;
		height: 2.75rem;
		border: 0;
		background: none;
		position: relative;
	}
	.burger span {
		position: absolute;
		left: 0.7rem;
		right: 0.7rem;
		height: 1.5px;
		background: var(--ink);
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.burger span:first-child {
		transform: translateY(-4px);
	}
	.burger span:last-child {
		transform: translateY(4px);
	}
	.menu-open .burger span:first-child {
		transform: rotate(45deg);
	}
	.menu-open .burger span:last-child {
		transform: rotate(-45deg);
	}

	/* Mobile sheet */
	.sheet {
		position: fixed;
		inset: var(--nav-height) 0 0;
		z-index: 49;
		background: var(--background);
		visibility: hidden;
		opacity: 0;
		transition:
			opacity var(--duration-normal) var(--ease-out),
			visibility 0s linear var(--duration-normal);
		overflow-y: auto;
	}
	.sheet.open {
		visibility: visible;
		opacity: 1;
		transition: opacity var(--duration-normal) var(--ease-out);
	}
	.sheet nav {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		padding-top: 2rem;
		padding-bottom: 2rem;
	}
	.big {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.big li,
	.sheet-foot {
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity var(--duration-slow) var(--ease-out),
			transform var(--duration-slow) var(--ease-out);
	}
	.open .big li,
	.open .sheet-foot {
		opacity: 1;
		transform: none;
		transition-delay: calc(80ms + var(--i) * 50ms);
	}
	.big a,
	.big button {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.9rem 0;
		border: 0;
		border-bottom: 1px solid var(--border);
		background: none;
		font-family: var(--font-display);
		font-size: clamp(2.1rem, 9vw, 3rem);
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.sheet-foot {
		margin-top: auto;
		padding-top: 2.5rem;
		display: grid;
		gap: 1.25rem;
	}
	.zen {
		display: inline-flex;
		gap: 0.3rem;
		align-items: center;
	}

	@media (max-width: 1024px) {
		.search-text,
		kbd {
			display: none;
		}
		.search-btn {
			padding: 0 0.7rem;
		}
		.primary {
			gap: 1.4rem;
		}
		.bar {
			gap: 2rem;
		}
	}
	@media (max-width: 860px) {
		.primary,
		.actions {
			display: none;
		}
		.burger {
			display: block;
		}
	}
</style>
