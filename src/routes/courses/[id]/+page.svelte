<script lang="ts">
	import {
		Star,
		Users,
		Clock,
		BarChart3,
		Layers,
		Globe,
		Award,
		Check,
		Briefcase,
		MonitorPlay,
		Video,
		Headphones,
		FileText,
		MessageCircle,
		Phone,
		CalendarDays
	} from '@lucide/svelte';
	import Button from '$lib/components/Button.svelte';
	import CoursePreview from '$lib/components/CoursePreview.svelte';
	import Curriculum from '$lib/components/Curriculum.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import { site, telHref, whatsappForCourse } from '$lib/data/catalog';
	import { BRAND } from '$lib/data/site';
	import { modes, batches, faqs as generalFaqs } from '$lib/data/academy';
	import { reveal } from '$lib/motion/actions';
	import { getCategory } from '$lib/services/courseService';
	import { enquiry } from '$lib/stores/enquiry.svelte';
	import { formatStudents, lessonCount, weeksToFinish } from '$lib/utils/course';

	let { data } = $props();

	const course = $derived(data.course);
	const category = $derived(getCategory(course.category));
	const topics = $derived(lessonCount(course));
	const wa = $derived(whatsappForCourse(course));
	const weeks = $derived(weeksToFinish(course, 4));

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'curriculum', label: 'Curriculum' },
		{ id: 'careers', label: 'Careers' },
		{ id: 'batches', label: 'Batches' },
		{ id: 'mentor', label: 'Mentor' },
		{ id: 'faqs', label: 'FAQs' }
	];

	const courseFaqs = $derived([
		{
			q: `How long does ${course.title} take?`,
			a: `The program has ${course.sections.length} modules and ${topics} topics (${course.duration} of instruction, plus projects). Most learners finish in about ${weeks} weeks on a weekday or weekend batch; fast-track batches take roughly half that.`
		},
		{
			q: 'Do I need prior experience?',
			a: `This is a ${course.level.toLowerCase()}-level program. ${course.requirements.join(' ')}`
		},
		{
			q: 'Can I attend a demo class first?',
			a: `Yes — book a free demo and you’ll join a live ${course.title} session, meet the mentor and see the curriculum before you decide.`
		},
		...generalFaqs.filter((f) => /certificate|jobs|instalments/i.test(f.q))
	]);

	const demo = () => enquiry.show({ kind: 'demo', courseId: course.id });
	const syllabus = () => enquiry.show({ kind: 'course', courseId: course.id });
</script>

<svelte:head>
	<title>{course.title} — {BRAND}</title>
	<meta name="description" content="{course.subtitle} {course.level} program · {course.duration} · live online, classroom or hybrid, with certificate and career support." />
</svelte:head>

<article class="course">
	<!-- Hero -->
	<header class="hero container-x editorial-grid" use:reveal>
		<nav class="crumb t-label" aria-label="Breadcrumb" data-reveal>
			<a href="/">Home</a>
			<span aria-hidden="true">/</span>
			<a href="/courses">Programs</a>
			<span aria-hidden="true">/</span>
			<a href="/courses?category={category.id}">{category.name}</a>
		</nav>

		<div class="hero-copy">
			<h1 class="t-h1" data-reveal>{course.title}</h1>
			<p class="sub" data-reveal>{course.subtitle}</p>
			<p class="rating" data-reveal>
				<span class="stars" aria-hidden="true">
					{#each Array(5) as _, k (k)}<Star size={14} strokeWidth={0} fill={k < Math.round(course.rating) ? 'currentColor' : 'var(--border-strong)'} />{/each}
				</span>
				<strong>{course.rating.toFixed(1)}</strong>
				<span>({course.ratingCount.toLocaleString(site.locale)} reviews) · {formatStudents(course.students)} learners</span>
			</p>

			<div class="cta" data-reveal>
				<Button size="lg" arrow magnetic onclick={demo}>Book a free demo</Button>
				<Button size="lg" variant="secondary" onclick={syllabus}>
					{#snippet icon()}<FileText size={16} strokeWidth={1.6} />{/snippet}
					Get syllabus & fees
				</Button>
			</div>
			{#if wa || telHref}
				<p class="talk" data-reveal>
					Talk to an advisor:
					{#if telHref}<a href={telHref}><Phone size={14} strokeWidth={1.8} /> {site.phone}</a>{/if}
					{#if wa}<a href={wa} target="_blank" rel="noopener"><MessageCircle size={14} strokeWidth={1.8} /> WhatsApp</a>{/if}
				</p>
			{/if}
		</div>

		<div class="hero-media" data-reveal>
			<CoursePreview {course} />
		</div>

		<dl class="facts" data-reveal>
			<div><dt><Clock size={15} strokeWidth={1.5} /> Duration</dt><dd>{course.duration}</dd></div>
			<div><dt><BarChart3 size={15} strokeWidth={1.5} /> Level</dt><dd>{course.level}</dd></div>
			<div><dt><Layers size={15} strokeWidth={1.5} /> Modules</dt><dd>{course.sections.length} <span class="muted">· {topics} topics</span></dd></div>
			<div><dt><MonitorPlay size={15} strokeWidth={1.5} /> Mode</dt><dd class="small">Online · Classroom · Hybrid</dd></div>
			<div><dt><Globe size={15} strokeWidth={1.5} /> Language</dt><dd class="small">{course.language}</dd></div>
			<div><dt><Award size={15} strokeWidth={1.5} /> Certificate</dt><dd class="small">On completion</dd></div>
		</dl>
	</header>

	<nav class="tabs" aria-label="On this page">
		<div class="container-x tabs-in">
			{#each tabs as t (t.id)}<a href="#{t.id}">{t.label}</a>{/each}
		</div>
	</nav>

	<div class="layout container-x">
		<div class="content">
			<!-- Overview -->
			<section class="block" id="overview" use:reveal>
				<h2 class="t-label" data-reveal>About the program</h2>
				<p class="overview" data-reveal>{course.description}</p>

				<h3 class="t-label sub-h" data-reveal>What you’ll learn</h3>
				<ul class="outcomes">
					{#each course.outcomes as o, i (o)}
						<li data-reveal>
							<span class="t-num">{String(i + 1).padStart(2, '0')}</span>
							<span>{o}</span>
						</li>
					{/each}
				</ul>
				<h3 class="t-label sub-h" data-reveal>Tools & skills</h3>
				<div class="skills" data-reveal>
					{#each course.skills as s (s)}<span>{s}</span>{/each}
				</div>
			</section>

			<!-- Curriculum -->
			<section class="block" id="curriculum" use:reveal>
				<div class="block-head" data-reveal>
					<h2 class="t-label">Curriculum</h2>
					<p class="t-small muted">{course.sections.length} modules · {topics} topics · {course.duration}</p>
				</div>
				<div data-reveal><Curriculum {course} /></div>
				<button class="dl" onclick={syllabus} data-reveal>
					<FileText size={16} strokeWidth={1.6} /> Get the detailed syllabus
				</button>
			</section>

			<!-- Careers -->
			<section class="block" id="careers" use:reveal>
				<h2 class="t-label" data-reveal>Career paths</h2>
				<p class="lead-s" data-reveal>Roles this program prepares you for:</p>
				{#if course.careers?.length}
					<ul class="roles" data-reveal>
						{#each course.careers as r (r)}<li><Briefcase size={15} strokeWidth={1.6} /> {r}</li>{/each}
					</ul>
				{/if}
				<div class="support" data-reveal>
					<p class="t-label">Career support included</p>
					<ul>
						<li><Check size={15} strokeWidth={2} /> Resume & LinkedIn profile review</li>
						<li><Check size={15} strokeWidth={2} /> Mock interviews with mentors</li>
						<li><Check size={15} strokeWidth={2} /> Portfolio-ready capstone project</li>
						<li><Check size={15} strokeWidth={2} /> Introductions to hiring teams</li>
					</ul>
				</div>
			</section>

			<!-- Modes & batches -->
			<section class="block" id="batches" use:reveal>
				<h2 class="t-label" data-reveal>Modes & batches</h2>
				<div class="modes">
					{#each modes.filter((m) => m.id !== 'corporate') as m (m.id)}
						<div class="mode" data-reveal>
							<strong>{m.title}</strong>
							<span>{m.lead}</span>
						</div>
					{/each}
				</div>
				<ul class="batches" data-reveal>
					{#each batches as b (b.title)}
						<li><CalendarDays size={15} strokeWidth={1.6} /><strong>{b.title}</strong><span>{b.when} · {b.time}</span></li>
					{/each}
				</ul>
				<p class="next" data-reveal>
					New batches start every month.
					<button onclick={() => enquiry.show({ kind: 'course', courseId: course.id })}>Ask for the next batch date →</button>
				</p>
			</section>

			<!-- Certificate -->
			<section class="block cert-block" use:reveal>
				<div class="cert" data-reveal aria-hidden="true">
					<img src="/brand/academia-mark.png" alt="" width="512" height="512" />
					<span class="c-k">Certificate of completion</span>
					<span class="c-t">{course.title}</span>
					<span class="c-b">{BRAND}</span>
				</div>
				<div class="cert-copy" data-reveal>
					<h2 class="t-label">Certification</h2>
					<p class="cert-t">Earn your {BRAND} certificate.</p>
					<p class="muted-p">Awarded when you complete the program and your capstone project — add it to your resume and LinkedIn profile.</p>
				</div>
			</section>

			<!-- Mentor -->
			<section class="block instructor" id="mentor" use:reveal>
				<h2 class="t-label" data-reveal>Your mentor</h2>
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
				<h2 class="t-label" data-reveal>Who should join</h2>
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
						<p class="score"><span class="t-num">{course.rating.toFixed(1)}</span> / 5 from {course.ratingCount.toLocaleString(site.locale)} reviews</p>
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

			<!-- FAQs -->
			<section class="block" id="faqs" use:reveal>
				<h2 class="t-label" data-reveal>Frequently asked questions</h2>
				<div data-reveal><Faq items={courseFaqs} /></div>
			</section>
		</div>

		<!-- Fees + enquiry -->
		<aside class="side">
			<div class="panel">
				<p class="t-label">{site.offerNote}</p>
				<PriceTag price={course.price} size="lg" note />
				<p class="p-meta">Easy EMI available · Fee includes live classes, recordings, projects, certificate and career support.</p>
				<div class="p-form">
					<p class="p-k">Get batch dates & a callback</p>
					<EnquiryForm kind="course" courseId={course.id} lockCourse size="compact" submitLabel="Request a callback" uid="side" />
				</div>
				<ul class="includes">
					<li><Video size={15} strokeWidth={1.5} /> Live mentor-led classes · {course.duration}</li>
					<li><MonitorPlay size={15} strokeWidth={1.5} /> Every session recorded</li>
					<li><Award size={15} strokeWidth={1.5} /> Certificate of completion</li>
					<li><Headphones size={15} strokeWidth={1.5} /> Doubt support & career help</li>
					<li><Users size={15} strokeWidth={1.5} /> {formatStudents(course.students)} learners so far</li>
				</ul>
			</div>
		</aside>
	</div>

	<!-- Related -->
	<section class="related container-x" use:reveal>
		<div class="rel-head" data-reveal>
			<p class="eyebrow">Explore more</p>
			<h2 class="t-h2">Related <em class="italic-accent">programs.</em></h2>
			<Button href="/courses" variant="secondary" arrow>All programs</Button>
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
		padding-top: calc(var(--nav-height) + clamp(2rem, 5vw, 4rem));
		padding-bottom: clamp(2rem, 5vw, 3.5rem);
		row-gap: 2rem;
		align-items: start;
	}
	.crumb {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
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
		gap: 1.25rem;
		padding-top: 0.5rem;
	}
	.hero-copy h1 {
		font-size: clamp(2.5rem, 5vw, 4.6rem);
	}
	.sub {
		font-size: clamp(1.1rem, 1.6vw, 1.3rem);
		color: var(--text-secondary);
		max-width: 30rem;
	}
	.rating {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.88rem;
		color: var(--text-muted);
	}
	.rating strong {
		color: var(--ink);
		font-weight: 600;
	}
	.stars {
		display: inline-flex;
		gap: 2px;
		color: var(--brand-primary);
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 0.5rem;
	}
	.talk {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 1rem;
		font-size: 0.86rem;
		color: var(--text-muted);
	}
	.talk a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--ink);
		font-weight: 500;
	}
	.talk a:hover {
		color: var(--brand-primary);
	}
	.hero-media {
		grid-column: 7 / span 6;
		margin-top: clamp(0rem, 4vw, 3rem);
	}
	.facts {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		margin: 1.5rem 0 0;
		border-top: 1px solid var(--border);
	}
	.facts div {
		padding: 1.25rem 1rem 0 0;
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
		font-size: 1.45rem;
		color: var(--ink);
	}
	.facts dd.small {
		font-family: var(--font-body);
		font-size: 0.95rem;
		padding-top: 0.35rem;
		line-height: 1.4;
	}
	.muted {
		color: var(--text-muted);
		font-family: var(--font-body);
		font-size: 0.8rem;
	}

	/* in-page tabs */
	.tabs {
		position: sticky;
		top: var(--bar-height);
		z-index: 20;
		background: rgb(252 252 250 / 0.97);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}
	.tabs-in {
		display: flex;
		gap: 0.25rem;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.tabs a {
		flex: none;
		padding: 0.9rem 0.9rem;
		font-size: 0.88rem;
		color: var(--text-secondary);
		border-bottom: 2px solid transparent;
		transition:
			color var(--duration-normal),
			border-color var(--duration-normal);
	}
	.tabs a:first-child {
		padding-left: 0;
	}
	.tabs a:hover {
		color: var(--ink);
		border-color: var(--brand-primary);
	}

	/* Body */
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 23rem;
		gap: clamp(2rem, 6vw, 6rem);
	}
	.content {
		max-width: 48rem;
		min-width: 0;
	}
	.block {
		padding: clamp(2.5rem, 5vw, 3.75rem) 0;
		border-bottom: 1px solid var(--border);
		scroll-margin-top: calc(var(--bar-height) + 4rem);
	}
	.block:last-child {
		border-bottom: 0;
	}
	.block > .t-label,
	.block-head {
		margin-bottom: 1.5rem;
	}
	.block-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.sub-h {
		margin: 2.5rem 0 1rem;
	}
	.overview {
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2.1vw, 1.75rem);
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
		padding: 0.9rem 0;
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
	}
	.skills span {
		padding: 0.4rem 0.85rem;
		border-radius: var(--radius-pill);
		background: var(--surface-soft);
		border: 1px solid var(--border);
		font-size: 0.84rem;
	}
	.dl,
	.next button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0;
		border: 0;
		background: none;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--brand-primary);
	}
	.dl {
		margin-top: 1.25rem;
	}
	.dl:hover,
	.next button:hover {
		color: var(--brand-primary-hover);
		text-decoration: underline;
	}

	.lead-s {
		color: var(--text-secondary);
		margin-bottom: 1rem;
	}
	.roles {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}
	.roles li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.07);
		font-weight: 500;
		color: var(--ink);
	}
	.roles :global(svg) {
		color: var(--brand-primary);
		flex: none;
	}
	.support {
		margin-top: 1.5rem;
		padding: 1.4rem 1.5rem;
		border-radius: var(--radius-lg);
		background: var(--green-100);
		display: grid;
		gap: 0.9rem;
	}
	.support .t-label {
		color: var(--green-700);
	}
	.support ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem 1.5rem;
		font-size: 0.92rem;
	}
	.support li,
	.reqs li {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
	}
	.support :global(svg),
	.reqs :global(svg) {
		margin-top: 0.3rem;
		color: var(--brand-primary);
		flex: none;
	}

	.modes {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
	}
	.mode {
		display: grid;
		gap: 0.4rem;
		align-content: start;
		padding: 1.1rem 1.2rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.07);
		font-size: 0.84rem;
		color: var(--text-secondary);
	}
	.mode strong {
		color: var(--ink);
		font-weight: 600;
		font-size: 0.98rem;
	}
	.batches {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		border-top: 1px solid var(--border);
	}
	.batches li {
		display: grid;
		grid-template-columns: 1.5rem 10rem minmax(0, 1fr);
		align-items: center;
		padding: 0.8rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.9rem;
		color: var(--text-secondary);
	}
	.batches :global(svg) {
		color: var(--brand-primary);
	}
	.batches strong {
		color: var(--ink);
		font-weight: 600;
	}
	.next {
		margin-top: 1rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.cert-block {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 2rem;
		align-items: center;
	}
	.cert {
		position: relative;
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		padding: 2rem 1.5rem;
		border-radius: var(--radius-md);
		background: var(--surface);
		box-shadow:
			0 0 0 1px rgb(23 25 22 / 0.07),
			inset 0 0 0 8px var(--surface-soft),
			inset 0 0 0 9px var(--green-300),
			var(--shadow-soft);
		text-align: center;
		transform: rotate(-1.5deg);
	}
	.cert img {
		width: 3.5rem;
		height: auto;
	}
	.c-k {
		font-size: 0.6rem;
		font-weight: 650;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--green-600);
	}
	.c-t {
		font-family: var(--font-display);
		font-size: 1.35rem;
		line-height: 1.15;
		color: var(--ink);
	}
	.c-b {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.cert-copy {
		display: grid;
		gap: 0.8rem;
	}
	.cert-t {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 2.4vw, 2rem);
		line-height: 1.15;
		color: var(--ink);
	}
	.muted-p {
		color: var(--text-secondary);
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

	/* Fees + enquiry */
	.side {
		position: relative;
		min-width: 0;
	}
	.panel {
		position: sticky;
		top: calc(var(--bar-height) + 4.5rem);
		margin-top: clamp(2.5rem, 5vw, 3.75rem);
		padding: 1.6rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-soft);
		display: grid;
		gap: 1rem;
	}
	.p-meta {
		font-size: 0.82rem;
		color: var(--text-secondary);
	}
	.p-form {
		display: grid;
		gap: 0.9rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.p-k {
		font-weight: 600;
		color: var(--ink);
	}
	.includes {
		list-style: none;
		margin: 0;
		padding: 1rem 0 0;
		border-top: 1px solid var(--border);
		display: grid;
		gap: 0.55rem;
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
		gap: 1.25rem;
		align-content: start;
		justify-items: start;
	}
	.rel-grid {
		grid-column: 5 / -1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	@media (max-width: 1100px) {
		.facts {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.layout {
			grid-template-columns: minmax(0, 1fr) 19rem;
			gap: 2.5rem;
		}
	}
	@media (max-width: 900px) {
		.hero-copy,
		.hero-media {
			grid-column: 1 / -1;
		}
		.hero-media {
			margin-top: 0.5rem;
		}
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			order: -1;
		}
		.panel {
			position: static;
			margin-top: 2rem;
		}
		.outcomes,
		.reviews,
		.modes,
		.cert-block {
			grid-template-columns: minmax(0, 1fr);
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
		.facts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.rel-grid,
		.roles,
		.support ul {
			grid-template-columns: minmax(0, 1fr);
		}
		.batches li {
			grid-template-columns: 1.5rem minmax(0, 1fr);
		}
		.batches li span {
			grid-column: 2;
		}
	}
</style>
