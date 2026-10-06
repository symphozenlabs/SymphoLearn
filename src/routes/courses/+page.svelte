<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { Search, LayoutGrid, List, X } from '@lucide/svelte';
	import CourseGrid from '$lib/components/CourseGrid.svelte';
	import { reveal } from '$lib/motion/actions';
	import { parseDuration } from '$lib/utils/course';
	import type { CategoryId, Course, Level } from '$lib/types';

	let { data } = $props();

	type Sort = 'popular' | 'rating' | 'newest' | 'shortest';
	type Length = 'any' | 'short' | 'medium' | 'long';

	let q = $state('');
	let category = $state<CategoryId | 'all'>('all');
	let level = $state<Level | 'all'>('all');
	let length = $state<Length>('any');
	let sort = $state<Sort>('popular');
	let layout = $state<'catalog' | 'list'>('catalog');

	const levels: (Level | 'all')[] = ['all', 'Beginner', 'Intermediate', 'Advanced'];
	const lengths: { id: Length; label: string }[] = [
		{ id: 'any', label: 'Any length' },
		{ id: 'short', label: 'Under 6 hours' },
		{ id: 'medium', label: '6 – 10 hours' },
		{ id: 'long', label: '10 hours +' }
	];
	const sorts: { id: Sort; label: string }[] = [
		{ id: 'popular', label: 'Most popular' },
		{ id: 'rating', label: 'Highest rated' },
		{ id: 'newest', label: 'Recently updated' },
		{ id: 'shortest', label: 'Shortest first' }
	];

	const hours = (c: Course) => {
		const [h = '0', m = '0'] = c.duration.replace(/[hm]/g, '').split(' ');
		return Number(h) + Number(m) / 60;
	};

	const results = $derived.by(() => {
		const term = q.trim().toLowerCase();
		const list = data.courses.filter((c) => {
			if (category !== 'all' && c.category !== category) return false;
			if (level !== 'all' && c.level !== level) return false;
			const h = hours(c);
			if (length === 'short' && h >= 6) return false;
			if (length === 'medium' && (h < 6 || h > 10)) return false;
			if (length === 'long' && h <= 10) return false;
			if (!term) return true;
			return [c.title, c.subtitle, c.instructor.name, ...c.skills].join(' ').toLowerCase().includes(term);
		});
		const by: Record<Sort, (a: Course, b: Course) => number> = {
			popular: (a, b) => b.students - a.students,
			rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
			newest: (a, b) => b.updated.localeCompare(a.updated),
			shortest: (a, b) => hours(a) - hours(b)
		};
		return [...list].sort(by[sort]);
	});

	const countFor = (id: CategoryId | 'all') =>
		id === 'all' ? data.courses.length : data.courses.filter((c) => c.category === id).length;

	const activeFilters = $derived(
		Number(category !== 'all') + Number(level !== 'all') + Number(length !== 'any') + Number(q.trim() !== '')
	);

	function reset() {
		q = '';
		category = 'all';
		level = 'all';
		length = 'any';
	}

	// URL ⇄ state (read on the client so the page can be prerendered)
	let synced = $state(false);
	function readUrl() {
		const p = new URLSearchParams(location.search);
		q = p.get('q') ?? '';
		category = (p.get('category') as CategoryId) ?? 'all';
		level = (p.get('level') as Level) ?? 'all';
		sort = (p.get('sort') as Sort) ?? 'popular';
	}
	onMount(() => {
		readUrl();
		synced = true;
	});
	afterNavigate(({ type }) => type !== 'enter' && synced && readUrl());

	$effect(() => {
		if (!synced) return;
		const p = new URLSearchParams();
		if (q) p.set('q', q);
		if (category !== 'all') p.set('category', category);
		if (level !== 'all') p.set('level', level);
		if (sort !== 'popular') p.set('sort', sort);
		const search = p.size ? `?${p}` : '';
		if (search !== location.search) replaceState(search || location.pathname, {});
	});
</script>

<svelte:head>
	<title>Explore courses — SymphoLearn</title>
</svelte:head>

<header class="intro container-x editorial-grid" use:reveal>
	<p class="eyebrow k" data-reveal>Explore</p>
	<h1 class="t-h1" data-reveal>Find something<br />worth <em class="italic-accent">learning.</em></h1>
	<p class="lead" data-reveal>
		{data.courses.length} carefully produced courses across {data.categories.length} disciplines — each one a
		path, not a playlist.
	</p>
</header>

<div class="controls" id="categories">
	<div class="container-x">
		<div class="chips" role="group" aria-label="Category">
			{#each [{ id: 'all' as const, name: 'All' }, ...data.categories] as c (c.id)}
				<button class="chip" class:on={category === c.id} aria-pressed={category === c.id} onclick={() => (category = c.id)}>
					{c.name}
					<span class="n">{countFor(c.id)}</span>
				</button>
			{/each}
		</div>

		<div class="filters">
			<label class="search">
				<Search size={16} strokeWidth={1.6} aria-hidden="true" />
				<span class="sr-only">Search courses</span>
				<input type="search" placeholder="Search by skill, title or instructor" bind:value={q} />
				{#if q}
					<button class="clear" onclick={() => (q = '')} aria-label="Clear search"><X size={14} /></button>
				{/if}
			</label>

			<div class="seg" role="group" aria-label="Level">
				{#each levels as l (l)}
					<button class:on={level === l} aria-pressed={level === l} onclick={() => (level = l)}>
						{l === 'all' ? 'All levels' : l}
					</button>
				{/each}
			</div>

			<label class="select">
				<span class="sr-only">Course length</span>
				<select bind:value={length}>
					{#each lengths as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
				</select>
			</label>

			<label class="select">
				<span class="sr-only">Sort by</span>
				<select bind:value={sort}>
					{#each sorts as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
				</select>
			</label>

			<div class="view" role="group" aria-label="Layout">
				<button class:on={layout === 'catalog'} aria-pressed={layout === 'catalog'} onclick={() => (layout = 'catalog')} aria-label="Gallery view">
					<LayoutGrid size={16} strokeWidth={1.6} />
				</button>
				<button class:on={layout === 'list'} aria-pressed={layout === 'list'} onclick={() => (layout = 'list')} aria-label="List view">
					<List size={16} strokeWidth={1.6} />
				</button>
			</div>
		</div>
	</div>
</div>

<section class="results container-x" aria-live="polite">
	<div class="summary">
		<p class="t-label">
			{results.length} {results.length === 1 ? 'course' : 'courses'}
			{#if category !== 'all'}· {data.categories.find((c) => c.id === category)?.name}{/if}
		</p>
		{#if activeFilters}
			<button class="reset" onclick={reset}>Clear filters ({activeFilters})</button>
		{/if}
	</div>

	{#if results.length}
		{#key `${layout}-${category}-${level}-${length}-${sort}`}
			<CourseGrid courses={results} {layout} />
		{/key}
	{:else}
		<div class="empty">
			<p class="t-h2">Nothing here — <em class="italic-accent">yet.</em></p>
			<p>No course matches those filters. Try a broader search or another discipline.</p>
			<button class="reset" onclick={reset}>Clear all filters</button>
		</div>
	{/if}
</section>

<style>
	.intro {
		padding-top: calc(var(--nav-height) + clamp(3.5rem, 9vw, 7.5rem));
		padding-bottom: clamp(2.5rem, 5vw, 4rem);
		align-items: end;
		row-gap: 1.5rem;
	}
	.k {
		grid-column: 1 / -1;
	}
	.intro h1 {
		grid-column: 1 / span 8;
		font-size: clamp(2.8rem, 7vw, 6rem);
	}
	.lead {
		grid-column: 9 / span 4;
		color: var(--text-secondary);
		padding-bottom: 0.75rem;
	}

	.controls {
		position: sticky;
		top: var(--nav-height);
		z-index: 10;
		padding: 1rem 0;
		background: rgb(252 252 250 / 0.88);
		backdrop-filter: blur(14px);
		border-block: 1px solid var(--border);
		scroll-margin-top: var(--nav-height);
	}
	.chips {
		display: flex;
		gap: 0.4rem;
		overflow-x: auto;
		scrollbar-width: none;
		padding-bottom: 0.9rem;
		margin-bottom: 0.9rem;
		border-bottom: 1px solid var(--border);
		mask-image: linear-gradient(to right, #000 92%, transparent);
	}
	.chips::-webkit-scrollbar {
		display: none;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex: none;
		height: 2.25rem;
		padding: 0 0.9rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		background: var(--surface);
		font-size: 0.86rem;
		color: var(--text-secondary);
		transition: all var(--duration-normal) var(--ease-out);
	}
	.chip:hover {
		border-color: var(--border-strong);
		color: var(--ink);
	}
	.chip.on {
		background: var(--ink);
		border-color: var(--ink);
		color: #fff;
	}
	.chip .n {
		font-family: var(--font-display);
		font-size: 0.8rem;
		opacity: 0.55;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
	}
	.search {
		flex: 1 1 18rem;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		height: 2.5rem;
		padding: 0 0.85rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--text-muted);
		transition: border-color var(--duration-normal) var(--ease-out);
	}
	.search:focus-within {
		border-color: var(--ink);
	}
	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: none;
		font: inherit;
		font-size: 0.9rem;
		color: var(--ink);
	}
	.search input::-webkit-search-cancel-button {
		display: none;
	}
	.clear {
		display: grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border: 0;
		border-radius: 50%;
		background: var(--surface-soft);
	}
	.seg,
	.view {
		display: inline-flex;
		padding: 3px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
	}
	.seg button,
	.view button {
		height: calc(2.5rem - 8px);
		padding: 0 0.75rem;
		border: 0;
		border-radius: var(--radius-sm);
		background: none;
		font-size: 0.82rem;
		color: var(--text-secondary);
		white-space: nowrap;
		transition: all var(--duration-normal) var(--ease-out);
	}
	.view button {
		display: grid;
		place-items: center;
		padding: 0 0.55rem;
	}
	.seg button.on,
	.view button.on {
		background: var(--surface-soft);
		color: var(--ink);
		box-shadow: inset 0 0 0 1px var(--border);
	}
	.select select {
		height: 2.5rem;
		padding: 0 2rem 0 0.85rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23646464' stroke-width='1.6'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E")
			no-repeat right 0.75rem center;
		font: inherit;
		font-size: 0.84rem;
		color: var(--ink);
		appearance: none;
		cursor: pointer;
	}

	.results {
		padding-top: 2.5rem;
		padding-bottom: var(--section-space);
		min-height: 60vh;
	}
	.summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2.5rem;
	}
	.reset {
		border: 0;
		background: none;
		font-size: 0.86rem;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--border-strong);
	}
	.reset:hover {
		text-decoration-color: var(--ink);
	}
	.empty {
		display: grid;
		gap: 1rem;
		justify-items: start;
		max-width: 32rem;
		margin: 4rem 0 0 16%;
		color: var(--text-secondary);
	}

	@media (max-width: 860px) {
		.intro h1,
		.lead {
			grid-column: 1 / -1;
		}
		.controls {
			position: static;
		}
		.seg {
			order: 3;
			width: 100%;
			overflow-x: auto;
		}
		.seg button {
			flex: 1;
		}
		.empty {
			margin-left: 0;
		}
	}
	@media (max-width: 560px) {
		.search {
			flex-basis: 100%;
		}
		.select {
			flex: 1 1 0;
			min-width: 0;
		}
		.select select {
			width: 100%;
		}
		.view {
			display: none;
		}
	}
</style>
