<!--
	CourseCard — a rounded "lesson tile".
	The row of dots at the bottom is the course's lesson path: completed lessons
	are filled for enrolled learners, and on hover the path previews itself.
-->
<script lang="ts">
	import { ArrowRight, Clock, PlayCircle, Star } from '@lucide/svelte';
	import type { Course } from '$lib/types';
	import { getCategory } from '$lib/services/courseService';
	import { allLessons } from '$lib/utils/course';
	import { progress } from '$lib/stores/progress.svelte';
	import Avatar from './Avatar.svelte';
	import PriceTag from './PriceTag.svelte';
	import { site } from '$lib/data/catalog';
	import { formatPrice } from '$lib/utils/course';

	type Variant = 'feature' | 'tile' | 'row';

	interface Props {
		course: Course;
		variant?: Variant;
		/** Unique per page; enables the shared-element morph into the course page. */
		morph?: boolean;
	}

	let { course, variant = 'tile', morph = true }: Props = $props();

	const category = $derived(getCategory(course.category));
	const lessons = $derived(allLessons(course));
	const enrolled = $derived(progress.ready && progress.isEnrolled(course.id));
	const pct = $derived(enrolled ? progress.percent(course) : 0);
	const path = $derived(
		lessons.slice(0, 16).map((l) => (enrolled ? progress.isCompleted(course.id, l.id) : false))
	);
</script>

<a
	href="/courses/{course.id}"
	class="card {variant}"
	aria-label="{course.title} — {category.name}, {course.level}, {course.duration}, {formatPrice(course.price.offer, site.currency, site.locale)}"
>
	<div class="cover tone-{course.tone}">
		<img
			src={course.thumbnail}
			alt=""
			loading="lazy"
			decoding="async"
			width="1600"
			height="1000"
			style:view-transition-name={morph ? `cover-${course.id}` : undefined}
		/>
		<span class="pill cat">{category.name}</span>
		{#if enrolled}
			<span class="pill status">{pct === 100 ? 'Completed' : `${pct}% done`}</span>
		{:else}
			<span class="pill lvl">{course.level}</span>
		{/if}
	</div>

	<div class="body">
		<h3 class="title">{course.title}</h3>
		{#if variant !== 'tile'}
			<p class="sub">{course.subtitle}</p>
		{/if}

		<div class="who">
			<Avatar person={course.instructor} size={26} />
			<span>{course.instructor.name}</span>
		</div>

		<div class="facts">
			<span><Clock size={14} strokeWidth={1.6} aria-hidden="true" />{course.duration}</span>
			<span><PlayCircle size={14} strokeWidth={1.6} aria-hidden="true" />{lessons.length} lessons</span>
			<span class="rating"><Star size={13} strokeWidth={0} fill="currentColor" aria-hidden="true" />{course.rating.toFixed(1)}</span>
		</div>

		<span class="path" aria-hidden="true">
			{#each path as done, i (i)}
				<i class:done style="--i:{i}"></i>
			{/each}
		</span>
		<div class="foot">
			<PriceTag price={course.price} size={variant === 'feature' ? 'md' : 'sm'} />
			<span class="go" aria-hidden="true"><ArrowRight size={16} strokeWidth={1.8} /></span>
		</div>
	</div>
</a>

<style>
	.card {
		--pad: 0.7rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: var(--pad);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.06),
			var(--shadow-subtle);
		color: var(--text-primary);
		transition:
			transform var(--duration-slow) var(--ease-out),
			box-shadow var(--duration-slow) var(--ease-out);
	}
	.card:hover,
	.card:focus-visible {
		transform: translateY(-6px);
		box-shadow:
			0 0 0 1px rgb(90 138 69 / 0.25),
			var(--shadow-elevated);
	}

	/* Cover — inset with its own radius */
	.cover {
		position: relative;
		overflow: hidden;
		aspect-ratio: 16 / 10;
		border-radius: calc(var(--radius-xl) - var(--pad));
		background: var(--surface-soft);
		isolation: isolate;
	}
	.tone-ink {
		background: var(--ink);
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 1.3s var(--ease-out);
	}
	.card:hover .cover img {
		transform: scale(1.06);
	}
	.pill {
		position: absolute;
		top: 0.7rem;
		display: inline-flex;
		align-items: center;
		height: 1.7rem;
		padding: 0 0.7rem;
		border-radius: var(--radius-pill);
		background: rgb(252 252 250 / 0.88);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		font-size: 0.74rem;
		font-weight: 500;
		color: var(--ink);
	}
	.cat {
		left: 0.7rem;
	}
	.lvl,
	.status {
		right: 0.7rem;
		color: var(--text-secondary);
	}
	.status {
		background: var(--brand-primary);
		color: #fff;
	}

	/* Body */
	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 1.1rem 0.6rem 0.35rem;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.4rem;
		line-height: 1.15;
		letter-spacing: -0.015em;
	}
	.sub {
		margin-top: -0.3rem;
		color: var(--text-secondary);
		font-size: 0.95rem;
	}
	.who {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.facts span {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 1.75rem;
		padding: 0 0.6rem;
		border-radius: var(--radius-pill);
		background: var(--surface-soft);
		font-size: 0.76rem;
		color: var(--text-secondary);
	}
	.facts .rating {
		background: var(--green-100);
		color: var(--green-700);
		font-weight: 500;
	}

	/* Lesson path + action */
	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--border);
	}
	.path {
		margin-top: auto;
		padding-top: 0.4rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}
	.feature .foot {
		border-top-color: rgb(90 138 69 / 0.2);
	}
	.path i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--border-strong);
		transition:
			background var(--duration-normal) var(--ease-out),
			transform var(--duration-normal) var(--ease-out);
	}
	.path i.done {
		background: var(--brand-primary);
	}
	.card:hover .path i:not(.done) {
		background: var(--green-300);
		transform: scale(1.15);
		transition-delay: calc(var(--i) * 30ms);
	}
	.go {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		flex: none;
		border-radius: 50%;
		background: var(--surface-soft);
		color: var(--ink);
		transform: rotate(-45deg);
		transition:
			transform var(--duration-slow) var(--ease-out),
			background var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out);
	}
	.card:hover .go,
	.card:focus-visible .go {
		transform: rotate(0);
		background: var(--brand-primary);
		color: #fff;
	}

	/* ── Feature: wide tile, cover left ─────────────── */
	.feature {
		--pad: 0.8rem;
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
		gap: 0.5rem;
		background: var(--green-100);
		box-shadow: none;
	}
	.feature:hover {
		box-shadow: var(--shadow-elevated);
	}
	.feature .cover {
		aspect-ratio: auto;
		min-height: 22rem;
	}
	.feature .body {
		padding: 1.5rem 1.25rem 0.6rem 1.25rem;
		gap: 1rem;
	}
	.feature .title {
		font-size: clamp(1.9rem, 3vw, 2.7rem);
		line-height: 1.05;
	}
	.feature .facts span {
		background: rgb(255 255 255 / 0.7);
	}
	.feature .facts .rating {
		background: var(--brand-primary);
		color: #fff;
	}
	.feature .go {
		width: 3rem;
		height: 3rem;
		background: var(--ink);
		color: #fff;
	}
	.feature .path i {
		background: rgb(90 138 69 / 0.25);
	}

	/* ── Row: dense list tile ───────────────────────── */
	.row {
		display: grid;
		grid-template-columns: 11rem minmax(0, 1fr);
		gap: 1.25rem;
		align-items: center;
	}
	.row:hover {
		transform: translateY(-3px);
	}
	.row .cover {
		aspect-ratio: 4 / 3;
	}
	.row .pill {
		display: none;
	}
	.row .body {
		padding: 0.4rem 0.6rem 0.4rem 0;
		gap: 0.55rem;
	}
	.row .title {
		font-size: 1.35rem;
	}
	.row .sub {
		font-size: 0.88rem;
	}

	@media (max-width: 860px) {
		.feature {
			grid-template-columns: 1fr;
		}
		.feature .cover {
			min-height: 0;
			aspect-ratio: 16 / 10;
		}
		.feature .body {
			padding: 1.1rem 0.6rem 0.4rem;
		}
	}
	@media (max-width: 560px) {
		.row {
			grid-template-columns: 6.5rem minmax(0, 1fr);
			gap: 0.9rem;
		}
		.row .sub,
		.row .who {
			display: none;
		}
		.row .title {
			font-size: 1.1rem;
		}
		.row .go,
		.row .path {
			display: none;
		}
		.row .foot {
			border-top: 0;
			padding-top: 0.2rem;
		}
		.path {
			gap: 3px;
		}
		.path i {
			width: 5px;
			height: 5px;
		}
	}
</style>
