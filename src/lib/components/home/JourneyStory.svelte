<!--
	JourneyStory — a pinned, scroll-scrubbed story in five chapters, told to
	the visitor: STUCK → DISCOVER → BUILD → PROVE → RISE.

	The right side is "your" career profile. As the page scrolls it changes:
	rejection notices fly off, a counsellor steps in, the program's real skills
	land on the profile, modules and projects count up, a certificate stamps on,
	and an interview and an offer letter arrive. It ends on the enrolment CTA.

	Without JS or with reduced motion it renders as a plain list of chapters
	beside the finished profile.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { X, MessageCircle, CalendarCheck, Mail, Award, User, BadgeCheck, CalendarDays, ArrowDown } from '@lucide/svelte';
	import Button from '../Button.svelte';
	import { courses } from '$lib/data/catalog';
	import { useGsap } from '$lib/motion/gsap';
	import { enquiry } from '$lib/stores/enquiry.svelte';

	// the story follows one real program, so every skill and number on the card is true
	const course = courses.find((c) => c.featured) ?? courses[0];
	const modules = course.sections.length;
	const PROJECTS = 3;
	const role = course.careers?.[0] ?? `${course.title} professional`;

	const chapters = [
		{
			k: 'Stuck',
			h: 'You’ve got the degree.',
			em: 'Not the callbacks.',
			p: 'Every job post asks for projects, tools and experience nobody taught you. Applications go out; silence comes back.'
		},
		{
			k: 'Discover',
			h: 'One free call',
			em: 'changes the plan.',
			p: 'A counsellor maps your goal to the right program, batch and mode for your week — and books you a free demo class.'
		},
		{
			k: 'Build',
			h: 'Live classes. Real projects.',
			em: 'A mentor beside you.',
			p: `${modules} modules of mentor-led sessions, weekly reviews and a capstone you build end to end. Every skill lands on your profile.`
		},
		{
			k: 'Prove',
			h: 'Proof,',
			em: 'not paperwork.',
			p: 'Ship your capstone, earn your certificate, and walk into interviews with work you can actually show.'
		},
		{
			k: 'Rise',
			h: 'From applicant',
			em: 'to offer.',
			p: 'Resume reviews, mock interviews and introductions to hiring teams — until you’re ready to say yes. Your story starts with one free class.'
		}
	];
	const roles = [
		'Graduate · applying everywhere',
		`Learner · ${course.title}`,
		`${role} · in training`,
		`Certified ${role}`,
		`${role}`
	];
	// where each chapter becomes current on the timeline (seconds)
	const BEAT_AT = [0, 2, 4, 6, 8];

	let root: HTMLElement;
	let active = $state(0);
	let isStatic = $state(false);
	let modDone = $state(0);
	let projects = $state(0);
	let jumpTo: (i: number) => void = () => {};
	let skip: () => void = () => {};

	onMount(() => {
		const { gsap } = useGsap();
		const mm = gsap.matchMedia();

		mm.add(
			{
				motion: '(prefers-reduced-motion: no-preference)',
				reduce: '(prefers-reduced-motion: reduce)',
				mobile: '(max-width: 860px)'
			},
			(ctx) => {
				const { reduce, mobile } = ctx.conditions as Record<string, boolean>;
				if (reduce) {
					isStatic = true;
					modDone = modules;
					projects = PROJECTS;
					return () => (isStatic = false);
				}

				const q = gsap.utils.selector(root);
				const ch = q('.ch');
				const rl = q('.role');
				const counts = { mod: 0, proj: 0 };
				const show = { autoAlpha: 1, x: 0, y: 0, scale: 1 };

				const tl = gsap.timeline({
					defaults: { ease: 'power2.inOut', duration: 0.5 },
					scrollTrigger: {
						trigger: root,
						start: 'top top',
						end: () => `+=${window.innerHeight * (mobile ? 4 : 4.6)}`,
						pin: q('.stage')[0],
						scrub: 0.6,
						invalidateOnRefresh: true,
						anticipatePin: 1,
						onUpdate(self) {
							const t = self.progress * tl.duration();
							let i = 0;
							BEAT_AT.forEach((b, k) => t >= b - 0.1 && (i = k));
							active = i;
						}
					}
				});

				// chapter text + the role line under "You" hand over at every beat
				for (let i = 1; i < chapters.length; i++) {
					const T = BEAT_AT[i] - 0.3;
					tl.to(ch[i - 1], { autoAlpha: 0, y: -36, duration: 0.4 }, T)
						.fromTo(ch[i], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.5 }, T + 0.3)
						.to(rl[i - 1], { autoAlpha: 0, y: -10, duration: 0.3 }, T + 0.1)
						.fromTo(rl[i], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, T + 0.35);
				}
				tl.to(q('.cue'), { autoAlpha: 0, duration: 0.3 }, 0.2);

				// 1 → 2 · the rejections fly off, a counsellor and a plan arrive
				tl.to(q('.n-r1'), { autoAlpha: 0, x: -80, rotate: -8 }, 1.6)
					.to(q('.n-r2'), { autoAlpha: 0, x: 80, rotate: 8 }, 1.7)
					.fromTo(q('.n-c'), { autoAlpha: 0, y: 24, scale: 0.92 }, { ...show, ease: 'back.out(1.6)' }, 2.1)
					.fromTo(q('.plan'), { autoAlpha: 0, y: 8 }, show, 2.3);

				// 2 → 3 · skills land, modules and projects count up, a mentor signs off
				tl.to(q('.n-c'), { autoAlpha: 0, y: -20 }, 3.6)
					.fromTo(
						q('.chip'),
						{ autoAlpha: 0, scale: 0.6, y: 6 },
						{ ...show, ease: 'back.out(2)', duration: 0.35, stagger: 0.2 },
						4.0
					)
					.fromTo(q('.bar i'), { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1.6 }, 4.0)
					.to(counts, { mod: modules, ease: 'none', duration: 1.6, onUpdate: () => (modDone = Math.round(counts.mod)) }, 4.0)
					.to(counts, { proj: PROJECTS, ease: 'none', duration: 1.3, onUpdate: () => (projects = Math.round(counts.proj)) }, 4.3)
					.fromTo(q('.n-m'), { autoAlpha: 0, y: 24, scale: 0.92 }, { ...show, ease: 'back.out(1.6)' }, 5.0);

				// 3 → 4 · the mentor note makes way, the certificate stamps on
				tl.to(q('.n-m'), { autoAlpha: 0, y: 20, duration: 0.3 }, 5.7).fromTo(
					q('.cert'),
					{ autoAlpha: 0, scale: 1.7, rotate: -14 },
					{ autoAlpha: 1, scale: 1, rotate: -4, ease: 'back.out(1.8)', duration: 0.45 },
					6.0
				).fromTo(q('.ring'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 6.1);

				// 4 → 5 · an interview, then the offer
				tl.fromTo(q('.n-i'), { autoAlpha: 0, y: 24, scale: 0.92 }, { ...show, ease: 'back.out(1.6)' }, 8.0)
					.fromTo(q('.n-o'), { autoAlpha: 0, y: 30, scale: 0.85 }, { ...show, ease: 'back.out(1.8)' }, 8.5)
					.to(q('.st-open'), { autoAlpha: 0, duration: 0.25 }, 8.5)
					.fromTo(q('.st-hired'), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, 8.6)
					.fromTo(q('.final'), { autoAlpha: 0, y: 16 }, show, 8.7)
					// a beat of stillness before the page moves on
					.to({}, { duration: 1 }, 9.2);

				jumpTo = (i: number) => {
					const st = tl.scrollTrigger!;
					const p = (BEAT_AT[i] + (i ? 0.6 : 0)) / tl.duration();
					window.scrollTo({ top: st.start + (st.end - st.start) * p, behavior: 'smooth' });
				};
				skip = () => window.scrollTo({ top: tl.scrollTrigger!.end + 2, behavior: 'smooth' });

				return () => {
					jumpTo = () => {};
					skip = () => {};
				};
			}
		);

		return () => mm.revert();
	});

	const demo = () => enquiry.show({ kind: 'demo', courseId: course.id });
</script>

<section class="story" class:static={isStatic} bind:this={root} aria-label="Your journey with SymphoZen Academia">
	<div class="stage">
		<div class="container-x grid">
			<div class="left">
				<div class="top">
					<p class="eyebrow">Your story · in five chapters</p>
					<button class="skip" onclick={() => skip()}>Skip <ArrowDown size={12} strokeWidth={2} /></button>
				</div>

				<ol class="rail" aria-label="Chapters">
					{#each chapters as c, i (c.k)}
						<li>
							<button class:on={active === i} class:past={active > i} onclick={() => jumpTo(i)} aria-current={active === i ? 'step' : undefined}>
								<span class="t-num">0{i + 1}</span>
								<span class="lbl">{c.k}</span>
							</button>
						</li>
					{/each}
				</ol>

				<div class="chapters">
					{#each chapters as c, i (c.k)}
						<article class="ch">
							<p class="ck t-label"><span class="t-num">0{i + 1}</span> {c.k}</p>
							<h2 class="ch-h">{c.h} <em class="italic-accent">{c.em}</em></h2>
							<p class="ch-p">{c.p}</p>
							{#if i === chapters.length - 1}
								<div class="final">
									<Button size="lg" arrow magnetic onclick={demo}>Book a free demo</Button>
									<Button size="lg" variant="secondary" href="/courses">Explore programs</Button>
								</div>
							{/if}
						</article>
					{/each}
				</div>
			</div>

			<div class="visual" aria-hidden="true">
				<span class="glow"></span>

				<!-- floating notes -->
				<div class="note muted n-r1">
					<span class="ni bad"><X size={14} strokeWidth={2.2} /></span>
					<span><strong>Application update</strong>Not shortlisted this time</span>
				</div>
				<div class="note muted n-r2">
					<span class="ni bad"><X size={14} strokeWidth={2.2} /></span>
					<span><strong>Junior Developer · Startup</strong>Requires real project experience</span>
				</div>
				<div class="note n-c" data-later>
					<span class="ni"><MessageCircle size={14} strokeWidth={2} /></span>
					<span><strong>Your counsellor</strong>“A weekend batch fits your week. Free demo this Saturday?”</span>
				</div>
				<div class="note n-m" data-later>
					<span class="ni"><BadgeCheck size={14} strokeWidth={2} /></span>
					<span><strong>Mentor review</strong>Capstone approved — ready to ship</span>
				</div>
				<div class="note n-i" data-later>
					<span class="ni"><CalendarCheck size={14} strokeWidth={2} /></span>
					<span><strong>Interview scheduled</strong>{role} · tomorrow, 11:00</span>
				</div>
				<div class="note win n-o" data-later>
					<span class="ni"><Mail size={14} strokeWidth={2} /></span>
					<span><strong>Offer letter received</strong>{role}</span>
				</div>

				<!-- your profile -->
				<div class="card">
					<span class="ring" data-later></span>
					<div class="who">
						<span class="av"><User size={22} strokeWidth={1.6} /></span>
						<div class="id">
							<p class="name">You</p>
							<p class="roles">
								{#each roles as r, i (i)}<span class="role">{r}</span>{/each}
							</p>
						</div>
						<span class="status">
							<span class="st-open">Open to work</span>
							<span class="st-hired" data-later>Hired</span>
						</span>
					</div>

					<p class="plan" data-later><CalendarDays size={14} strokeWidth={1.8} /> {course.title} · Weekend batch</p>

					<div class="sec">
						<p class="t-label">Skills</p>
						<div class="chips">
							{#each course.skills as s (s)}<span class="chip" data-later>{s}</span>{/each}
						</div>
					</div>

					<div class="metrics">
						<div>
							<p class="t-label">Modules</p>
							<p class="mv"><span class="t-num">{modDone}</span>/{modules}</p>
							<span class="bar"><i></i></span>
						</div>
						<div>
							<p class="t-label">Projects</p>
							<p class="mv"><span class="t-num">{projects}</span> in portfolio</p>
						</div>
					</div>

					<div class="cert" data-later>
						<Award size={18} strokeWidth={1.7} />
						<span><strong>Certified</strong>SymphoZen Academia · {course.title}</span>
					</div>
				</div>
			</div>
		</div>

		<p class="cue"><ArrowDown size={14} strokeWidth={1.8} /> Scroll to see your story</p>
	</div>
</section>

<style>
	.story {
		position: relative;
		background:
			radial-gradient(ellipse 55% 60% at 80% 40%, rgb(123 189 95 / 0.12), transparent 70%),
			var(--surface-soft);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.stage {
		position: relative;
		height: 100vh;
		height: 100svh;
		display: flex;
		align-items: center;
		overflow: hidden;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: center;
		padding-top: calc(var(--bar-height) + 1rem);
		padding-bottom: 2rem;
	}

	/* — left: chapters — */
	.left {
		display: grid;
		gap: 1.75rem;
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.skip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
		background: var(--surface);
		font-size: 0.74rem;
		color: var(--text-muted);
	}
	.skip:hover {
		color: var(--ink);
		border-color: var(--border-strong);
	}
	.rail {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 0.35rem;
	}
	.rail li {
		flex: 1;
	}
	.rail button {
		width: 100%;
		display: grid;
		gap: 0.3rem;
		padding: 0.6rem 0 0;
		border: 0;
		border-top: 2px solid var(--border-strong);
		background: none;
		text-align: left;
		font-size: 0.72rem;
		color: var(--text-muted);
		transition:
			color var(--duration-normal),
			border-color var(--duration-normal);
	}
	.rail button.past {
		border-top-color: var(--green-300);
	}
	.rail button.on {
		border-top-color: var(--brand-primary);
		color: var(--ink);
	}
	.rail .t-num {
		font-size: 0.8rem;
	}
	.rail .lbl {
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.chapters {
		display: grid;
	}
	.ch {
		grid-area: 1 / 1;
		display: grid;
		gap: 1.1rem;
		align-content: start;
	}
	/* the chapter label only shows in the static list (the rail does the job when animated) */
	.ck {
		display: none;
		gap: 0.5rem;
		color: var(--brand-primary);
	}
	.static .ck,
	:global(html:not(.js)) .story .ck {
		display: flex;
	}
	.ch-h {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: clamp(2.3rem, 4.6vw, 4.4rem);
		line-height: var(--leading-display);
		letter-spacing: var(--tracking-display);
	}
	.ch-h em {
		display: block;
	}
	.ch-p {
		max-width: 31rem;
		font-size: var(--fs-body-lg);
		color: var(--text-secondary);
	}
	.final {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 0.6rem;
	}

	/* — right: the profile — */
	.visual {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 34rem;
	}
	.glow {
		position: absolute;
		width: 80%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(123 189 95 / 0.22), transparent 65%);
		filter: blur(10px);
	}
	.card {
		position: relative;
		width: min(24rem, 100%);
		display: grid;
		gap: 1.2rem;
		padding: 1.5rem;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.06),
			var(--shadow-elevated);
	}
	.ring {
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		box-shadow:
			0 0 0 2px var(--brand-primary),
			0 0 50px rgb(90 138 69 / 0.3);
		pointer-events: none;
	}
	.who {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 0.85rem;
		align-items: center;
	}
	.av {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--green-100);
		color: var(--green-700);
	}
	.name {
		font-family: var(--font-display);
		font-size: 1.45rem;
		line-height: 1.1;
		color: var(--ink);
	}
	.roles {
		display: grid;
		margin-top: 0.2rem;
		font-size: 0.8rem;
		line-height: 1.35;
		color: var(--text-secondary);
	}
	/* stacked in one cell, so the line keeps the height of the longest role */
	.role {
		grid-area: 1 / 1;
	}
	.status {
		display: grid;
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.04em;
	}
	.status span {
		grid-area: 1 / 1;
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius-pill);
		text-align: center;
		white-space: nowrap;
	}
	.st-open {
		background: var(--surface-soft);
		color: var(--text-muted);
		border: 1px solid var(--border);
	}
	.st-hired {
		background: var(--brand-primary);
		color: #fff;
	}
	.plan {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.8rem;
		border-radius: var(--radius-md);
		background: var(--green-50);
		border: 1px solid var(--green-100);
		font-size: 0.8rem;
		color: var(--green-700);
	}
	.sec {
		display: grid;
		gap: 0.55rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		min-height: 3.9rem;
		align-content: flex-start;
	}
	.chip {
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-pill);
		background: var(--green-100);
		color: var(--green-700);
		font-size: 0.76rem;
		font-weight: 600;
	}
	.metrics {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.metrics > div {
		display: grid;
		gap: 0.3rem;
		align-content: start;
	}
	.mv {
		font-size: 0.82rem;
		color: var(--text-muted);
	}
	.mv .t-num {
		font-size: 1.7rem;
		line-height: 1;
		color: var(--ink);
		margin-right: 0.1rem;
	}
	.bar {
		height: 4px;
		border-radius: 2px;
		background: var(--gray-200);
		overflow: hidden;
	}
	.bar i {
		display: block;
		height: 100%;
		background: var(--brand-primary);
		transform-origin: left;
	}
	.cert {
		position: absolute;
		right: -1.2rem;
		bottom: -1.4rem;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.7rem 0.95rem;
		border-radius: var(--radius-md);
		background: var(--ink);
		color: var(--green-400);
		box-shadow: var(--shadow-elevated);
		transform: rotate(-4deg);
	}
	.cert span {
		display: grid;
		font-size: 0.68rem;
		color: var(--text-inverse-muted);
		line-height: 1.35;
	}
	.cert strong {
		font-size: 0.85rem;
		color: #fff;
		font-weight: 600;
	}

	.note {
		position: absolute;
		z-index: 2;
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		max-width: 16rem;
		padding: 0.75rem 0.9rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.07),
			var(--shadow-soft);
		font-size: 0.76rem;
		line-height: 1.4;
		color: var(--text-secondary);
	}
	.note > span:last-child {
		display: grid;
		gap: 0.1rem;
	}
	.note strong {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--ink);
	}
	.ni {
		flex: none;
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: var(--green-100);
		color: var(--green-700);
	}
	.ni.bad {
		background: rgb(181 72 59 / 0.1);
		color: var(--error);
	}
	.note.muted {
		background: rgb(255 255 255 / 0.92);
	}
	.note.win {
		background: var(--brand-primary);
		color: rgb(255 255 255 / 0.85);
		box-shadow: 0 20px 50px rgb(90 138 69 / 0.4);
	}
	.note.win strong {
		color: #fff;
	}
	.note.win .ni {
		background: rgb(255 255 255 / 0.2);
		color: #fff;
	}
	.n-r1 {
		top: 4%;
		left: 0;
	}
	.n-r2 {
		bottom: 8%;
		right: -2%;
	}
	.n-c {
		top: 2%;
		right: -2%;
	}
	.n-m {
		bottom: 6%;
		left: -3%;
	}
	.n-i {
		top: 3%;
		left: 0;
	}
	.n-o {
		bottom: 3%;
		left: -4%;
	}

	.cue {
		position: absolute;
		left: 50%;
		bottom: 1.25rem;
		translate: -50% 0;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.74rem;
		color: var(--text-muted);
		animation: bob 2.2s var(--ease-in-out) infinite;
	}
	@keyframes bob {
		50% {
			transform: translateY(4px);
		}
	}

	/* — animated mode: later chapters and story beats start hidden — */
	:global(html.js) .story:not(.static) .ch:not(:first-child),
	:global(html.js) .story:not(.static) .role:not(:first-child),
	:global(html.js) .story:not(.static) [data-later] {
		opacity: 0;
		visibility: hidden;
	}

	/* — static mode (no JS / reduced motion): every chapter, the finished profile — */
	.static .stage,
	:global(html:not(.js)) .story .stage {
		height: auto;
		padding: var(--section-space) 0;
	}
	.static .grid,
	:global(html:not(.js)) .story .grid {
		align-items: start;
		padding-top: 0;
	}
	.static .chapters,
	:global(html:not(.js)) .story .chapters {
		gap: 3rem;
	}
	.static .ch,
	:global(html:not(.js)) .story .ch {
		grid-area: auto;
	}
	.static .ch-h,
	:global(html:not(.js)) .story .ch-h {
		font-size: clamp(1.9rem, 3.2vw, 2.8rem);
	}
	.static .visual,
	:global(html:not(.js)) .story .visual {
		position: sticky;
		top: calc(var(--bar-height) + 2rem);
	}
	.static .rail,
	.static .cue,
	.static .skip,
	.static .note:not(.n-o),
	.static .role:not(:last-child),
	.static .st-open,
	:global(html:not(.js)) .story .rail,
	:global(html:not(.js)) .story .cue,
	:global(html:not(.js)) .story .skip,
	:global(html:not(.js)) .story .note:not(.n-o),
	:global(html:not(.js)) .story .role:not(:last-child),
	:global(html:not(.js)) .story .st-open {
		display: none;
	}

	@media (max-width: 1100px) {
		.note {
			max-width: 13.5rem;
		}
	}
	@media (max-width: 860px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.75rem;
			padding-top: var(--bar-height);
			/* clear the sticky "Call · Book a free demo" bar */
			padding-bottom: 5rem;
		}
		.top,
		.final :global(.secondary) {
			display: none;
		}
		/* profile on top, story below */
		.visual {
			order: -1;
			min-height: 0;
			padding: 2.25rem 0 1rem;
		}
		.card {
			width: min(20rem, 100%);
			padding: 1.1rem;
			gap: 0.75rem;
			/* a little smaller, without leaving the space it no longer fills */
			transform: scale(0.88);
			margin-block: -1.2rem;
		}
		.chips {
			min-height: 3.4rem;
		}
		.note {
			max-width: 12rem;
			padding: 0.55rem 0.7rem;
			font-size: 0.68rem;
		}
		.note strong {
			font-size: 0.72rem;
		}
		.ni {
			width: 1.4rem;
			height: 1.4rem;
		}
		.n-r1,
		.n-c,
		.n-i {
			top: 0;
		}
		.n-r1,
		.n-i {
			left: 0;
		}
		.n-c {
			right: 0;
		}
		.n-r2,
		.n-m,
		.n-o {
			bottom: 0;
			top: auto;
		}
		.n-r2 {
			right: 0;
		}
		.n-o {
			left: 0;
		}
		/* the top is free while the mentor speaks; the bottom holds the counters */
		.n-m {
			top: 0;
			bottom: auto;
			right: 0;
			left: auto;
		}
		.cert {
			right: -0.5rem;
			bottom: -1rem;
		}
		.left {
			gap: 1rem;
		}
		.ch {
			gap: 0.7rem;
		}
		.ch-h {
			font-size: clamp(1.8rem, 7.5vw, 2.6rem);
		}
		.ch-h em {
			display: inline;
		}
		.ch-p {
			font-size: 0.9rem;
			line-height: 1.5;
		}
		.final {
			margin-top: 0.2rem;
		}
		.rail .lbl {
			display: none;
		}
		.static .visual,
		:global(html:not(.js)) .story .visual {
			position: relative;
			top: 0;
		}
		.static .top,
		:global(html:not(.js)) .story .top {
			display: flex;
		}
		.static .card,
		:global(html:not(.js)) .story .card {
			transform: none;
			margin-block: 0;
		}
	}
	@media (max-width: 860px) and (max-height: 700px) {
		.ch-p {
			display: none;
		}
	}
</style>
