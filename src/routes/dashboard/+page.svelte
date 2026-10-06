<script lang="ts">
	import { ArrowRight, Check, PlayCircle, Flag, Award, Sparkles } from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import { reveal } from '$lib/motion/actions';
	import { progress, dayKey } from '$lib/stores/progress.svelte';
	import { courses, SEEDED_COURSE_ID } from '$lib/data/catalog';
	import { getCourseSync, getCategory } from '$lib/services/courseService';
	import { allLessons, findLesson, lessonCount } from '$lib/utils/course';
	import type { ActivityType } from '$lib/services/progressRepository';

	const hour = new Date().getHours();
	const greeting = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
	const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

	const enrolled = $derived(
		progress.ready ? progress.enrolledIds().map((id) => getCourseSync(id)!).filter(Boolean) : []
	);
	const current = $derived(enrolled.find((c) => progress.percent(c) < 100) ?? enrolled[0]);
	const currentLesson = $derived(
		current ? findLesson(current, progress.get(current.id)?.currentLessonId)?.lesson : null
	);
	const pct = $derived(current ? progress.percent(current) : 0);

	const streak = $derived(progress.ready ? progress.streak() : 0);
	const last14 = $derived(
		Array.from({ length: 14 }, (_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - (13 - i));
			return {
				key: dayKey(d),
				active: progress.state.activeDays.includes(dayKey(d)),
				label: d.toLocaleDateString('en', { weekday: 'narrow' }),
				today: i === 13
			};
		})
	);

	const suggestions = $derived(courses.filter((c) => !enrolled.some((e) => e.id === c.id) && c.featured).slice(0, 2));

	const verbs: Record<ActivityType, string> = {
		enrolled: 'Started the course',
		started: 'Began',
		completed: 'Completed',
		'course-completed': 'Finished the course'
	};
	const icons = { enrolled: Flag, started: PlayCircle, completed: Check, 'course-completed': Award };

	function ago(iso: string) {
		const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
		if (mins < 1) return 'Just now';
		if (mins < 60) return `${mins} min ago`;
		const h = Math.round(mins / 60);
		if (h < 24) return `${h} h ago`;
		const d = Math.round(h / 24);
		return d === 1 ? 'Yesterday' : `${d} days ago`;
	}

	const activity = $derived(
		progress.state.activity.slice(0, 7).map((a) => {
			const course = getCourseSync(a.courseId);
			const lesson = course && a.lessonId ? findLesson(course, a.lessonId)?.lesson : null;
			return { ...a, course, lesson };
		})
	);

	function preview() {
		progress.seedDemo(getCourseSync(SEEDED_COURSE_ID)!);
	}
</script>

<svelte:head>
	<title>My learning — SymphoLearn</title>
</svelte:head>

<div class="dash container-x" use:reveal>
	<header class="hello">
		<p class="eyebrow" data-reveal>{today}</p>
		<h1 class="t-display greet" data-reveal>{greeting}.</h1>
		<p class="t-h2 sub" data-reveal>
			{#if !progress.ready}&nbsp;{:else if current}Continue <em class="italic-accent">learning.</em>{:else}Let’s find your <em class="italic-accent">first</em> lesson.{/if}
		</p>
	</header>

	{#if progress.ready && current}
		<!-- Current course -->
		<section class="now" data-reveal aria-label="Current course">
			<a class="now-media" href="/learn/{current.id}">
				<img src={current.thumbnail} alt="" width="1600" height="1000" style:view-transition-name="cover-{current.id}" />
				<span class="play"><PlayCircle size={22} strokeWidth={1.4} /></span>
			</a>
			<div class="now-copy">
				<p class="t-label cat">{getCategory(current.category).name}</p>
				<h2 class="t-h2 now-title">{current.title}</h2>
				{#if currentLesson}
					<p class="next-up">
						<span class="t-label">Up next</span>
						Lesson {currentLesson.number} · {currentLesson.title}
					</p>
				{/if}
				<div class="now-prog">
					<p><span class="t-num big">{pct}</span><span class="t-num pc">%</span> <span class="lbl">complete</span></p>
					<ProgressBar
						value={pct}
						segments={lessonCount(current)}
						completed={allLessons(current).map((l) => progress.isCompleted(current.id, l.id))}
					/>
				</div>
				<Button href="/learn/{current.id}" size="lg" arrow magnetic>Continue</Button>
			</div>
		</section>

		<div class="grid">
			<!-- Streak -->
			<section class="streak" data-reveal aria-label="Learning streak">
				<p class="t-label">Learning streak</p>
				<p class="s-num"><span class="t-num">{streak}</span> <span>{streak === 1 ? 'day' : 'days'}</span></p>
				<ol class="days" aria-label="Last 14 days">
					{#each last14 as d (d.key)}
						<li class:on={d.active} class:today={d.today} title={d.key}>
							<span class="dot"></span>
							<span class="dl">{d.label}</span>
							<span class="sr-only">{d.key}: {d.active ? 'active' : 'no activity'}</span>
						</li>
					{/each}
				</ol>
				<p class="s-note">{streak ? 'A little every day beats a lot once in a while.' : 'Watch one lesson today to start a streak.'}</p>
			</section>

			<!-- Your courses -->
			<section class="mine" data-reveal aria-labelledby="mine-h">
				<div class="sec-head">
					<h2 id="mine-h" class="t-label">Your courses</h2>
					<a href="/courses" class="link">Browse <ArrowRight size={13} /></a>
				</div>
				<ul>
					{#each enrolled as c (c.id)}
						{@const p = progress.percent(c)}
						<li>
							<a href="/learn/{c.id}">
								<img src={c.thumbnail} alt="" width="96" height="60" />
								<span class="m-title">{c.title}</span>
								<span class="m-prog">
									<ProgressBar value={p} size="xs" label="{c.title} progress" />
									<span class="t-num">{p}%</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Activity -->
			<section class="activity" data-reveal aria-labelledby="act-h">
				<h2 id="act-h" class="t-label">Recent activity</h2>
				<ol>
					{#each activity as a (a.id)}
						{@const Icon = icons[a.type]}
						<li class={a.type}>
							<span class="a-ico"><Icon size={13} strokeWidth={2} /></span>
							<span class="a-text">
								{verbs[a.type]}
								<strong>{a.lesson ? a.lesson.title : a.course?.title}</strong>
							</span>
							<span class="a-when">{ago(a.at)}</span>
						</li>
					{/each}
				</ol>
			</section>
		</div>
	{:else if progress.ready}
		<!-- Empty state -->
		<section class="empty" data-reveal>
			<div class="e-copy">
				<p>
					Nothing in progress — yet. Most people begin with <strong>Full Stack Web Development</strong>; its
					first lesson takes under a minute.
				</p>
				<div class="e-actions">
					<Button href="/learn/{SEEDED_COURSE_ID}" size="lg" arrow magnetic>Watch lesson 01</Button>
					<Button variant="ghost" size="lg" onclick={preview}>
						{#snippet icon()}<Sparkles size={16} strokeWidth={1.5} />{/snippet}
						Preview with sample progress
					</Button>
				</div>
			</div>
		</section>
	{/if}

	{#if progress.ready && suggestions.length}
		<section class="suggest" aria-labelledby="sug-h">
			<div class="sec-head" data-reveal>
				<h2 id="sug-h" class="t-label">{current ? 'When you’re ready for more' : 'Good places to start'}</h2>
			</div>
			<div class="sug-grid">
				{#each suggestions as c, i (c.id)}
					<div class="sug-{i}" data-reveal><CourseCard course={c} morph={c.id !== current?.id} /></div>
				{/each}
			</div>
		</section>
	{/if}

	{#if progress.ready && enrolled.length}
		<p class="reset">
			Progress is stored in this browser.
			<button onclick={() => confirm('Reset all learning progress on this device?') && progress.reset()}>Reset progress</button>
		</p>
	{/if}
</div>
<style>
	.dash {
		padding-top: calc(var(--nav-height) + clamp(3rem, 8vw, 6.5rem));
		padding-bottom: var(--section-space);
	}
	.hello {
		display: grid;
		gap: 0.75rem;
		margin-bottom: clamp(3rem, 6vw, 5rem);
	}
	.greet {
		font-size: clamp(3.2rem, 9vw, 7.5rem);
	}
	.sub {
		margin-left: clamp(0rem, 16vw, 16rem);
		color: var(--text-secondary);
		min-height: 1.1em;
	}

	/* Current course */
	.now {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 4vw, 4rem);
		align-items: center;
		padding-bottom: clamp(3rem, 6vw, 5rem);
		border-bottom: 1px solid var(--border);
	}
	.now-media {
		position: relative;
		display: block;
		aspect-ratio: 16 / 10;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-elevated);
	}
	.now-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 1.2s var(--ease-out);
	}
	.now-media:hover img {
		transform: scale(1.04);
	}
	.play {
		position: absolute;
		left: 1.25rem;
		bottom: 1.25rem;
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 50%;
		background: var(--paper);
		color: var(--ink);
		transition: all var(--duration-slow) var(--ease-out);
	}
	.now-media:hover .play {
		background: var(--brand-primary);
		color: #fff;
		transform: scale(1.06);
	}
	.now-copy {
		display: grid;
		gap: 1.25rem;
		justify-items: start;
	}
	.cat {
		color: var(--brand-primary);
	}
	.next-up {
		display: grid;
		gap: 0.2rem;
		color: var(--ink);
	}
	.now-prog {
		width: 100%;
		display: grid;
		gap: 0.75rem;
		margin: 0.5rem 0 0.75rem;
	}
	.now-prog p {
		display: flex;
		align-items: flex-start;
		gap: 0.1rem;
	}
	.big {
		font-size: 4.5rem;
		line-height: 0.9;
		color: var(--ink);
	}
	.pc {
		font-size: 1.6rem;
		color: var(--brand-primary);
	}
	.lbl {
		align-self: flex-end;
		margin-left: 0.6rem;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	/* Grid below */
	.grid {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: clamp(2rem, 4vw, 3.5rem);
		padding: clamp(3rem, 6vw, 5rem) 0;
	}
	.streak {
		grid-column: 1 / span 4;
	}
	.mine {
		grid-column: 6 / span 7;
	}
	.activity {
		grid-column: 3 / span 8;
		margin-top: 1rem;
	}
	.sec-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 1.25rem;
	}
	.link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.84rem;
		color: var(--ink);
	}

	.s-num {
		margin: 0.75rem 0 1.5rem;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		color: var(--text-secondary);
	}
	.s-num .t-num {
		font-size: 4.5rem;
		line-height: 0.9;
		color: var(--ink);
	}
	.days {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(14, 1fr);
		gap: 4px;
	}
	.days li {
		display: grid;
		justify-items: center;
		gap: 0.4rem;
	}
	.days .dot {
		width: 100%;
		aspect-ratio: 1 / 2.2;
		border-radius: 3px;
		background: var(--border);
		transition: background var(--duration-slow) var(--ease-out);
	}
	.days li.on .dot {
		background: var(--brand-primary);
	}
	.days li.today .dot {
		box-shadow: 0 0 0 1.5px var(--background), 0 0 0 2.5px var(--ink);
	}
	.dl {
		font-size: 0.62rem;
		color: var(--text-muted);
	}
	.s-note {
		margin-top: 1.25rem;
		font-size: 0.88rem;
		color: var(--text-secondary);
	}

	.mine ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--border);
	}
	.mine li a {
		display: grid;
		grid-template-columns: 6rem minmax(0, 1fr) 9rem;
		gap: 1.25rem;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
		transition: padding var(--duration-slow) var(--ease-out);
	}
	.mine li a:hover {
		padding-left: 0.5rem;
	}
	.mine img {
		width: 6rem;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	.m-title {
		font-family: var(--font-display);
		font-size: 1.2rem;
		color: var(--ink);
	}
	.m-prog {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.95rem;
	}

	.activity ol {
		list-style: none;
		margin: 1.25rem 0 0;
		padding: 0;
		position: relative;
	}
	.activity ol::before {
		content: '';
		position: absolute;
		left: 0.7rem;
		top: 0.5rem;
		bottom: 0.5rem;
		width: 1px;
		background: var(--border);
	}
	.activity li {
		position: relative;
		display: grid;
		grid-template-columns: 1.4rem minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: center;
		padding: 0.75rem 0;
		font-size: 0.92rem;
		color: var(--text-secondary);
	}
	.a-ico {
		display: grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		background: var(--background);
		border: 1px solid var(--border-strong);
		color: var(--text-secondary);
		z-index: 1;
	}
	.completed .a-ico,
	.course-completed .a-ico {
		background: var(--brand-primary);
		border-color: var(--brand-primary);
		color: #fff;
	}
	.a-text strong {
		font-weight: 500;
		color: var(--ink);
	}
	.a-when {
		font-size: 0.78rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* Empty */
	.empty {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		padding-bottom: clamp(3rem, 6vw, 5rem);
		border-bottom: 1px solid var(--border);
	}
	.e-copy {
		grid-column: 5 / span 7;
		display: grid;
		gap: 2rem;
		font-size: 1.15rem;
		color: var(--text-secondary);
	}
	.e-copy strong {
		font-weight: 500;
		color: var(--ink);
	}
	.e-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.suggest {
		padding-top: clamp(3rem, 6vw, 5rem);
	}
	.sug-grid {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 2rem;
	}
	.sug-0 {
		grid-column: 1 / span 5;
	}
	.sug-1 {
		grid-column: 6 / span 5;
	}

	.reset {
		margin-top: 5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.reset button {
		border: 0;
		background: none;
		padding: 0;
		margin-left: 0.4rem;
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (max-width: 960px) {
		.now,
		.grid,
		.sug-grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.sug-grid > div {
			grid-column: 1 / -1 !important;
		}
		.streak,
		.mine,
		.activity {
			grid-column: 1 / -1;
		}
		.e-copy {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 560px) {
		.mine li a {
			grid-template-columns: 4.5rem minmax(0, 1fr);
		}
		.mine img {
			width: 4.5rem;
		}
		.m-prog {
			grid-column: 2;
		}
		.sug-0,
		.sug-1 {
			grid-column: 1 / -1;
			margin-top: 0;
		}

		.activity li {
			grid-template-columns: 1.4rem minmax(0, 1fr);
		}
		.a-when {
			grid-column: 2;
			margin-top: -0.6rem;
		}
	}
</style>
