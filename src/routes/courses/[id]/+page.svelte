<script lang="ts">
	import { goto } from '$app/navigation';
	import { Star, Users, Clock, BarChart3, PlayCircle, Globe, RefreshCw, Check, Infinity as InfinityIcon } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import CoursePreview from '$lib/components/CoursePreview.svelte';
	import LessonList from '$lib/components/LessonList.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { site } from '$lib/data/catalog';
	import { reveal } from '$lib/motion/actions';
	import { getCategory } from '$lib/services/courseService';
	import { progress } from '$lib/stores/progress.svelte';
	import { allLessons, findLesson, formatStudents, lessonCount } from '$lib/utils/course';

	let { data } = $props();

	const course = $derived(data.course);
	const category = $derived(getCategory(course.category));
	const total = $derived(lessonCount(course));
	const enrolled = $derived(progress.ready && progress.isEnrolled(course.id));
	const pct = $derived(enrolled ? progress.percent(course) : 0);
	const current = $derived(enrolled ? findLesson(course, progress.get(course.id)?.currentLessonId)?.lesson : null);

	const ctaLabel = $derived(!enrolled ? 'Enroll now' : pct === 100 ? 'Review course' : 'Continue learning');

	/** New learners go through the enrollment form; enrolled ones straight back to the lessons. */
	function start() {
		if (!enrolled) return goto(`/courses/${course.id}/enroll`);
		progress.enroll(course);
		goto(`/learn/${course.id}`);
	}

	const updated = $derived(
		new Date(`${course.updated}-01`).toLocaleDateString('en', { month: 'long', year: 'numeric' })
	);
</script>

<svelte:head>
	<title>{course.title} — SymphoLearn</title>
	<meta name="description" content={course.subtitle} />
</svelte:head>

<article class="course">
	<!-- Hero -->
	<header class="hero container-x editorial-grid" use:reveal>
		<nav class="crumb t-label" aria-label="Breadcrumb" data-reveal>
			<a href="/courses">Course</a>
			<span aria-hidden="true">/</span>
			<a href="/courses?category={category.id}">{category.name}</a>
		</nav>

		<div class="hero-copy">
			<h1 class="t-h1" data-reveal>{course.title}</h1>
			<p class="sub" data-reveal>{course.subtitle}</p>

			<div class="cta" data-reveal>
				<Button size="lg" arrow magnetic onclick={start}>{ctaLabel}</Button>
				{#if enrolled && current}
					<span class="resume">Lesson {current.number} · {current.title}</span>
				{:else}
					<div class="hero-price"><PriceTag price={course.price} size="md" /></div>
				{/if}
			</div>
		</div>

		<div class="hero-media" data-reveal>
			<CoursePreview {course} />
		</div>

		<dl class="facts" data-reveal>
			<div><dt><BarChart3 size={15} strokeWidth={1.5} /> Level</dt><dd>{course.level}</dd></div>
			<div><dt><Clock size={15} strokeWidth={1.5} /> Duration</dt><dd>{course.duration}</dd></div>
			<div><dt><PlayCircle size={15} strokeWidth={1.5} /> Lessons</dt><dd>{total}</dd></div>
			<div>
				<dt><Star size={15} strokeWidth={1.5} /> Rating</dt>
				<dd>{course.rating.toFixed(1)} <span class="muted">({course.ratingCount.toLocaleString()})</span></dd>
			</div>
			<div><dt><Users size={15} strokeWidth={1.5} /> Learners</dt><dd>{formatStudents(course.students)}</dd></div>
		</dl>
	</header>

	<div class="layout container-x">
		<div class="content">
			<!-- Overview -->
			<section class="block" use:reveal>
				<h2 class="t-label" data-reveal>Overview</h2>
				<p class="overview" data-reveal>{course.description}</p>
			</section>

			<!-- Outcomes -->
			<section class="block" use:reveal>
				<h2 class="t-label" data-reveal>What you’ll learn</h2>
				<ul class="outcomes">
					{#each course.outcomes as o, i (o)}
						<li data-reveal>
							<span class="t-num">{String(i + 1).padStart(2, '0')}</span>
							<span>{o}</span>
						</li>
					{/each}
				</ul>
				<div class="skills" data-reveal>
					{#each course.skills as s (s)}<span>{s}</span>{/each}
				</div>
			</section>

			<!-- Curriculum -->
			<section class="block" id="curriculum" use:reveal>
				<div class="block-head" data-reveal>
					<h2 class="t-label">Curriculum</h2>
					<p class="t-small muted">{course.sections.length} sections · {total} lessons · {course.duration}</p>
				</div>
				<div data-reveal>
					<LessonList {course} currentLessonId={enrolled ? (progress.get(course.id)?.currentLessonId ?? null) : null} showPreview />
				</div>
			</section>

			<!-- Instructor -->
			<section class="block instructor" use:reveal>
				<h2 class="t-label" data-reveal>Your instructor</h2>
				<div class="ins" data-reveal>
					<Avatar person={course.instructor} size={72} />
					<div>
						<p class="ins-name">{course.instructor.name}</p>
						<p class="ins-role">{course.instructor.role}</p>
					</div>
				</div>
				<p class="ins-bio" data-reveal>{course.instructor.bio}</p>
			</section>

			<!-- Requirements -->
			<section class="block" use:reveal>
				<h2 class="t-label" data-reveal>Before you begin</h2>
				<ul class="reqs">
					{#each course.requirements as r (r)}
						<li data-reveal><Check size={15} strokeWidth={2} /> {r}</li>
					{/each}
				</ul>
			</section>

			<!-- Reviews -->
			{#if course.reviews.length}
				<section class="block" use:reveal>
					<div class="block-head" data-reveal>
						<h2 class="t-label">Learners say</h2>
						<p class="score"><span class="t-num">{course.rating.toFixed(1)}</span> / 5 from {course.ratingCount.toLocaleString()} reviews</p>
					</div>
					<div class="reviews">
						{#each course.reviews as r, i (r.id)}
							<figure class="review" class:lead={i === 0} data-reveal>
								<div class="stars" aria-label="{r.rating} out of 5 stars">
									{#each Array(5) as _, k (k)}
										<Star size={13} strokeWidth={0} fill={k < r.rating ? 'currentColor' : 'var(--border-strong)'} />
									{/each}
								</div>
								<blockquote>“{r.body}”</blockquote>
								<figcaption>
									<Avatar person={{ name: r.author, avatar: '' }} size={32} />
									<span><strong>{r.author}</strong>{r.role}</span>
								</figcaption>
							</figure>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<!-- Enrollment panel -->
		<aside class="enroll">
			<div class="panel">
				{#if enrolled}
					<p class="t-label">Your progress</p>
					<p class="p-big"><span class="t-num">{pct}</span><span class="t-num pc">%</span></p>
					<ProgressBar value={pct} segments={total} completed={allLessons(course).map((l) => progress.isCompleted(course.id, l.id))} />
					<p class="p-meta">{progress.get(course.id)?.completedLessons.length ?? 0} of {total} lessons complete</p>
				{:else}
					<p class="t-label">{site.offerNote}</p>
					<PriceTag price={course.price} size="lg" note />
					<p class="p-meta">Lifetime access to every lesson, with a certificate when you finish.</p>
				{/if}
				<Button full size="lg" arrow onclick={start}>{ctaLabel}</Button>
				<ul class="includes">
					<li><PlayCircle size={15} strokeWidth={1.5} /> {total} video lessons · {course.duration}</li>
					<li><InfinityIcon size={15} strokeWidth={1.5} /> Learn at your own pace</li>
					<li><Globe size={15} strokeWidth={1.5} /> {course.language}</li>
					<li><RefreshCw size={15} strokeWidth={1.5} /> Updated {updated}</li>
				</ul>
			</div>
		</aside>
	</div>

	<!-- Related -->
	<section class="related container-x" use:reveal>
		<div class="rel-head" data-reveal>
			<p class="eyebrow">Keep going</p>
			<h2 class="t-h2">Where this <em class="italic-accent">leads.</em></h2>
		</div>
		<div class="rel-grid">
			{#each data.related as c, i (c.id)}
				<div class="rel-{i}" data-reveal><CourseCard course={c} /></div>
			{/each}
		</div>
	</section>
</article>

<style>
	.hero {
		padding-top: calc(var(--nav-height) + clamp(2.5rem, 6vw, 5rem));
		padding-bottom: clamp(3rem, 6vw, 5rem);
		row-gap: 2rem;
		align-items: start;
	}
	.crumb {
		grid-column: 1 / -1;
		display: flex;
		gap: 0.6rem;
	}
	.crumb a {
		transition: color var(--duration-normal);
	}
	.crumb a:hover {
		color: var(--ink);
	}
	.crumb a:last-child {
		color: var(--brand-primary);
	}
	.hero-copy {
		grid-column: 1 / span 6;
		display: grid;
		gap: 1.5rem;
		padding-top: 1rem;
	}
	.hero-copy h1 {
		font-size: clamp(2.6rem, 5.4vw, 5rem);
	}
	.sub {
		font-size: clamp(1.1rem, 1.6vw, 1.35rem);
		color: var(--text-secondary);
		max-width: 28rem;
		margin-left: clamp(0rem, 6vw, 5rem);
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem 1.5rem;
		margin-top: 1rem;
	}
	.resume {
		font-size: 0.86rem;
		color: var(--text-muted);
	}
	.hero-media {
		grid-column: 7 / span 6;
		margin-top: clamp(0rem, 7vw, 6rem);
	}
	.facts {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin: 2rem 0 0;
		border-top: 1px solid var(--border);
	}
	.facts div {
		flex: 1 1 9rem;
		padding: 1.25rem 1.25rem 0 0;
	}
	.facts dt {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}
	.facts dd {
		margin: 0.3rem 0 0;
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--ink);
	}
	.muted {
		color: var(--text-muted);
		font-family: var(--font-body);
		font-size: 0.8rem;
	}

	/* Body */
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 22rem;
		gap: clamp(2rem, 6vw, 6rem);
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}
	.content {
		max-width: 46rem;
	}
	.block {
		padding: clamp(2.5rem, 5vw, 4rem) 0;
		border-bottom: 1px solid var(--border);
		scroll-margin-top: calc(var(--nav-height) + 1rem);
	}
	.block:last-child {
		border-bottom: 0;
	}
	.block > .t-label,
	.block-head {
		margin-bottom: 1.75rem;
	}
	.block-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.overview {
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 2.2vw, 1.85rem);
		line-height: 1.4;
		color: var(--ink);
		letter-spacing: -0.01em;
	}
	.outcomes {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 2.5rem;
	}
	.outcomes li {
		display: grid;
		grid-template-columns: 2.25rem 1fr;
		padding: 1rem 0;
		border-top: 1px solid var(--border);
		font-size: 0.98rem;
	}
	.outcomes .t-num {
		color: var(--brand-primary);
	}
	.skills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 1.75rem;
	}
	.skills span {
		padding: 0.35rem 0.75rem;
		border-radius: var(--radius-pill);
		background: var(--surface-soft);
		border: 1px solid var(--border);
		font-size: 0.8rem;
	}

	.ins {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.ins-name {
		font-family: var(--font-display);
		font-size: 1.75rem;
		color: var(--ink);
		line-height: 1.1;
	}
	.ins-role {
		font-size: 0.88rem;
		color: var(--text-secondary);
		margin-top: 0.3rem;
	}
	.ins-bio {
		margin: 1.5rem 0 0 calc(72px + 1.25rem);
		color: var(--text-secondary);
		max-width: 34rem;
	}

	.reqs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.8rem;
	}
	.reqs li {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}
	.reqs :global(svg) {
		margin-top: 0.3rem;
		color: var(--brand-primary);
		flex: none;
	}

	.score {
		font-size: 0.88rem;
		color: var(--text-secondary);
	}
	.score .t-num {
		font-size: 1.6rem;
		color: var(--ink);
	}
	.reviews {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}
	.review {
		margin: 0;
		padding: 1.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		display: grid;
		gap: 1rem;
		align-content: start;
	}
	.review.lead {
		grid-column: 1 / -1;
		border: 0;
		padding: 0 0 1.5rem;
		background: none;
	}
	.review.lead blockquote {
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 2.6vw, 2rem);
		line-height: 1.3;
		color: var(--ink);
	}
	.stars {
		display: flex;
		gap: 2px;
		color: var(--brand-primary);
	}
	blockquote {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}
	.review figcaption {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.review figcaption span {
		display: grid;
	}
	.review strong {
		font-weight: 500;
		color: var(--ink);
	}

	/* Enrollment */
	.enroll {
		position: relative;
	}
	.panel {
		position: sticky;
		top: calc(var(--nav-height) + 1.5rem);
		margin-top: clamp(2.5rem, 5vw, 4rem);
		padding: 1.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-soft);
		display: grid;
		gap: 1.1rem;
	}
	.p-big .t-num {
		font-size: 3.25rem;
		line-height: 1;
		color: var(--ink);
	}
	.p-big {
		display: flex;
		align-items: flex-start;
	}
	.pc {
		font-size: 1.5rem !important;
		color: var(--brand-primary) !important;
		margin-top: 0.3rem;
	}
	.p-meta {
		font-size: 0.86rem;
		color: var(--text-secondary);
	}
	.includes {
		list-style: none;
		margin: 0.25rem 0 0;
		padding: 1.1rem 0 0;
		border-top: 1px solid var(--border);
		display: grid;
		gap: 0.6rem;
		font-size: 0.84rem;
		color: var(--text-secondary);
	}
	.includes li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	/* Related */
	.related {
		padding-top: var(--section-space);
		padding-bottom: var(--section-space);
		border-top: 1px solid var(--border);
		margin-top: 2rem;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: 2rem;
	}
	.rel-head {
		grid-column: 1 / span 4;
		display: grid;
		gap: 1rem;
		align-content: start;
	}
	.rel-grid {
		grid-column: 5 / -1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}


	@media (max-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 18rem;
			gap: 2.5rem;
		}
	}
	@media (max-width: 860px) {
		.hero-copy,
		.hero-media {
			grid-column: 1 / -1;
		}
		.hero-media {
			margin-top: 0.5rem;
		}
		.layout {
			grid-template-columns: 1fr;
			padding-top: 0;
		}
		.enroll {
			order: -1;
		}
		.panel {
			position: static;
			margin-top: 2rem;
		}
		.outcomes,
		.reviews {
			grid-template-columns: 1fr;
		}
		.ins-bio {
			margin-left: 0;
		}
		.related {
			grid-template-columns: minmax(0, 1fr);
		}
		.rel-head,
		.rel-grid {
			grid-column: 1 / -1;
		}
		.rel-head {
			margin-bottom: 2.5rem;
		}
	}
	@media (max-width: 560px) {
		.rel-grid {
			grid-template-columns: 1fr;
		}

		.facts div {
			flex-basis: 40%;
		}
	}
</style>
