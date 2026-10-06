<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search, CornerDownLeft } from '@lucide/svelte';
	import { courses } from '$lib/data/catalog';
	import { getCategory } from '$lib/services/courseService';

	interface Props {
		open: boolean;
	}
	let { open = $bindable(false) }: Props = $props();

	let dialog: HTMLDialogElement;
	let input = $state<HTMLInputElement>();
	let query = $state('');
	let active = $state(0);

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return courses.slice(0, 5);
		return courses
			.filter((c) =>
				[c.title, c.subtitle, c.instructor.name, getCategory(c.category).name, ...c.skills]
					.join(' ')
					.toLowerCase()
					.includes(q)
			)
			.slice(0, 6);
	});

	$effect(() => {
		if (open && !dialog.open) {
			dialog.showModal();
			query = '';
			active = 0;
			requestAnimationFrame(() => input?.focus());
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	$effect(() => {
		// keep the highlighted row in range as results change
		if (active >= results.length) active = Math.max(0, results.length - 1);
	});

	function select(id: string) {
		open = false;
		goto(`/courses/${id}`);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = (active + 1) % Math.max(results.length, 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = (active - 1 + results.length) % Math.max(results.length, 1);
		} else if (e.key === 'Enter' && results[active]) {
			e.preventDefault();
			select(results[active].id);
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="search"
	aria-label="Search courses"
	onclose={() => (open = false)}
	onclick={(e) => e.target === dialog && (open = false)}
>
	<div class="panel">
		<label class="field">
			<Search size={18} strokeWidth={1.6} aria-hidden="true" />
			<span class="sr-only">Search courses</span>
			<input
				bind:this={input}
				bind:value={query}
				{onkeydown}
				type="search"
				placeholder="What do you want to learn?"
				autocomplete="off"
				role="combobox"
				aria-expanded="true"
				aria-controls="search-results"
				aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
			/>
			<kbd>esc</kbd>
		</label>

		<p class="t-label head">{query ? `${results.length} results` : 'Popular right now'}</p>

		<ul id="search-results" role="listbox">
			{#each results as course, i (course.id)}
				<li
					id="sr-{course.id}"
					role="option"
					aria-selected={i === active}
					class:active={i === active}
					onmouseenter={() => (active = i)}
					onclick={() => select(course.id)}
					onkeydown={() => {}}
				>
					<img src={course.thumbnail} alt="" width="64" height="40" />
					<span class="meta">
						<span class="title">{course.title}</span>
						<span class="sub">{getCategory(course.category).name} · {course.instructor.name}</span>
					</span>
					<CornerDownLeft size={15} strokeWidth={1.6} class="enter" aria-hidden="true" />
				</li>
			{:else}
				<li class="empty">Nothing matches “{query}” yet. Try a skill like “CSS” or “Python”.</li>
			{/each}
		</ul>
	</div>
</dialog>

<style>
	.search {
		width: min(40rem, calc(100vw - 2rem));
		max-height: min(34rem, 80vh);
		margin: 12vh auto auto;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-hero);
		color: var(--text-primary);
		overflow: hidden;
	}
	.search[open] {
		animation: rise var(--duration-slow) var(--ease-out);
	}
	.search::backdrop {
		background: rgb(23 25 22 / 0.28);
		backdrop-filter: blur(4px);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.985);
		}
	}
	.field {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		color: var(--text-muted);
	}
	input {
		flex: 1;
		border: 0;
		outline: 0;
		background: none;
		font: inherit;
		font-size: 1.1rem;
		color: var(--ink);
	}
	input::placeholder {
		color: var(--text-muted);
	}
	input::-webkit-search-cancel-button {
		display: none;
	}
	kbd {
		font: 500 0.68rem var(--font-body);
		letter-spacing: 0.06em;
		padding: 0.2rem 0.45rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
	}
	.head {
		padding: 1rem 1.25rem 0.5rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0.5rem 0.75rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-out);
	}
	li.active {
		background: var(--surface-soft);
	}
	li img {
		width: 64px;
		height: 40px;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	.meta {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.title {
		font-weight: 500;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sub {
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	li :global(.enter) {
		color: var(--text-muted);
		opacity: 0;
		transform: translateX(-4px);
		transition: all var(--duration-normal) var(--ease-out);
	}
	li.active :global(.enter) {
		opacity: 1;
		transform: none;
	}
	.empty {
		cursor: default;
		color: var(--text-secondary);
		font-size: 0.92rem;
		padding: 1rem 0.75rem;
	}
</style>
