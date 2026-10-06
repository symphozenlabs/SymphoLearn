<!--
	HeroStory — a pinned, scroll-scrubbed narrative in five beats:
	CURIOSITY → DISCOVERY → LEARNING → PROGRESS → TRANSFORMATION

	A single green dot (the period of the first sentence) is the learner.
	It travels through every beat: bullet → active lesson → progress head → seal.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Check, Play, Award, ArrowDown } from '@lucide/svelte';
	import Button from './Button.svelte';
	import { useGsap } from '$lib/motion/gsap';
	import { getCourseSync } from '$lib/services/courseService';
	import { SEEDED_COURSE_ID, courses } from '$lib/data/catalog';
	import { allLessons, lessonCount } from '$lib/utils/course';
	import type { LaptopScene } from '$lib/three/LaptopScene';
	import { initialLaptopState, restingLaptopState } from '$lib/three/laptopState';
	import { paintHandoff, type QuestionScreenData } from '$lib/three/screenUi';

	const course = getCourseSync(SEEDED_COURSE_ID)!;
	const lessons = allLessons(course).slice(0, 4);
	const total = lessonCount(course);
	// the story's side characters: preferred picks when the catalog has them, else any other courses
	const others = courses.filter((c) => c.id !== course.id);
	const pick = (id: string, i: number) => getCourseSync(id) ?? others[i % others.length] ?? course;
	const exploreA = pick('design-systems-in-practice', 0);
	const exploreB = pick('applied-machine-learning', 1);

	// what the laptop screen shows before the page takes over
	const screen: QuestionScreenData = {
		question: 'How do I build my first web app?',
		results: [course, pick('typescript-in-depth', 2), pick('design-systems-in-practice', 3)].map((c) => ({
			title: c.title,
			meta: `${lessonCount(c)} lessons · ${c.duration} · ${c.level}`,
			thumb: c.thumbnail
		}))
	};

	const beats = ['Curiosity', 'Discovery', 'Learning', 'Progress', 'Transformation'];
	// timeline positions (seconds) where each beat becomes "current"
	const BEAT_AT = [0, 0.8, 3.6, 6.0, 9.3];
	const SEGMENTS = total;
	const TARGET = 35;

	let root: HTMLElement;
	let frame: HTMLElement;
	let canvas: HTMLCanvasElement;
	let glReady = $state(false);
	let active = $state(0);
	let isStatic = $state(false);
	let jumpTo: (i: number) => void = () => {};

	/** Centre of `el` relative to `frame`, ignoring transforms. */
	function pos(el: Element) {
		const e = el as HTMLElement;
		let x = e.offsetWidth / 2;
		let y = e.offsetHeight / 2;
		let n: HTMLElement | null = e;
		while (n && n !== frame) {
			x += n.offsetLeft;
			y += n.offsetTop;
			n = n.offsetParent as HTMLElement | null;
		}
		return { x, y };
	}

	onMount(() => {
		const { gsap, ScrollTrigger } = useGsap();
		const mm = gsap.matchMedia();

		mm.add(
			{
				motion: '(prefers-reduced-motion: no-preference)',
				reduce: '(prefers-reduced-motion: reduce)',
				mobile: '(max-width: 759px), (max-width: 1100px) and (max-aspect-ratio: 4/5)'
			},
			(ctx) => {
				const { reduce, mobile } = ctx.conditions as Record<string, boolean>;
				if (reduce) {
					isStatic = true;
					return () => (isStatic = false);
				}

				const q = gsap.utils.selector(root);
				const one = (s: string) => q(s)[0] as HTMLElement;
				const d = mobile ? 0.55 : 1; // travel distance scale

				// Opening — words of the first line rise into place (not scrubbed)
				gsap.from(q('.s1 .w > span'), {
					yPercent: 110,
					duration: 1.4,
					stagger: 0.07,
					ease: 'expo.out',
					delay: 0.15
				});
				// intro runs on inner wrappers so it never fights the scrubbed timeline
				gsap.from(q('.s1-support .intro, .cue .intro, .rail'), { opacity: 0, y: 12, duration: 1.2, delay: 0.7, stagger: 0.1 });

				/* ── 3D laptop (loaded lazily; the intro, then the timeline, drive its state) ── */
				const laptop = initialLaptopState();
				let scene: LaptopScene | null = null;
				let disposed = false;
				const redraw = () => scene?.invalidate();
				const stage = one('.stage');
				const wrap = one('.console-wrap');
				// the course window's transform at the moment it takes over from the screen
				const HANDOFF = { x: 0, y: 40 * d, scale: 0.8 };

				/** Paints the course window into the screen exactly where it will appear. */
				let paintRun = 0;
				const paint = async () => {
					if (!scene) return;
					const run = ++paintRun;
					const canvas = await paintHandoff({
						stage,
						wrap,
						content: one('.console'),
						skip: '.lesson',
						...HANDOFF,
						grid: { spacing: 26, radius: 1.4, color: 'rgb(90 138 69 / 0.28)', cx: 0.62, cy: 0.5, inner: 0.15, outer: 0.7 },
						frame: scene.handoffFrame()
					});
					if (run === paintRun && scene) scene.setHandoff(canvas);
				};
				let paintTimer = 0;
				const repaint = () => {
					clearTimeout(paintTimer);
					paintTimer = window.setTimeout(paint, 120);
				};

				const ro = new ResizeObserver(() => {
					scene?.resize(stage.clientWidth, stage.clientHeight);
					repaint();
				});
				const io = new IntersectionObserver(([e]) => scene?.setVisible(e.isIntersecting && glAlive));
				let glAlive = true;
				const onPointer = (e: PointerEvent) =>
					scene?.pointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
				if (window.matchMedia('(hover: hover)').matches) window.addEventListener('pointermove', onPointer);

				let intro: gsap.core.Timeline | null = null;
				Promise.all([import('$lib/three/LaptopScene'), document.fonts?.ready])
					.then(async ([{ LaptopScene }]) => {
						if (disposed) return;
						const s = new LaptopScene(canvas, { screen, state: laptop });
						scene = s;
						scene.setLayout(
							mobile
								? { shiftX: 0, shiftY: 0.16, widthFraction: 0.82 }
								: { shiftX: 0.21, shiftY: 0.05, widthFraction: 0.41 }
						);
						scene.resize(stage.clientWidth, stage.clientHeight);
						ro.observe(stage);
						io.observe(stage);
						await s.warm();
						if (disposed) return;
						glReady = true;
						paint();
						// the laptop settles, the lid lifts, and the screen wakes with a question
						// explicit starts: a ScrollTrigger refresh may already have posed the laptop at rest
						const from = initialLaptopState();
						const r = restingLaptopState;
						intro = gsap
							.timeline({ onUpdate: redraw, onComplete: () => (intro = null) })
							.fromTo(laptop, { lift: from.lift }, { lift: r.lift, duration: 1.6, ease: 'expo.out' }, 0)
							.fromTo(laptop, { open: from.open }, { open: r.open, duration: 1.9, ease: 'power3.inOut' }, 0.35)
							.fromTo(
								laptop,
								{ yaw: from.yaw, pitch: from.pitch },
								{ yaw: r.yaw, pitch: r.pitch, duration: 2.4, ease: 'power2.inOut' },
								0.2
							)
							.call(() => s.playQuestion(), [], 1.7);
						// already scrolled into the story (reload mid-page): skip ahead
						if (tl.scrollTrigger!.progress > 0.002) settle();
					})
					.catch(() => {
						/* no WebGL — the story still works without the laptop */
					});
				gsap.from(one('.dot'), { scale: 0, duration: 1, delay: 0.9, ease: 'back.out(3)' });

				// The dot rests on the period via left/top; every tween is a delta
				// from there, so the resting state needs no render at all.
				const dot = one('.dot');
				let origin = { x: 0, y: 0 };
				const place = () => {
					origin = pos(one('.s1 .period'));
					dot.style.left = `${origin.x - 7.5}px`;
					dot.style.top = `${origin.y - 7.5}px`;
				};
				place();
				ScrollTrigger.addEventListener('refreshInit', place);

				const at = (sel: string) => () => pos(one(sel)).x - origin.x;
				const atY = (sel: string) => () => pos(one(sel)).y - origin.y;
				const barHead = (pct: number) => () => {
					const bar = one('.bar');
					return pos(bar).x - bar.offsetWidth / 2 + (bar.offsetWidth * pct) / 100 - origin.x;
				};


				const counter = { v: 0 };
				const num = one('.num');

				/** Ends the intro so the scrubbed timeline owns the laptop from here. */
				const settle = () => {
					if (!intro) return;
					intro.progress(1).kill();
					intro = null;
					scene?.finishQuestion();
				};

				const tl = gsap.timeline({
					defaults: { ease: 'power2.inOut', duration: 1 },
					scrollTrigger: {
						trigger: root,
						start: 'top top',
						end: () => `+=${window.innerHeight * (mobile ? 5.2 : 6)}`,
						pin: one('.stage'),
						scrub: 0.7,
						invalidateOnRefresh: true,
						anticipatePin: 1,
						onUpdate(self) {
							const t = self.progress * tl.duration();
							if (self.progress > 0.002) settle();
							const alive = t < 2.3;
							if (alive !== glAlive) {
								glAlive = alive;
								scene?.setVisible(alive);
							}
							let i = 0;
							BEAT_AT.forEach((b, k) => t >= b - 0.15 && (i = k));
							active = i;
						}
					}
				});

				jumpTo = (i: number) => {
					const st = tl.scrollTrigger!;
					const p = (BEAT_AT[i] + (i ? 0.9 : 0)) / tl.duration();
					window.scrollTo({ top: st.start + (st.end - st.start) * p, behavior: 'smooth' });
				};

				/* ── 01 CURIOSITY → 02 DISCOVERY ─────────────────────── */
				tl.to(q('.s1 h1'), { y: -70 * d, opacity: 0, ease: 'power2.in', duration: 0.7 }, 0)
					.to(q('.s1-support'), { x: -30 * d, opacity: 0, ease: 'power2.in', duration: 0.6 }, 0)
					.to(q('.cue'), { opacity: 0, duration: 0.4 }, 0)
					// the question has its answers on screen; the lid opens fully and turns to you…
					.fromTo(laptop, { idle: 1 }, { idle: 0, duration: 0.35, ease: 'power1.out', immediateRender: false, onUpdate: redraw }, 0)
					.fromTo(
						laptop,
						{ open: restingLaptopState.open, yaw: restingLaptopState.yaw, pitch: restingLaptopState.pitch },
						{ open: 1, yaw: -0.08, pitch: 0.22, duration: 1, ease: 'power2.inOut', immediateRender: false, onUpdate: redraw },
						0
					)
					// …then the camera flies into the screen, which becomes the course window
					.to(laptop, { focus: 1, yaw: 0, duration: 1.05, ease: 'power2.inOut', onUpdate: redraw }, 0.9)
					.fromTo(laptop, { ui: 0 }, { ui: 1, duration: 0.4, ease: 'power1.inOut', immediateRender: false, onUpdate: redraw }, 1.3)
					.to(q('.gridlines'), { opacity: 1, duration: 1.3 }, 0.2)
					.to(dot, { x: at('.bullet'), y: atY('.bullet'), duration: 1.2 }, 0.3)
					.fromTo(q('.s2-label'), { opacity: 0, x: -20 }, { opacity: 1, x: 0 }, 0.6)
					.fromTo(q('.s2 h2'), { opacity: 0, y: 50 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 0.65)
					// the real course window replaces its painted twin pixel-for-pixel, then the 3D layer goes
					.fromTo(wrap, { opacity: 0, ...HANDOFF }, { opacity: 1, ...HANDOFF, ease: 'none', duration: 0.06 }, 1.95)
					.to(q('.gl'), { opacity: 0, duration: 0.2, ease: 'none' }, 2.01)
					.fromTo(q('.peek-a'), { opacity: 0, x: -80 * d, y: 30 }, { opacity: 1, x: 0, y: 0, ease: 'power3.out' }, 1.65)
					.fromTo(q('.peek-b'), { opacity: 0, y: 90 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 1.8)
					.fromTo(q('.c-meta'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 2.1);

				/* ── 03 LEARNING ─────────────────────────────────────── */
				tl.to(q('.s2 h2, .s2-label'), { opacity: 0, y: -40 * d, ease: 'power2.in', duration: 0.8 }, 2.7)
					.to(q('.peek-a'), { opacity: 0, x: -60 * d, ease: 'power2.in' }, 2.8)
					.to(q('.peek-b'), { opacity: 0, y: 60 * d, ease: 'power2.in' }, 2.85)
					.to(q('.console-wrap'), { scale: 1, y: 0, ease: 'power3.inOut', duration: 1.3 }, 3)
					.fromTo(q('.depth'), { opacity: 0 }, { opacity: 1, duration: 1.3 }, 3)
					.fromTo(q('.s3 h2'), { opacity: 0, y: 40 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 3.7)
					.fromTo(
						q('.lesson'),
						{ opacity: 0, x: 24 },
						{ opacity: 1, x: 0, stagger: 0.15, ease: 'power3.out', duration: 0.8 },
						3.5
					)
					.to(dot, { x: at('.lesson.now .mark'), y: atY('.lesson.now .mark'), duration: 0.9 }, 4.2)
					.fromTo(q('.lesson.now .fill'), { scaleX: 0 }, { scaleX: 0.6, ease: 'none', duration: 1 }, 4.4)
					.fromTo(q('.scrub i'), { scaleX: 0.05 }, { scaleX: 0.42, ease: 'none', duration: 1.2 }, 4.2);

				/* ── 04 PROGRESS ─────────────────────────────────────── */
				tl.to(q('.s3 h2'), { opacity: 0, y: -30 * d, ease: 'power2.in', duration: 0.7 }, 5.3)
					.to(
						q('.console-wrap'),
						mobile
							? { y: -50, scale: 0.94, opacity: 0, duration: 1.1 }
							: {
									x: () => -frame.offsetWidth * 0.43,
									y: () => frame.offsetHeight * 0.16,
									scale: 0.56,
									duration: 1.2
								},
						5.3
					)
					.to(q('.wash'), { opacity: 1, duration: 1.4 }, 5.3)
					.to(q('.gridlines'), { opacity: 0.4, duration: 1 }, 5.3)
					.fromTo(q('.s4 h2'), { opacity: 0, y: 40 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 6.05)
					.fromTo(q('.s4-num'), { opacity: 0, y: 30 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 6.3)
					.fromTo(q('.s4-bar'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.6 }, 6.3)
					.to(dot, { x: barHead(0), y: atY('.bar'), duration: 0.6 }, 6.4)
					.to(
						counter,
						{
							v: TARGET,
							ease: 'none',
							duration: 1.3,
							onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(2, '0'))
						},
						6.9
					)
					.fromTo(q('.bar .fillbar'), { scaleX: 0 }, { scaleX: TARGET / 100, ease: 'none', duration: 1.3 }, 6.9)
					.to(dot, { x: barHead(TARGET), ease: 'none', duration: 1.3 }, 6.9)
					.fromTo(q('.s4-foot'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 7.7);

				/* ── 05 TRANSFORMATION ───────────────────────────────── */
				tl.to(q('.s4 h2, .s4-num, .s4-bar, .s4-foot'), { opacity: 0, y: -30 * d, stagger: 0.05, ease: 'power2.in', duration: 0.6 }, 8.6)
					.to(q('.console-wrap'), { opacity: 0, duration: 0.6 }, 8.6)
					.to(q('.wash'), { opacity: 0, duration: 1.2 }, 8.9)
					.to(q('.gridlines'), { opacity: 0, duration: 1 }, 8.9)
					.fromTo(q('.s5a'), { opacity: 0, y: 40 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 9.45)
					.to(dot, { x: at('.period2'), y: atY('.period2'), duration: 0.9 }, 9.4)
					.to(q('.s5a'), { opacity: 0, y: -40 * d, ease: 'power2.in', duration: 0.6 }, 10.5)
					.fromTo(q('.s5b'), { opacity: 0, y: 40 * d }, { opacity: 1, y: 0, ease: 'power3.out' }, 11.15)
					// the certificate arrives with the first line, so the frame is never half empty
					.fromTo(
						q('.cert'),
						{ opacity: 0, y: 60 * d, rotate: mobile ? 0 : 2 },
						{ opacity: 1, y: 0, rotate: 0, ease: 'power3.out', duration: 1.2 },
						9.6
					)
					.to(dot, { x: at('.seal'), y: atY('.seal'), duration: 1.3 }, 11.15)
					// the dot grows and hands over to the seal
					.to(dot, { scale: 3.7, opacity: 0, duration: 0.5, ease: 'power3.out' }, 12.45)
					.fromTo(q('.seal'), { opacity: 0, scale: 0.27 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }, 12.45)
					.fromTo(q('.s5-proof > *'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12, ease: 'power3.out', duration: 0.6 }, 11.7)
					.fromTo(q('.s5-cta'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.6 }, 12.3)
					.to({}, { duration: 0.8 }); // short hold before release

				// fonts can shift text metrics; re-measure anchors once they're in
				document.fonts?.ready.then(() => ScrollTrigger.refresh());
				ScrollTrigger.addEventListener('refresh', repaint);

				return () => {
					disposed = true;
					intro?.kill();
					clearTimeout(paintTimer);
					paintRun++;
					ScrollTrigger.removeEventListener('refresh', repaint);
					ro.disconnect();
					io.disconnect();
					window.removeEventListener('pointermove', onPointer);
					scene?.dispose();
					scene = null;
					glReady = false;
					ScrollTrigger.removeEventListener('refreshInit', place);
					jumpTo = () => {};
					active = 0;
				};
			}
		);

		return () => mm.revert();
	});
</script>

<section class="story" class:static={isStatic} bind:this={root} aria-label="Learning is a journey">
	<div class="stage">
		<div class="gridlines" aria-hidden="true"></div>
		<div class="wash" aria-hidden="true"></div>
		<div class="gl-wrap" class:ready={glReady} aria-hidden="true">
			<canvas class="gl" bind:this={canvas}></canvas>
		</div>

		<div class="frame container-x" bind:this={frame}>
			<!-- 01 · CURIOSITY -->
			<div class="beat s1">
				<h1 class="t-display">
					<span class="w"><span>It</span></span>
					<span class="w"><span>starts</span></span>
					<span class="w"><span>with</span></span>
					<span class="w"><span>a</span></span>
					<span class="w"><span>question<span class="period" aria-hidden="true"></span></span></span><span class="sr-only">.</span>
				</h1>
				<p class="s1-support t-body-lg"><span class="intro">Every skill begins with curiosity.</span></p>
				<p class="cue" aria-hidden="true">
					<span class="intro">
					<span class="cue-line"></span> Scroll to begin <ArrowDown size={13} strokeWidth={1.5} />
					</span>
				</p>
			</div>

			<!-- 02 · DISCOVERY -->
			<div class="beat s2">
				<p class="s2-label t-label later"><span class="bullet"></span>Explore</p>
				<h2 class="t-h1 later">Then you start <em class="italic-accent">exploring.</em></h2>
			</div>

			<a class="peek peek-a later" href="/courses/{exploreA.id}" tabindex="-1" aria-hidden="true">
				<img src={exploreA.thumbnail} alt="" width="320" height="200" />
				<span>{exploreA.title}</span>
			</a>
			<a class="peek peek-b later" href="/courses/{exploreB.id}" tabindex="-1" aria-hidden="true">
				<img src={exploreB.thumbnail} alt="" width="320" height="200" />
				<span>{exploreB.title}</span>
			</a>

			<!-- The course interface (02 → 04) -->
			<div class="console-wrap later">
				<div class="depth" aria-hidden="true"></div>
				<div class="console" role="img" aria-label="{course.title}: lesson 3 of {total} in progress">
					<div class="c-top">
						<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
						<span class="c-name">{course.title}</span>
						<span class="live"><i></i> Lesson 03 of {total}</span>
					</div>
					<div class="c-body">
						<div class="c-video">
							<div class="code" aria-hidden="true">
								<p><b>$</b> node --version</p>
								<p class="o">v24.11.1</p>
								<p><b>$</b> git init my-first-app</p>
								<p class="o">Initialized empty Git repository</p>
								<p><b>$</b> code .<span class="caret"></span></p>
							</div>
							<span class="playbtn"><Play size={18} strokeWidth={0} fill="currentColor" /></span>
							<div class="scrub"><i></i></div>
						</div>
						<ol class="c-list">
							<li class="c-sec t-label">Section 01 · {course.sections[0].title}</li>
							{#each lessons as lesson, i (lesson.id)}
								<li class="lesson" class:done={i < 2} class:now={i === 2}>
									<span class="mark">
										{#if i < 2}<Check size={12} strokeWidth={2.4} />{:else if i === 2}<Play size={9} strokeWidth={0} fill="currentColor" />{/if}
									</span>
									<span class="n t-num">{lesson.number}</span>
									<span class="lt">{lesson.title}</span>
									{#if i === 2}<span class="fillwrap"><span class="fill"></span></span>{/if}
								</li>
							{/each}
						</ol>
					</div>
				</div>
				<div class="c-meta">
					<span>{course.title}</span>
					<span>{total} lessons</span>
					<span>{course.duration}</span>
				</div>
			</div>

			<!-- 03 · LEARNING -->
			<div class="beat s3">
				<h2 class="t-h1 later">One lesson becomes <em class="italic-accent">another.</em></h2>
			</div>

			<!-- 04 · PROGRESS -->
			<div class="beat s4">
				<h2 class="t-h2 later">Progress feels different when you can <em class="italic-accent">see it.</em></h2>
			</div>
			<div class="s4-num later" aria-hidden="true">
				<span class="num t-num">{isStatic ? TARGET : '00'}</span><span class="pct t-num">%</span>
			</div>
			<div class="s4-bar later">
				<p class="t-label">Course progress</p>
				<div class="bar" role="img" aria-label="{TARGET}% course progress">
					<div class="ticks" style="--n:{SEGMENTS}">
						{#each Array(SEGMENTS) as _, i (i)}<span></span>{/each}
					</div>
					<div class="fillbar"></div>
				</div>
			</div>
			<p class="s4-foot later t-label">
				<span>{Math.round((total * TARGET) / 100)} of {total} lessons</span>
				<span>Next · {allLessons(course)[Math.min(6, total - 1)].title}</span>
			</p>

			<!-- 05 · TRANSFORMATION -->
			<div class="beat s5a later">
				<h2 class="t-h1">You didn’t just finish a course<span class="period period2" aria-hidden="true"></span><span class="sr-only">.</span></h2>
			</div>
			<div class="beat s5b later">
				<h2 class="t-h1">You learned something <em class="italic-accent">new.</em></h2>
				<div class="s5-proof">
					<span class="chip"><Check size={13} strokeWidth={2.2} /> {total}/{total} lessons complete</span>
					{#each course.skills.slice(0, 3) as skill (skill)}
						<span class="chip skill">{skill}</span>
					{/each}
				</div>
				<div class="s5-cta">
					<Button href="/courses/{course.id}" arrow magnetic size="lg">Begin your journey</Button>
				</div>
			</div>

			<div class="cert later" aria-label="Certificate preview">
				<div class="cert-top">
					<span class="t-label">Certificate of completion</span>
					<span class="t-label">No. SL-2026-0412</span>
				</div>
				<p class="cert-k t-label">This certifies that</p>
				<p class="cert-name">You</p>
				<p class="cert-k t-label">has completed</p>
				<p class="cert-course">{course.title}</p>
				<div class="cert-foot">
					<span class="t-label">{course.instructor.name} · Instructor</span>
					<span class="seal later"><Award size={22} strokeWidth={1.5} /></span>
				</div>
			</div>

			<span class="dot" aria-hidden="true"></span>
		</div>

		<!-- Beat rail -->
		<nav class="rail" aria-label="Story progress">
			{#each beats as beat, i (beat)}
				<button class:on={active === i} class:past={active > i} onclick={() => jumpTo(i)} aria-current={active === i ? 'step' : undefined}>
					<span class="name">{beat}</span>
					<span class="t-num">{String(i + 1).padStart(2, '0')}</span>
				</button>
			{/each}
		</nav>
	</div>
</section>

<style>
	.story {
		position: relative;
	}
	.stage {
		position: relative;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
		background: var(--background);
	}
	.gridlines,
	.wash {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
	}
	.gridlines {
		background-image: radial-gradient(circle, rgb(90 138 69 / 0.28) 1.2px, transparent 1.6px);
		background-size: 26px 26px;
		mask-image: radial-gradient(ellipse at 62% 50%, #000 15%, transparent 70%);
		opacity: 0;
	}
	.wash {
		background:
			radial-gradient(ellipse 60% 70% at 72% 55%, var(--green-100), transparent 70%),
			var(--paper-soft);
	}
	.frame {
		position: relative;
		height: 100%;
	}
	.gl-wrap {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 1.4s var(--ease-out);
	}
	.gl-wrap.ready {
		opacity: 1;
	}
	.gl {
		width: 100%;
		height: 100%;
		display: block;
	}

	/* All beats are layered in the same frame */
	.beat,
	.peek,
	.console-wrap,
	.s4-num,
	.s4-bar,
	.s4-foot,
	.cert {
		position: absolute;
	}
	:global(html.js) .story:not(.static) .later {
		opacity: 0;
	}

	/* 01 */
	.s1 {
		inset: 0;
		pointer-events: none;
	}
	.s1 h1 {
		position: absolute;
		left: var(--gutter);
		top: 27%;
		width: min(60%, 62rem);
		/* never taller than the viewport allows (short laptop screens) */
		font-size: min(var(--fs-display), 15vh);
	}
	:where(.beat) .t-h1 {
		font-size: min(var(--fs-h1), 9.5vh);
	}
	:where(.beat) .t-h2 {
		font-size: min(var(--fs-h2), 7.2vh);
	}
	.w {
		display: inline-block;
		overflow: hidden;
		vertical-align: top;
		padding-bottom: 0.06em;
		margin-bottom: -0.06em;
	}
	.w > span {
		display: inline-block;
	}
	.period {
		display: inline-block;
		width: 0.17em;
		height: 0.17em;
		margin-left: 0.04em;
	}
	.s1-support {
		position: absolute;
		left: calc(var(--gutter) + 8%);
		top: 67%;
		max-width: 20rem;
	}
	.intro {
		display: inline-flex;
		align-items: center;
		gap: inherit;
	}
	.cue {
		position: absolute;
		left: var(--gutter);
		bottom: 2.25rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.82rem;
		color: var(--text-secondary);
	}
	.cue-line {
		position: relative;
		width: 3rem;
		height: 1px;
		background: var(--border-strong);
		overflow: hidden;
	}
	.cue-line::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--ink);
		animation: cue 2.4s var(--ease-out) infinite;
	}
	@keyframes cue {
		0% {
			transform: translateX(-100%);
		}
		60%,
		100% {
			transform: translateX(100%);
		}
	}

	/* The dot */
	.dot {
		position: absolute;
		left: -7.5px;
		top: -7.5px;
		z-index: 20;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: var(--brand-primary);
		box-shadow: 0 0 0 0 rgb(90 138 69 / 0.35);
		animation: breathe 3s var(--ease-in-out) infinite;
		pointer-events: none;
	}
	@keyframes breathe {
		50% {
			box-shadow: 0 0 0 8px rgb(90 138 69 / 0);
		}
	}

	/* 02 */
	.s2 {
		left: var(--gutter);
		top: 24%;
		width: 38%;
	}
	.s2-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		color: var(--ink);
	}
	.bullet {
		width: 15px;
		height: 15px;
	}
	.peek {
		display: grid;
		gap: 0.6rem;
		width: 15%;
		font-size: 0.78rem;
		color: var(--text-secondary);
	}
	.peek img {
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
	}
	.peek-a {
		left: calc(var(--gutter) + 2%);
		top: 64%;
	}
	.peek-b {
		left: 24%;
		top: 74%;
		width: 12%;
	}

	/* Console */
	.console-wrap {
		left: 45%;
		top: 15%;
		width: min(52%, 98vh);
		transform-origin: 50% 40%;
	}
	.depth {
		position: absolute;
		inset: 4% 3% 8%;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-hero);
		opacity: 0;
	}
	.console {
		position: relative;
		background: var(--surface);
		color: var(--ink);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.07),
			var(--shadow-soft);
	}
	.c-top {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		height: 2.8rem;
		padding: 0 1rem;
		font-size: 0.74rem;
		color: var(--text-secondary);
	}
	.dots {
		display: flex;
		gap: 5px;
	}
	.dots i {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--border-strong);
	}
	.dots i:first-child {
		background: var(--green-300);
	}
	.c-name {
		text-align: center;
		font-weight: 500;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 1.6rem;
		padding: 0 0.6rem;
		border-radius: var(--radius-pill);
		background: var(--green-100);
		color: var(--green-700);
		font-size: 0.7rem;
		font-weight: 500;
	}
	.live i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--brand-primary);
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	.c-body {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
		gap: 0.4rem;
		padding: 0 0.6rem 0.6rem;
	}
	.c-video {
		position: relative;
		aspect-ratio: 16 / 11;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background:
			radial-gradient(ellipse at 30% 20%, rgb(184 206 169 / 0.1), transparent 60%),
			var(--ink);
	}
	.code {
		position: absolute;
		left: 8%;
		top: 14%;
		font: 400 clamp(0.6rem, 0.85vw, 0.78rem) / 1.9 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		color: rgb(255 255 255 / 0.78);
	}
	.code b {
		color: var(--green-300);
		font-weight: 400;
		margin-right: 0.5em;
	}
	.code .o {
		color: rgb(255 255 255 / 0.35);
		margin-bottom: 0.4em;
	}
	.caret {
		display: inline-block;
		width: 0.5em;
		height: 1em;
		margin-left: 2px;
		vertical-align: -0.15em;
		background: var(--green-300);
		animation: pulse 1s steps(1) infinite;
	}
	.playbtn {
		position: absolute;
		right: 8%;
		bottom: 18%;
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		padding-left: 2px;
		border-radius: 50%;
		background: #fff;
		color: var(--ink);
	}
	.scrub {
		position: absolute;
		left: 8%;
		right: 8%;
		bottom: 9%;
		height: 2px;
		background: rgb(255 255 255 / 0.14);
	}
	.scrub i {
		position: absolute;
		inset: 0;
		background: var(--green-300);
		transform-origin: left;
		transform: scaleX(0.05);
	}
	.c-list {
		list-style: none;
		margin: 0;
		padding: 0.9rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.c-sec {
		padding: 0 0.6rem 0.6rem;
		font-size: 0.7rem;
		color: var(--text-muted);
	}
	.lesson {
		position: relative;
		display: grid;
		grid-template-columns: 1.1rem 1.4rem 1fr;
		align-items: center;
		gap: 0.35rem;
		padding: 0.6rem 0.6rem;
		border-radius: var(--radius-md);
		font-size: clamp(0.66rem, 0.85vw, 0.8rem);
		color: var(--text-secondary);
	}
	.lesson .n {
		color: var(--text-muted);
		font-size: 0.85em;
	}
	.lt {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 1.05rem;
		height: 1.05rem;
		border-radius: 50%;
		border: 1px solid var(--border-strong);
	}
	.lesson.done .mark {
		background: var(--brand-primary);
		border-color: var(--brand-primary);
		color: #fff;
	}
	.lesson.now {
		background: var(--green-100);
		color: var(--ink);
		font-weight: 500;
	}
	.lesson.now .mark {
		border-color: var(--brand-primary);
		color: var(--brand-primary);
	}
	.fillwrap {
		position: absolute;
		left: 0.6rem;
		right: 0.6rem;
		bottom: 0.2rem;
		height: 2px;
		background: rgb(90 138 69 / 0.15);
	}
	.fill {
		position: absolute;
		inset: 0;
		background: var(--brand-primary);
		transform-origin: left;
		transform: scaleX(0);
	}
	.c-meta {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.1rem;
		padding-left: 0.25rem;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}
	.c-meta span:first-child {
		color: var(--ink);
		font-weight: 500;
	}

	/* 03 */
	.s3 {
		left: var(--gutter);
		top: 56%;
		width: 36%;
	}

	/* 04 */
	.s4 {
		left: 48%;
		top: 16%;
		width: 44%;
	}
	.s4-num {
		left: 47%;
		top: 33%;
		display: flex;
		align-items: flex-start;
		line-height: 0.85;
		color: var(--ink);
	}
	.num {
		font-size: min(clamp(7rem, 17vw, 15rem), 31vh);
		letter-spacing: -0.04em;
	}
	.pct {
		font-size: clamp(2.5rem, 5vw, 4.5rem);
		margin-top: 0.15em;
		color: var(--brand-primary);
	}
	.s4-bar {
		left: 48%;
		width: 46%;
		top: 76%;
	}
	.s4-bar .t-label {
		margin-bottom: 0.9rem;
	}
	.bar {
		position: relative;
		height: 7px;
	}
	.ticks {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		gap: 3px;
	}
	.ticks span {
		background: rgb(23 25 22 / 0.09);
		border-radius: 1px;
	}
	.fillbar {
		position: absolute;
		inset: 0;
		background: var(--brand-primary);
		transform-origin: left;
		transform: scaleX(0);
		border-radius: 1px;
	}
	.s4-foot {
		left: 48%;
		width: 46%;
		top: calc(76% + 4.25rem);
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	/* 05 */
	.s5a,
	.s5b {
		left: var(--gutter);
		top: 22%;
		width: 44%;
	}
	.s5-proof {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 2.25rem;
		max-width: 30rem;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		font-size: 0.8rem;
		background: var(--surface);
	}
	.chip:first-child {
		background: var(--green-100);
		border-color: transparent;
		color: var(--green-700);
	}
	.s5-cta {
		margin-top: 2.5rem;
	}
	.cert {
		left: 54%;
		top: 20%;
		width: min(38%, 62vh);
		aspect-ratio: 1.42;
		padding: clamp(1.25rem, 2.4vw, 2.25rem);
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-elevated);
	}
	.cert::before {
		content: '';
		position: absolute;
		inset: 0.6rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		pointer-events: none;
	}
	.cert-top {
		display: flex;
		justify-content: space-between;
		margin-bottom: auto;
	}
	.cert-k {
		font-size: 0.6rem;
	}
	.cert-name {
		font-family: var(--font-display);
		font-style: italic;
		font-size: clamp(1.8rem, 3.2vw, 2.8rem);
		line-height: 1.1;
		color: var(--ink);
		margin: 0.25rem 0 0.6rem;
	}
	.cert-course {
		font-family: var(--font-display);
		font-size: clamp(1.1rem, 1.7vw, 1.5rem);
		color: var(--ink);
		margin-top: 0.2rem;
	}
	.cert-foot {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.seal {
		display: grid;
		place-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: var(--brand-primary);
		color: #fff;
		box-shadow: 0 0 0 5px var(--green-100);
	}

	/* Rail */
	.rail {
		position: absolute;
		right: var(--gutter);
		bottom: 1.9rem;
		display: flex;
		align-items: center;
		gap: 1.1rem;
		z-index: 30;
	}
	.rail button {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.6rem;
		padding: 0.3rem 0;
		background: none;
		border: 0;
		height: 1.9rem;
		padding: 0 0.55rem;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		font-size: 0.78rem;
		transition: background var(--duration-normal) var(--ease-out);
	}
	.rail .name {
		max-width: 0;
		overflow: hidden;
		opacity: 0;
		transition:
			max-width var(--duration-slow) var(--ease-out),
			opacity var(--duration-normal) var(--ease-out);
		white-space: nowrap;
	}
	.rail button.on {
		color: var(--green-700);
		background: var(--green-100);
	}
	.rail button.on .name {
		max-width: 10rem;
		opacity: 1;
	}
	.rail button.past {
		color: var(--brand-primary);
	}
	.rail .t-num {
		font-size: 0.8rem;
		letter-spacing: 0;
	}

	/* ── Laptop / tablet ───────────────────────────────── */
	@media (max-width: 1100px) {
		.rail {
			display: none;
		}
		.console-wrap {
			left: 40%;
			width: 58%;
		}
		.s2 {
			width: 36%;
		}
		.cert {
			left: 52%;
			width: 44%;
		}
		.s5a,
		.s5b {
			width: 46%;
		}
	}

	/* ── Mobile composition ────────────────────────────── */
	@media (max-width: 759px), (max-width: 1100px) and (max-aspect-ratio: 4/5) {
		.s1 h1 {
			top: 22%;
			width: calc(100% - var(--gutter) * 2);
			font-size: clamp(3.1rem, 14vw, 4.6rem);
		}
		/* directly under the two-line headline, so the laptop owns the lower half on any phone height */
		.s1-support {
			left: var(--gutter);
			top: calc(22% + clamp(3.1rem, 14vw, 4.6rem) * 2.15);
			max-width: 17rem;
			font-size: 1rem;
		}
		.s2,
		.s3,
		.s4,
		.s5a,
		.s5b {
			left: var(--gutter);
			right: var(--gutter);
			width: auto;
			top: calc(var(--nav-height) + 1.5rem);
		}
		.s2 h2,
		.s3 h2,
		.s5a h2,
		.s5b h2 {
			font-size: clamp(2.2rem, 10vw, 3rem);
		}
		.s2-label {
			margin-bottom: 1rem;
		}
		.peek {
			display: none;
		}
		.console-wrap {
			left: var(--gutter);
			right: var(--gutter);
			width: auto;
			top: 38%;
			transform-origin: 50% 0;
		}
		.c-body {
			grid-template-columns: 1fr;
		}
		.c-video {
			aspect-ratio: 16 / 8;
			border-right: 0;
			border-bottom: 1px solid var(--border-inverse);
		}
		.c-list {
			padding: 0.6rem 0.35rem;
		}
		.c-sec {
			display: none;
		}
		.lesson {
			padding: 0.45rem 0.5rem;
			font-size: 0.75rem;
		}
		.c-meta {
			gap: 1rem;
			font-size: 0.72rem;
		}
		.c-meta span:first-child {
			display: none;
		}
		.s4-num {
			left: var(--gutter);
			top: 34%;
		}
		.num {
			font-size: clamp(7rem, 40vw, 10rem);
		}
		.s4-bar,
		.s4-foot {
			left: var(--gutter);
			right: var(--gutter);
			width: auto;
		}
		.s4-bar {
			top: 64%;
		}
		.s4-foot {
			top: calc(64% + 4rem);
			flex-direction: column;
		}
		.cert {
			left: auto;
			right: var(--gutter);
			width: min(82%, 30rem);
			top: 38%;
			padding: 1.1rem 1.25rem;
		}
		.cert-name {
			font-size: 1.7rem;
			margin: 0.1rem 0 0.3rem;
		}
		.cert-top span:last-child {
			display: none;
		}
		.s5-proof {
			display: none;
		}
		.s5-cta {
			position: absolute;
			top: calc(100svh - var(--nav-height) - 9rem);
		}
	}

	/* ── Short phones (≤ 700px tall): the course window must end inside the window ── */
	@media (max-width: 759px) and (max-height: 700px) {
		.console-wrap {
			top: 34%;
		}
		.lesson {
			padding: 0.32rem 0.5rem;
		}
		.c-meta {
			display: none;
		}
	}

	/* ── Reduced motion / no-JS: a calm, stacked reading ── */
	.static .stage,
	:global(html:not(.js)) .stage {
		height: auto;
		overflow: visible;
	}
	.static .frame,
	:global(html:not(.js)) .frame {
		height: auto;
		display: flex;
		flex-direction: column;
		gap: 4rem;
		padding-top: calc(var(--nav-height) + 4rem);
		padding-bottom: 6rem;
	}
	.static :is(.beat, .console-wrap, .s4-num, .s4-bar, .s4-foot, .cert, .s1 h1, .s1-support, .cue),
	:global(html:not(.js)) :is(.beat, .console-wrap, .s4-num, .s4-bar, .s4-foot, .cert, .s1 h1, .s1-support, .cue) {
		position: relative;
		inset: auto;
		left: auto;
		top: auto;
		width: auto;
		max-width: 46rem;
		opacity: 1;
	}
	.static .s1-support {
		margin-top: 1.5rem;
		margin-left: 30%;
	}
	.static .console-wrap {
		max-width: 52rem;
		align-self: flex-end;
		width: 100%;
	}
	.static .cert {
		max-width: 30rem;
		align-self: flex-end;
	}
	.static .bar .fillbar {
		transform: scaleX(0.35);
	}
	.static .lesson.now .fill {
		transform: scaleX(0.6);
	}
	.static :is(.dot, .peek, .rail, .cue, .gridlines, .wash, .gl-wrap),
	:global(html:not(.js)) :is(.dot, .peek, .rail, .cue, .gl-wrap) {
		display: none;
	}
	.static .s5-proof {
		position: static;
		display: flex;
	}
	.static .s5-cta {
		position: static;
	}
</style>
