<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { ArrowLeft, ArrowRight, Check, ListVideo, X, PanelRightClose, PanelRightOpen, Award } from '@lucide/svelte';
	import type { Course } from '$lib/types';
	import { progress } from '$lib/stores/progress.svelte';
	import { allLessons, findLesson, lessonCount } from '$lib/utils/course';
	import Logo from './Logo.svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import LessonList from './LessonList.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import Button from './Button.svelte';

	interface Props {
		course: Course;
		/** Lesson requested via ?lesson= (deep link) */
		requestedLessonId?: string | null;
	}
	let { course, requestedLessonId = null }: Props = $props();

	const lessons = $derived(allLessons(course));
	const total = $derived(lessonCount(course));

	let currentId = $state<string | null>(null);
	let sheetOpen = $state(false);
	let sidebarCollapsed = $state(false);
	let upNext = $state<{ seconds: number } | null>(null);
	let countdown: ReturnType<typeof setInterval> | undefined;
	let main = $state<HTMLElement>();

	// Pick the starting lesson once progress has loaded from storage
	$effect(() => {
		if (!progress.ready || currentId) return;
		const saved = progress.get(course.id)?.currentLessonId;
		const valid = (id?: string | null) => (id && lessons.some((l) => l.id === id) ? id : null);
		select(valid(requestedLessonId) ?? valid(saved) ?? lessons[0].id, { scroll: false });
	});

	const ctx = $derived(findLesson(course, currentId));
	const lesson = $derived(ctx?.lesson);
	const sectionIndex = $derived(ctx ? course.sections.indexOf(ctx.section) : 0);
	const pct = $derived(progress.ready ? progress.percent(course) : 0);
	const completedCount = $derived(progress.get(course.id)?.completedLessons.length ?? 0);
	const isDone = $derived(lesson ? progress.isCompleted(course.id, lesson.id) : false);
	const courseDone = $derived(completedCount === total);
	const segments = $derived(lessons.map((l) => progress.isCompleted(course.id, l.id)));

	async function select(id: string, { scroll = true } = {}) {
		cancelUpNext();
		currentId = id;
		progress.setCurrentLesson(course, id);
		sheetOpen = false;
		// keep the URL shareable; deferred so it never runs before the router is ready
		setTimeout(() => {
			try {
				replaceState(`?lesson=${id}`, {});
			} catch {
				/* navigation in progress */
			}
		});
		if (scroll) {
			await tick();
			main?.scrollTo({ top: 0, behavior: 'smooth' });
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function goNext() {
		if (!ctx) return;
		progress.completeLesson(course, ctx.lesson.id);
		if (ctx.next) select(ctx.next.id);
	}

	function goPrev() {
		if (ctx?.previous) select(ctx.previous.id);
	}

	function toggleComplete() {
		if (!lesson) return;
		if (isDone) progress.uncompleteLesson(course, lesson.id);
		else progress.completeLesson(course, lesson.id);
	}

	function onended() {
		if (!ctx) return;
		progress.completeLesson(course, ctx.lesson.id);
		if (!ctx.next) return;
		upNext = { seconds: 6 };
		countdown = setInterval(() => {
			if (!upNext) return;
			upNext = { seconds: upNext.seconds - 1 };
			if (upNext.seconds <= 0) goNext();
		}, 1000);
	}

	function cancelUpNext() {
		clearInterval(countdown);
		upNext = null;
	}
	onDestroy(cancelUpNext);

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') sheetOpen = false;
	}
</script>

<svelte:window {onkeydown} />

<div class="room" class:collapsed={sidebarCollapsed}>
	<!-- App bar -->
	<header class="bar">
		<div class="bar-l">
			<Logo compact />
			<a class="exit" href="/courses/{course.id}">
				<ArrowLeft size={15} strokeWidth={1.6} /> <span>Course overview</span>
			</a>
		</div>
		<div class="bar-c">
			<span class="t-label">{course.sections[sectionIndex]?.title ?? ''}</span>
			<span class="c-title">{course.title}</span>
		</div>
		<div class="bar-r">
			<div class="bar-prog">
				<span class="t-num pct">{pct}%</span>
				<div class="mini"><ProgressBar value={pct} size="xs" label="{course.title} progress" /></div>
			</div>
			<button
				class="icon-btn desktop-only"
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				aria-label={sidebarCollapsed ? 'Show course content' : 'Hide course content'}
				aria-pressed={!sidebarCollapsed}
			>
				{#if sidebarCollapsed}<PanelRightOpen size={18} strokeWidth={1.5} />{:else}<PanelRightClose size={18} strokeWidth={1.5} />{/if}
			</button>
		</div>
	</header>

	<div class="body">
		<!-- Stage -->
		<div class="main" bind:this={main}>
			{#if lesson}
				<div class="video-wrap">
					{#key lesson.id}
						<div class="video">
							<VideoPlayer
								src={lesson.videoUrl}
								poster={lesson.poster}
								title="{lesson.number} — {lesson.title}"
								startAt={progress.lastPosition(course.id, lesson.id)}
								ontime={(t, d) => progress.trackPlayback(course, lesson.id, t, d)}
								{onended}
							/>
						</div>
					{/key}

					{#if upNext && ctx?.next}
						<div class="upnext" role="status">
							<p class="t-label">Up next in {upNext.seconds}s</p>
							<p class="un-title">{ctx.next.number} — {ctx.next.title}</p>
							<div class="un-actions">
								<Button size="sm" variant="inverse" arrow onclick={goNext}>Play now</Button>
								<Button size="sm" variant="ghost" class="un-cancel" onclick={cancelUpNext}>Cancel</Button>
							</div>
							<span class="un-bar" style="transform: scaleX({upNext.seconds / 6})"></span>
						</div>
					{/if}
				</div>

				<article class="details">
					<div class="d-head">
						<p class="t-label">
							Lesson {lesson.number} of {String(total).padStart(2, '0')} · Section {String(sectionIndex + 1).padStart(2, '0')}
						</p>
						{#key lesson.id}
							<h1 class="t-h2 d-title">{lesson.title}</h1>
						{/key}
					</div>

					<div class="d-grid">
						<div class="d-copy">
							<p class="t-body-lg">{lesson.description}</p>
							<button class="complete" class:on={isDone} onclick={toggleComplete} aria-pressed={isDone}>
								<span class="c-box"><Check size={13} strokeWidth={2.5} /></span>
								{isDone ? 'Completed' : 'Mark as complete'}
							</button>
						</div>
						{#if lesson.keyPoints.length}
							<div class="d-points">
								<p class="t-label">In this lesson</p>
								<ol>
									{#each lesson.keyPoints as point, i (point)}
										<li><span class="t-num">{String(i + 1).padStart(2, '0')}</span>{point}</li>
									{/each}
								</ol>
							</div>
						{/if}
					</div>

					{#if courseDone}
						<div class="finished">
							<Award size={28} strokeWidth={1.4} />
							<div>
								<p class="f-title">You finished {course.title}.</p>
								<p>Every lesson, complete. That’s something new you know now.</p>
							</div>
							<Button href="/dashboard" variant="brand" arrow>See your progress</Button>
						</div>
					{/if}

					<nav class="pager" aria-label="Lesson navigation">
						<button class="pg prev" onclick={goPrev} disabled={!ctx?.previous}>
							<span class="t-label"><ArrowLeft size={13} strokeWidth={1.75} /> Previous</span>
							<span class="pg-title">{ctx?.previous?.title ?? 'Start of course'}</span>
						</button>
						<button class="pg next" onclick={goNext} disabled={!ctx?.next && isDone}>
							<span class="t-label">{ctx?.next ? 'Next lesson' : 'Finish course'} <ArrowRight size={13} strokeWidth={1.75} /></span>
							<span class="pg-title">{ctx?.next?.title ?? 'Mark the course complete'}</span>
						</button>
					</nav>
				</article>
			{:else}
				<div class="video-wrap"><div class="video skeleton"></div></div>
			{/if}
		</div>

		<!-- Curriculum: sidebar on desktop, bottom sheet on mobile -->
		<button class="scrim" class:show={sheetOpen} onclick={() => (sheetOpen = false)} aria-hidden="true" tabindex="-1"></button>
		<aside id="course-content" class="side" class:open={sheetOpen} aria-label="Course content">
			<div class="handle" aria-hidden="true"></div>
			<div class="side-head">
				<div>
					<p class="t-label">Course content</p>
					<p class="side-count"><span class="t-num">{completedCount}</span> of {total} lessons complete</p>
				</div>
				<button class="icon-btn mobile-only" onclick={() => (sheetOpen = false)} aria-label="Close course content">
					<X size={18} strokeWidth={1.5} />
				</button>
			</div>
			<div class="side-prog"><ProgressBar value={pct} segments={total} completed={segments} /></div>
			<div class="side-list">
				<LessonList {course} currentLessonId={currentId} onselect={(id) => select(id)} />
			</div>
		</aside>

		<button class="sheet-btn" onclick={() => (sheetOpen = true)} aria-expanded={sheetOpen} aria-controls="course-content">
			<ListVideo size={17} strokeWidth={1.5} />
			<span>Course content</span>
			<span class="sb-count t-num">{completedCount}/{total}</span>
		</button>
	</div>
</div>

<style>
	.room {
		--bar-h: 3.75rem;
		--side-w: 23rem;
		min-height: 100vh;
		min-height: 100dvh;
		background: var(--background);
	}

	/* App bar */
	.bar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
		height: var(--bar-h);
		padding: 0 clamp(0.75rem, 2vw, 1.5rem);
		background: rgb(252 252 250 / 0.9);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
	}
	.bar-l {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.exit {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.84rem;
		color: var(--text-secondary);
		padding: 0.35rem 0.6rem 0.35rem 0.45rem;
		border-radius: var(--radius-md);
		transition: all var(--duration-normal) var(--ease-out);
	}
	.exit:hover {
		background: var(--surface-soft);
		color: var(--ink);
	}
	.exit :global(svg) {
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.exit:hover :global(svg) {
		transform: translateX(-3px);
	}
	.bar-c {
		display: grid;
		justify-items: center;
		line-height: 1.25;
		min-width: 0;
	}
	.bar-c .t-label {
		font-size: 0.6rem;
	}
	.c-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
	.bar-r {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}
	.bar-prog {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.pct {
		font-size: 1.05rem;
		color: var(--ink);
		min-width: 2.6rem;
		text-align: right;
	}
	.mini {
		width: 7.5rem;
	}
	.icon-btn {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--text-secondary);
		transition: all var(--duration-normal) var(--ease-out);
	}
	.icon-btn:hover {
		color: var(--ink);
		border-color: var(--border-strong);
	}

	/* Layout */
	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) var(--side-w);
		transition: grid-template-columns var(--duration-slow) var(--ease-out);
	}
	.collapsed .body {
		grid-template-columns: minmax(0, 1fr) 0rem;
	}
	.main {
		min-width: 0;
		padding: clamp(1rem, 2.4vw, 2rem) clamp(1rem, 3vw, 3rem) 5rem;
	}
	.video-wrap {
		position: relative;
		max-width: calc((100dvh - var(--bar-h) - 7rem) * 16 / 9);
		margin: 0 auto;
	}
	.collapsed .video-wrap {
		max-width: min(calc((100dvh - var(--bar-h) - 6rem) * 16 / 9), 80rem);
	}
	.video {
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-elevated);
		animation: lesson-in var(--duration-slow) var(--ease-out);
	}
	.skeleton {
		aspect-ratio: 16 / 9;
		background: var(--ink);
	}
	@keyframes lesson-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.995);
		}
	}

	.upnext {
		position: absolute;
		right: 1rem;
		top: 1rem;
		z-index: 5;
		width: min(20rem, calc(100% - 2rem));
		padding: 1.1rem 1.2rem 1.25rem;
		border-radius: var(--radius-md);
		background: rgb(23 25 22 / 0.92);
		backdrop-filter: blur(10px);
		color: #fff;
		overflow: hidden;
		box-shadow: var(--shadow-elevated);
		animation: lesson-in var(--duration-slow) var(--ease-out);
	}
	.upnext .t-label {
		color: var(--green-300);
	}
	.un-title {
		margin: 0.35rem 0 1rem;
		font-family: var(--font-display);
		font-size: 1.2rem;
		line-height: 1.2;
	}
	.un-actions {
		display: flex;
		gap: 0.4rem;
	}
	.upnext :global(.un-cancel) {
		--btn-fg: rgb(255 255 255 / 0.8);
		--btn-bg-hover: rgb(255 255 255 / 0.1);
	}
	.un-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: var(--green-300);
		transform-origin: left;
		transition: transform 1s linear;
	}

	/* Details */
	.details {
		max-width: 62rem;
		margin: clamp(2rem, 4vw, 3.25rem) auto 0;
	}
	.d-head {
		display: grid;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}
	.d-title {
		animation: lesson-in var(--duration-slow) var(--ease-out);
	}
	.d-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 4vw, 4rem);
		padding-bottom: 2.5rem;
	}
	.d-copy {
		display: grid;
		gap: 1.75rem;
		align-content: start;
	}
	.complete {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		width: fit-content;
		padding: 0.55rem 1rem 0.55rem 0.6rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-pill);
		background: var(--surface);
		font-size: 0.86rem;
		font-weight: 500;
		transition: all var(--duration-normal) var(--ease-out);
	}
	.complete:hover {
		border-color: var(--ink);
	}
	.c-box {
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		border: 1px solid var(--border-strong);
		color: transparent;
		transition: all var(--duration-normal) var(--ease-out);
	}
	.complete.on {
		background: var(--green-100);
		border-color: transparent;
		color: var(--green-700);
	}
	.complete.on .c-box {
		background: var(--brand-primary);
		border-color: var(--brand-primary);
		color: #fff;
		animation: pop-in var(--duration-slow) var(--ease-out);
	}
	@keyframes pop-in {
		0% {
			transform: scale(0.6);
		}
		60% {
			transform: scale(1.12);
		}
	}
	.d-points {
		padding-left: clamp(0rem, 2vw, 2rem);
		border-left: 1px solid var(--border);
	}
	.d-points ol {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.85rem;
	}
	.d-points li {
		display: grid;
		grid-template-columns: 2rem 1fr;
		font-size: 0.95rem;
		color: var(--text-primary);
	}
	.d-points .t-num {
		color: var(--brand-primary);
		font-size: 0.9rem;
	}

	.finished {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2.5rem;
		padding: 1.5rem;
		border-radius: var(--radius-lg);
		background: var(--green-100);
		color: var(--green-700);
	}
	.f-title {
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--ink);
	}

	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-top: 1px solid var(--border);
	}
	.pg {
		display: grid;
		gap: 0.4rem;
		padding: 1.5rem 0;
		border: 0;
		background: none;
		text-align: left;
		transition: opacity var(--duration-normal);
	}
	.pg:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.pg .t-label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.pg.next {
		text-align: right;
		justify-items: end;
		padding-left: 1.5rem;
		border-left: 1px solid var(--border);
	}
	.pg-title {
		font-family: var(--font-display);
		font-size: clamp(1.1rem, 1.8vw, 1.45rem);
		color: var(--ink);
		line-height: 1.2;
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.pg.prev:not(:disabled):hover .pg-title {
		transform: translateX(-4px);
	}
	.pg.next:not(:disabled):hover .pg-title {
		transform: translateX(4px);
		color: var(--brand-primary);
	}

	/* Sidebar */
	.side {
		position: sticky;
		top: var(--bar-h);
		height: calc(100dvh - var(--bar-h));
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--border);
		background: var(--surface);
		overflow: hidden;
		min-width: 0;
	}
	.collapsed .side {
		border-left-color: transparent;
	}
	.side-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1.4rem 1.4rem 0.9rem;
		min-width: var(--side-w);
	}
	.side-count {
		margin-top: 0.3rem;
		font-size: 0.88rem;
		color: var(--text-secondary);
	}
	.side-count .t-num {
		font-size: 1.15rem;
		color: var(--ink);
	}
	.side-prog {
		padding: 0 1.4rem 1rem;
		min-width: var(--side-w);
		border-bottom: 1px solid var(--border);
	}
	.side-list {
		flex: 1;
		overflow-y: auto;
		padding: 0 1rem 2rem;
		min-width: var(--side-w);
		overscroll-behavior: contain;
	}
	.handle,
	.scrim,
	.sheet-btn,
	.mobile-only {
		display: none;
	}

	@media (max-width: 1100px) {
		.room {
			--side-w: 20rem;
		}
		.mini {
			width: 5rem;
		}
	}

	/* ── Tablet & mobile: curriculum becomes a bottom sheet ── */
	@media (max-width: 900px) {
		.desktop-only {
			display: none;
		}
		.mobile-only {
			display: grid;
		}
		.body,
		.collapsed .body {
			grid-template-columns: minmax(0, 1fr);
		}
		.bar {
			grid-template-columns: auto 1fr auto;
		}
		.bar-c {
			justify-items: start;
		}
		.exit span {
			display: none;
		}
		.mini {
			display: none;
		}
		.main {
			padding-bottom: 7rem;
		}
		.video-wrap {
			max-width: none;
		}
		.d-grid {
			grid-template-columns: 1fr;
		}
		.d-points {
			border-left: 0;
			padding-left: 0;
			border-top: 1px solid var(--border);
			padding-top: 1.5rem;
		}

		.side {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			top: auto;
			z-index: 40;
			height: min(80dvh, 44rem);
			border: 0;
			border-radius: var(--radius-xl) var(--radius-xl) 0 0;
			box-shadow: 0 -20px 60px rgb(23 25 22 / 0.18);
			transform: translateY(102%);
			visibility: hidden;
			transition:
				transform var(--duration-slow) var(--ease-out),
				visibility 0s linear var(--duration-slow);
		}
		.side.open {
			transform: none;
			visibility: visible;
			transition: transform var(--duration-slow) var(--ease-out);
		}
		.side-head,
		.side-prog,
		.side-list {
			min-width: 0;
		}
		.handle {
			display: block;
			width: 2.5rem;
			height: 4px;
			margin: 0.6rem auto 0;
			border-radius: 2px;
			background: var(--border-strong);
		}
		.scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 39;
			border: 0;
			background: rgb(23 25 22 / 0.35);
			opacity: 0;
			pointer-events: none;
			transition: opacity var(--duration-slow) var(--ease-out);
		}
		.scrim.show {
			opacity: 1;
			pointer-events: auto;
		}
		.sheet-btn {
			position: fixed;
			left: 50%;
			bottom: max(1rem, env(safe-area-inset-bottom));
			z-index: 30;
			display: inline-flex;
			align-items: center;
			gap: 0.6rem;
			translate: -50% 0;
			height: 3rem;
			padding: 0 1.1rem;
			border: 0;
			border-radius: var(--radius-pill);
			background: var(--ink);
			color: #fff;
			font-size: 0.88rem;
			font-weight: 500;
			box-shadow: var(--shadow-elevated);
			white-space: nowrap;
		}
		.sb-count {
			padding-left: 0.6rem;
			border-left: 1px solid rgb(255 255 255 / 0.2);
			color: var(--green-300);
		}
	}

	@media (max-width: 560px) {
		.main {
			padding-inline: 0;
			padding-top: 0;
		}
		.video {
			border-radius: 0;
			box-shadow: none;
		}
		.details {
			padding: 0 var(--gutter);
		}
		.bar-c .t-label {
			display: none;
		}
		.pager {
			grid-template-columns: 1fr;
		}
		.pg.next {
			border-left: 0;
			border-top: 1px solid var(--border);
			padding-left: 0;
		}
		.finished {
			grid-template-columns: 1fr;
		}
		.upnext {
			left: 0.75rem;
			right: auto;
			top: 0.75rem;
			padding: 0.8rem 0.9rem 0.95rem;
		}
		.un-title {
			font-size: 1rem;
			margin-bottom: 0.7rem;
		}
	}
</style>
