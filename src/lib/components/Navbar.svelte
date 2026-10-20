<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { Search, ChevronDown, Phone, Mail, MessageCircle, ArrowRight } from '@lucide/svelte';
	import Logo from './Logo.svelte';
	import Button from './Button.svelte';
	import SearchDialog from './SearchDialog.svelte';
	import { categories, courses, site, telHref, mailHref, whatsappHref } from '$lib/data/catalog';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	let scrolled = $state(false);
	let menuOpen = $state(false);
	let progOpen = $state(false);
	let searchOpen = $state(false);
	let progWrap = $state<HTMLElement>();

	const wa = whatsappHref();
	const links = [
		{ href: '/corporate-training', label: 'Corporate training' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];
	const groups = categories.map((c) => ({ ...c, list: courses.filter((x) => x.category === c.id) }));

	const isActive = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');

	afterNavigate(() => {
		menuOpen = false;
		progOpen = false;
	});

	$effect(() => {
		document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
	});

	function onwindowkeydown(e: KeyboardEvent) {
		const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]');
		if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
			e.preventDefault();
			searchOpen = true;
		}
		if (e.key === 'Escape') {
			progOpen = false;
			menuOpen = false;
		}
	}

	function onwindowclick(e: MouseEvent) {
		if (progOpen && progWrap && !progWrap.contains(e.target as Node)) progOpen = false;
	}

	function demo() {
		menuOpen = false;
		enquiry.show({ kind: 'demo' });
	}
</script>

<svelte:window
	onscroll={() => (scrolled = window.scrollY > 24)}
	onkeydown={onwindowkeydown}
	onclick={onwindowclick}
/>

<header class="nav" class:scrolled class:menu-open={menuOpen}>
	<div class="top">
		<div class="container-x top-in">
			<p class="ann">
				<span class="dot" aria-hidden="true"></span>
				<span class="ann-t">{site.announcement}</span>
				<button class="ann-cta" onclick={demo}>Book now <ArrowRight size={12} strokeWidth={2} /></button>
			</p>
			<div class="reach">
				{#if telHref}<a href={telHref}><Phone size={13} strokeWidth={1.8} /> {site.phone}</a>{/if}
				{#if mailHref}<a href={mailHref} class="mail"><Mail size={13} strokeWidth={1.8} /> {site.contactEmail}</a>{/if}
				{#if wa}<a href={wa} target="_blank" rel="noopener"><MessageCircle size={13} strokeWidth={1.8} /> WhatsApp</a>{/if}
			</div>
		</div>
	</div>

	<div class="bar container-x">
		<Logo tagline height={40} />

		<nav class="primary" aria-label="Primary">
			<div class="prog" bind:this={progWrap}>
				<button
					class="link"
					class:active={isActive('/courses')}
					aria-expanded={progOpen}
					aria-controls="prog-menu"
					onclick={() => (progOpen = !progOpen)}
				>
					Programs <ChevronDown size={14} strokeWidth={1.75} class="chev" />
				</button>
				{#if progOpen}
					<div id="prog-menu" class="mega">
						<div class="mega-cols">
							{#each groups as g, i (g.id)}
								<div class="grp" style="--i:{i}">
									<a class="grp-h" href="/courses?category={g.id}">{g.name}</a>
									<ul>
										{#each g.list as c (c.id)}
											<li><a href="/courses/{c.id}">{c.title}</a></li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
						<aside class="mega-side">
							<p class="eyebrow">Not sure where to start?</p>
							<p class="side-t">Talk to a counsellor — it’s free.</p>
							<Button size="sm" arrow onclick={() => { progOpen = false; enquiry.show({ kind: 'counselling' }); }}>Free counselling</Button>
							<a class="all" href="/courses">View all {courses.length} programs <ArrowRight size={14} strokeWidth={1.7} /></a>
						</aside>
					</div>
				{/if}
			</div>
			{#each links as link (link.href)}
				<a href={link.href} class="link" class:active={isActive(link.href)} aria-current={isActive(link.href) ? 'page' : undefined}>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="actions">
			<button class="search-btn" onclick={() => (searchOpen = true)} aria-label="Search programs (Ctrl K)">
				<Search size={17} strokeWidth={1.6} />
			</button>
			<Button size="sm" arrow onclick={demo}>Book a free demo</Button>
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
			<li style="--i:0"><a href="/courses">Programs</a></li>
			{#each links as link, i (link.href)}
				<li style="--i:{i + 1}"><a href={link.href}>{link.label}</a></li>
			{/each}
			<li style="--i:4">
				<button onclick={() => { menuOpen = false; searchOpen = true; }}>Search</button>
			</li>
		</ul>
		<div class="sheet-foot" style="--i:5">
			<Button arrow full onclick={demo}>Book a free demo</Button>
			<div class="sheet-reach">
				{#if telHref}<a href={telHref}><Phone size={14} strokeWidth={1.8} /> {site.phone}</a>{/if}
				{#if wa}<a href={wa} target="_blank" rel="noopener"><MessageCircle size={14} strokeWidth={1.8} /> WhatsApp</a>{/if}
				{#if mailHref}<a href={mailHref}><Mail size={14} strokeWidth={1.8} /> {site.contactEmail}</a>{/if}
			</div>
		</div>
	</nav>
</div>

<SearchDialog bind:open={searchOpen} />

<style>
	.nav {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		transition: transform var(--duration-slow) var(--ease-out);
	}
	/* the top bar slides away once the page scrolls; the main bar stays */
	.nav.scrolled:not(.menu-open) {
		transform: translateY(calc(-1 * var(--topbar)));
	}

	/* — top bar — */
	.top {
		height: var(--topbar);
		background: var(--ink);
		color: rgb(255 255 255 / 0.72);
		font-size: 0.78rem;
	}
	.top-in {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}
	.ann {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
	}
	.dot {
		flex: none;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--green-400);
		box-shadow: 0 0 0 0 rgb(123 189 95 / 0.6);
		animation: pulse 2.4s var(--ease-out) infinite;
	}
	.ann-t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ann-cta {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--green-400);
		font-weight: 600;
	}
	.ann-cta:hover {
		color: #fff;
	}
	.reach {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex: none;
	}
	.reach a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		transition: color var(--duration-normal);
	}
	.reach a:hover {
		color: #fff;
	}
	@keyframes pulse {
		70% {
			box-shadow: 0 0 0 7px rgb(123 189 95 / 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgb(123 189 95 / 0);
		}
	}

	/* — main bar — */
	/* the full lockup (same as the footer) is wide: let it shrink before the menu wraps */
	.bar :global(a.logo) {
		flex: 0 1 auto;
		min-width: 0;
	}
	.bar {
		height: var(--bar-height);
		display: flex;
		align-items: center;
		gap: 2.5rem;
		border-bottom: 1px solid transparent;
		max-width: none;
		padding-inline: max(var(--gutter), calc((100vw - var(--container)) / 2 + var(--gutter)));
		transition:
			background var(--duration-slow) var(--ease-out),
			border-color var(--duration-slow) var(--ease-out);
	}
	.scrolled .bar {
		background: rgb(252 252 250 / 0.82);
		border-bottom-color: var(--border);
		backdrop-filter: blur(14px) saturate(1.2);
		-webkit-backdrop-filter: blur(14px) saturate(1.2);
	}
	.menu-open .bar {
		background: var(--background);
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
		font-size: 0.96rem;
		letter-spacing: -0.02em;
		color: var(--text-primary);
		white-space: nowrap;
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

	/* — Programs mega-menu — */
	.prog {
		position: relative;
	}
	.mega {
		position: absolute;
		top: calc(100% + 1.1rem);
		left: -1.5rem;
		width: min(58rem, calc(100vw - 2 * var(--gutter)));
		display: grid;
		grid-template-columns: minmax(0, 1fr) 15rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-elevated);
		overflow: hidden;
		animation: menu-in var(--duration-normal) var(--ease-out);
	}
	.mega-cols {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem 1.75rem;
		padding: 1.6rem 1.75rem;
	}
	.grp {
		animation: menu-in var(--duration-slow) var(--ease-out) both;
		animation-delay: calc(var(--i) * 25ms);
	}
	.grp-h {
		display: block;
		margin-bottom: 0.55rem;
		font-size: 0.66rem;
		font-weight: 650;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--green-600);
	}
	.grp-h:hover {
		color: var(--ink);
	}
	.grp ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.15rem;
	}
	.grp li a {
		display: block;
		padding: 0.3rem 0;
		font-size: 0.9rem;
		line-height: 1.35;
		color: var(--text-primary);
		transition:
			color var(--duration-fast),
			transform var(--duration-normal) var(--ease-out);
	}
	.grp li a:hover {
		color: var(--brand-primary);
		transform: translateX(3px);
	}
	.mega-side {
		display: grid;
		align-content: start;
		justify-items: start;
		gap: 0.9rem;
		padding: 1.6rem 1.5rem;
		background: var(--surface-soft);
		border-left: 1px solid var(--border);
	}
	.side-t {
		font-family: var(--font-display);
		font-size: 1.35rem;
		line-height: 1.2;
		color: var(--ink);
	}
	.all {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.4rem;
		font-size: 0.84rem;
		font-weight: 500;
		color: var(--ink);
		border-bottom: 1px solid var(--ink);
		padding-bottom: 0.15rem;
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
		gap: 0.9rem;
	}
	.search-btn {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: rgb(255 255 255 / 0.5);
		color: var(--text-muted);
		transition:
			border-color var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out);
	}
	.search-btn:hover {
		border-color: var(--border-strong);
		color: var(--ink);
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
		padding-top: 1.5rem;
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
		padding: 0.85rem 0;
		border: 0;
		border-bottom: 1px solid var(--border);
		background: none;
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 8vw, 2.75rem);
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.sheet-foot {
		margin-top: auto;
		padding-top: 2.5rem;
		display: grid;
		gap: 1.25rem;
	}
	.sheet-reach {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		font-size: 0.88rem;
		color: var(--text-secondary);
	}
	.sheet-reach a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	@media (max-width: 1100px) {
		.mail {
			display: none;
		}
		.primary {
			gap: 1.4rem;
		}
		.bar {
			gap: 1.75rem;
		}
		.mega {
			grid-template-columns: minmax(0, 1fr);
		}
		.mega-side {
			border-left: 0;
			border-top: 1px solid var(--border);
			grid-template-columns: 1fr auto;
			align-items: center;
		}
		.mega-side .eyebrow,
		.mega-side .all {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 960px) {
		.primary,
		.actions {
			display: none;
		}
		.burger {
			display: block;
			flex: none;
		}
		/* the lockup is wide — let it shrink so the menu button always fits */
		.bar {
			gap: 1rem;
		}
		.bar :global(.logo) {
			flex: 0 1 auto;
			min-width: 0;
		}
	}
	@media (max-width: 640px) {
		.reach {
			display: none;
		}
	}
</style>
