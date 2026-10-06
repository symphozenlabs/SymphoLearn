<script lang="ts">
	import { untrack } from 'svelte';
	import { Check, Play, ChevronDown } from '@lucide/svelte';
	import type { Course } from '$lib/types';
	import { progress } from '$lib/stores/progress.svelte';
	import { formatSpan, sectionDuration } from '$lib/utils/course';

	interface Props {
		course: Course;
		currentLessonId?: string | null;
		/** In the player, lessons are buttons; on the course page they are links into the player. */
		onselect?: (lessonId: string) => void;
		tone?: 'light' | 'dark';
		/** Course page: show which lessons are free previews instead of progress. */
		showPreview?: boolean;
	}

	let { course, currentLessonId = null, onselect, tone = 'light', showPreview = false }: Props = $props();

	// Sections start open around the current lesson
	let open = $state<Record<string, boolean>>({});
	$effect(() => {
		const id = currentLessonId;
		const sections = course.sections;
		untrack(() => {
			const current = sections.find((s) => s.lessons.some((l) => l.id === id));
			const next = { ...open };
			sections.forEach((s, i) => (next[s.id] ??= current ? s.id === current.id : i === 0));
			if (current) next[current.id] = true;
			open = next;
		});
	});

	const completedIn = (sectionId: string) =>
		course.sections
			.find((s) => s.id === sectionId)!
			.lessons.filter((l) => progress.isCompleted(course.id, l.id)).length;
</script>

<div class="lessons {tone}">
	{#each course.sections as section, si (section.id)}
		{@const done = progress.ready ? completedIn(section.id) : 0}
		<section class="sec" class:open={open[section.id]}>
			<button
				class="sec-head"
				aria-expanded={open[section.id]}
				aria-controls="sec-{section.id}"
				onclick={() => (open[section.id] = !open[section.id])}
			>
				<span class="sec-n t-label">Section {String(si + 1).padStart(2, '0')}</span>
				<span class="sec-title">{section.title}</span>
				<span class="sec-meta">
					{#if done}<span class="done-count">{done}/{section.lessons.length}</span>{:else}{section.lessons.length} lessons{/if}
					· {formatSpan(sectionDuration(section))}
				</span>
				<ChevronDown size={16} strokeWidth={1.5} class="chev" />
			</button>

			<div class="sec-body" id="sec-{section.id}">
				<ol>
					{#each section.lessons as lesson (lesson.id)}
						{@const isDone = progress.ready && progress.isCompleted(course.id, lesson.id)}
						{@const isNow = lesson.id === currentLessonId}
						{@const ratio = progress.ready ? progress.lessonRatio(course.id, lesson.id) : 0}
						<li>
							<svelte:element
								this={onselect ? 'button' : 'a'}
								href={onselect ? undefined : `/learn/${course.id}?lesson=${lesson.id}`}
								class="lesson"
								class:done={isDone}
								class:now={isNow}
								aria-current={isNow ? 'step' : undefined}
								onclick={onselect ? () => onselect(lesson.id) : undefined}
								role={onselect ? 'button' : 'link'}
							>
								<span class="mark" aria-hidden="true">
									{#if isDone}
										<Check size={11} strokeWidth={2.6} />
									{:else if isNow}
										<Play size={9} strokeWidth={0} fill="currentColor" />
									{/if}
								</span>
								<span class="num t-num">{lesson.number}</span>
								<span class="title">
									{lesson.title}
									<span class="sr-only">{isDone ? '(completed)' : isNow ? '(current lesson)' : ''}</span>
								</span>
								<span class="dur">
									{#if showPreview && lesson.preview}
										<span class="pv">Preview</span>
									{/if}
									{lesson.duration}
								</span>
								{#if ratio > 0 && ratio < 1}
									<span class="partial" style="transform: scaleX({ratio})" aria-hidden="true"></span>
								{/if}
							</svelte:element>
						</li>
					{/each}
				</ol>
			</div>
		</section>
	{/each}
</div>

<style>
	.lessons {
		--fg: var(--ink);
		--fg-2: var(--text-secondary);
		--fg-3: var(--text-muted);
		--line: var(--border);
		--hover: var(--surface-soft);
		--now: var(--green-100);
		--mark: var(--border-strong);
		--accent: var(--brand-primary);
	}
	.dark {
		--fg: #fff;
		--fg-2: var(--text-inverse-muted);
		--fg-3: var(--text-inverse-faint);
		--line: var(--border-inverse);
		--hover: rgb(255 255 255 / 0.05);
		--now: rgb(184 206 169 / 0.1);
		--mark: rgb(255 255 255 / 0.25);
		--accent: var(--green-300);
	}

	.sec {
		border-bottom: 1px solid var(--line);
	}
	.sec-head {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'n chev'
			'title chev'
			'meta chev';
		align-items: center;
		row-gap: 0.15rem;
		width: 100%;
		padding: 1.1rem 0.25rem;
		border: 0;
		background: none;
		text-align: left;
		color: var(--fg);
	}
	.sec-n {
		grid-area: n;
		color: var(--fg-3);
	}
	.sec-title {
		grid-area: title;
		font-weight: 500;
		font-size: 1rem;
	}
	.sec-meta {
		grid-area: meta;
		font-size: 0.78rem;
		color: var(--fg-3);
	}
	.done-count {
		color: var(--accent);
		font-weight: 500;
	}
	.sec-head :global(.chev) {
		grid-area: chev;
		color: var(--fg-3);
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.open .sec-head :global(.chev) {
		transform: rotate(180deg);
	}

	/* animate height with grid rows */
	.sec-body {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--duration-slow) var(--ease-out);
	}
	.open .sec-body {
		grid-template-rows: 1fr;
	}
	.sec-body > ol {
		overflow: hidden;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.open .sec-body > ol {
		padding-bottom: 0.75rem;
	}
	:not(.open) > .sec-body :global(.lesson) {
		visibility: hidden;
	}

	.lesson {
		position: relative;
		display: grid;
		grid-template-columns: 1.15rem 1.6rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.7rem 0.6rem;
		border: 0;
		border-radius: var(--radius-md);
		background: none;
		text-align: left;
		font-size: 0.9rem;
		color: var(--fg-2);
		overflow: hidden;
		transition:
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}
	.lesson:hover {
		background: var(--hover);
		color: var(--fg);
	}
	.lesson.now {
		background: var(--now);
		color: var(--fg);
		font-weight: 500;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 1.15rem;
		height: 1.15rem;
		border-radius: 50%;
		border: 1px solid var(--mark);
		color: var(--accent);
		transition: all var(--duration-normal) var(--ease-out);
	}
	.done .mark {
		background: var(--brand-primary);
		border-color: var(--brand-primary);
		color: #fff;
	}
	.now .mark {
		border-color: var(--accent);
		animation: ring 2.2s var(--ease-out) infinite;
	}
	@keyframes ring {
		0% {
			box-shadow: 0 0 0 0 rgb(90 138 69 / 0.35);
		}
		70%,
		100% {
			box-shadow: 0 0 0 7px rgb(90 138 69 / 0);
		}
	}
	.num {
		font-size: 0.82rem;
		color: var(--fg-3);
	}
	.title {
		line-height: 1.35;
	}
	.dur {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.76rem;
		color: var(--fg-3);
		font-variant-numeric: tabular-nums;
		font-weight: 400;
	}
	.pv {
		padding: 0.1rem 0.4rem;
		border-radius: var(--radius-sm);
		background: var(--green-100);
		color: var(--green-700);
		font-size: 0.68rem;
		font-weight: 500;
	}
	.partial {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: var(--accent);
		transform-origin: left;
		opacity: 0.7;
	}
</style>
