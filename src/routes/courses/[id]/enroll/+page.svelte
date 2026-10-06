<script lang="ts">
	import { tick } from 'svelte';
	import { ArrowLeft, ArrowRight, Check, Mail, Phone, User, PlayCircle, Clock, BarChart3, Award, RotateCcw } from '@lucide/svelte';
	import Field from '$lib/components/form/Field.svelte';
	import Spinner from '$lib/components/form/Spinner.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Button from '$lib/components/Button.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { site } from '$lib/data/catalog';
	import { getCategory } from '$lib/services/courseService';
	import { allLessons, formatPrice, lessonCount } from '$lib/utils/course';

	let { data } = $props();
	const course = $derived(data.course);
	const first = $derived(allLessons(course)[0]);

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let message = $state('');
	let company = $state(''); // honeypot
	let submitted = $state(false);
	let busy = $state(false);
	let sent = $state(false);
	let failure = $state('');
	let serverErrors = $state<Record<string, string>>({});

	const errors = $derived.by(() => {
		if (!submitted) return {} as Record<string, string>;
		const e: Record<string, string> = {};
		if (name.trim().length < 2) e.name = 'Enter your name.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'Enter a valid email address.';
		if (phone.trim() && !/^\+?[\d\s()-]{7,24}$/.test(phone.trim())) e.phone = 'Use digits, spaces and an optional +.';
		return { ...e, ...serverErrors };
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitted = true;
		serverErrors = {};
		failure = '';
		await tick();
		if (Object.keys(errors).length) {
			document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			return;
		}
		busy = true;
		try {
			const res = await fetch('/api/interest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					phone,
					message,
					company,
					courseId: course.id,
					courseTitle: course.title,
					price: formatPrice(course.price.offer, site.currency, site.locale),
					page: location.href
				})
			});
			const out = await res.json().catch(() => ({}));
			if (res.ok && out.ok) {
				sent = true;
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else if (out.errors) {
				serverErrors = out.errors;
			} else {
				failure = out.error ?? 'We couldn’t send that just now. Please try again.';
			}
		} catch {
			failure = 'You seem to be offline. Check your connection and try again.';
		} finally {
			busy = false;
		}
	}

	function reset() {
		sent = false;
		submitted = false;
		message = '';
	}
</script>

<svelte:head>
	<title>Enroll · {course.title} — SymphoLearn</title>
</svelte:head>

<div class="enroll container-x">
	<a class="back" href="/courses/{course.id}"><ArrowLeft size={15} strokeWidth={1.6} /> <span>{course.title}</span></a>

	<div class="layout">
		<div class="main">
			{#if sent}
				<section class="done" aria-live="polite">
					<span class="seal" aria-hidden="true"><Check size={26} strokeWidth={2.2} /></span>
					<p class="eyebrow">Interest received</p>
					<h1 class="t-h1">Thank you, <em class="italic-accent">{name.trim().split(' ')[0]}.</em></h1>
					<p class="lede">
						We’ve let the SymphoZen team know you’re interested in <strong>{course.title}</strong>. Expect a
						personal reply at <strong>{email.trim()}</strong> soon.
					</p>
					<div class="d-actions">
						<Button href="/learn/{course.id}?lesson={first.id}" size="lg" arrow magnetic>Preview lesson {first.number}</Button>
						<Button variant="ghost" size="lg" onclick={reset}>
							{#snippet icon()}<RotateCcw size={16} strokeWidth={1.6} />{/snippet}
							Send another
						</Button>
					</div>
				</section>
			{:else}
				<header class="head">
					<p class="eyebrow">Enroll · {getCategory(course.category).name}</p>
					<h1 class="t-h1">Join <em class="italic-accent">{course.title}.</em></h1>
					<p class="lede">Leave your details and the SymphoZen team will reach out personally to get you started.</p>
				</header>

				<form class="form" onsubmit={submit} novalidate>
					<div class="cols">
						<Field id="name" label="Your name" autocomplete="name" placeholder="Maya Chen" bind:value={name} error={errors.name}>
							{#snippet icon()}<User size={16} strokeWidth={1.6} />{/snippet}
						</Field>
						<Field id="email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" bind:value={email} error={errors.email}>
							{#snippet icon()}<Mail size={16} strokeWidth={1.6} />{/snippet}
						</Field>
					</div>
					<Field id="phone" label="Phone" type="tel" autocomplete="tel" placeholder="+91 98765 43210" optional bind:value={phone} error={errors.phone}>
						{#snippet icon()}<Phone size={16} strokeWidth={1.6} />{/snippet}
					</Field>
					<div class="field">
						<label for="message">Anything you’d like us to know? <span class="opt">Optional</span></label>
						<textarea id="message" rows="4" maxlength="600" placeholder="Your goals, your schedule, questions about the course…" bind:value={message}></textarea>
						<p class="count">{message.length}/600</p>
					</div>
					<!-- honeypot: hidden from people, irresistible to bots -->
					<div class="hp" aria-hidden="true">
						<label for="company">Company</label>
						<input id="company" tabindex="-1" autocomplete="off" bind:value={company} />
					</div>

					{#if failure}<p class="fail" role="alert">{failure}</p>{/if}
					<button class="submit" type="submit" disabled={busy}>
						{#if busy}<Spinner /> Sending…{:else}I’m interested <ArrowRight size={16} strokeWidth={1.75} />{/if}
					</button>
					<p class="fine">No payment now. We only use your details to contact you about this course.</p>
				</form>
			{/if}
		</div>

		<aside class="summary">
			<div class="sum-card">
				<img src={course.thumbnail} alt="" width="1600" height="1000" />
				<div class="sum-body">
					<p class="t-label">{getCategory(course.category).name}</p>
					<p class="sum-title">{course.title}</p>
					<p class="sum-ins"><Avatar person={course.instructor} size={28} /><span>{course.instructor.name}</span></p>
					<div class="sum-price">
						<p class="t-label offer-k">{site.offerNote}</p>
						<PriceTag price={course.price} size="md" note />
					</div>
					<ul class="sum-list">
						<li><PlayCircle size={15} strokeWidth={1.5} /> {lessonCount(course)} video lessons</li>
						<li><Clock size={15} strokeWidth={1.5} /> {course.duration} total</li>
						<li><BarChart3 size={15} strokeWidth={1.5} /> {course.level}</li>
						<li><Award size={15} strokeWidth={1.5} /> Certificate of completion</li>
					</ul>
				</div>
			</div>
		</aside>
	</div>
</div>

<style>
	.enroll {
		padding-top: calc(var(--nav-height) + clamp(1.5rem, 4vw, 3rem));
		padding-bottom: var(--section-space);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		max-width: 100%;
		font-size: 0.86rem;
		color: var(--text-secondary);
		transition: color var(--duration-normal);
	}
	.back span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.back:hover {
		color: var(--ink);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 23rem);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: start;
		margin-top: clamp(1.75rem, 4vw, 3rem);
	}
	.main {
		min-width: 0;
	}
	.head {
		display: grid;
		gap: 1rem;
		margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
	}
	.head .t-h1,
	.done .t-h1 {
		font-size: clamp(2.3rem, 5vw, 4rem);
		overflow-wrap: anywhere;
	}
	.lede {
		color: var(--text-secondary);
		font-size: var(--fs-body-lg);
		max-width: 36rem;
	}
	.lede strong {
		font-weight: 500;
		color: var(--ink);
		overflow-wrap: anywhere;
	}
	.form {
		display: grid;
		gap: 1.15rem;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.15rem 1.25rem;
	}
	.field {
		display: grid;
		gap: 0.45rem;
	}
	.field label {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.84rem;
		font-weight: 500;
		color: var(--ink);
	}
	.opt {
		font-weight: 400;
		font-size: 0.74rem;
		color: var(--text-muted);
	}
	textarea {
		width: 100%;
		min-height: 7rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
		background: var(--surface);
		font: inherit;
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--ink);
		resize: vertical;
		transition:
			border-color var(--duration-normal),
			box-shadow var(--duration-normal);
	}
	textarea:hover {
		border-color: var(--gray-500);
	}
	textarea:focus {
		outline: none;
		border-color: var(--brand-primary);
		box-shadow: 0 0 0 4px rgb(90 138 69 / 0.14);
	}
	.count {
		justify-self: end;
		font-size: 0.74rem;
		color: var(--text-muted);
	}
	.hp {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
	.fail {
		padding: 0.8rem 1rem;
		border-radius: var(--radius-md);
		background: rgb(181 72 59 / 0.08);
		color: var(--error);
		font-size: 0.86rem;
	}
	.form .submit {
		height: 3.5rem;
		font-size: 1rem;
	}
	.fine {
		text-align: center;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	/* sent */
	.done {
		display: grid;
		gap: 1.1rem;
		justify-items: start;
		animation: rise 700ms var(--ease-out) both;
	}
	.seal {
		display: grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: var(--brand-primary);
		color: #fff;
		box-shadow: 0 0 0 8px var(--green-100);
		animation: pop 650ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	.d-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.75rem;
	}
	@keyframes pop {
		from {
			transform: scale(0.4);
			opacity: 0;
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	/* summary */
	.summary {
		position: sticky;
		top: calc(var(--nav-height) + 1.5rem);
		min-width: 0;
	}
	.sum-card {
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
	}
	.sum-card img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
	.sum-body {
		padding: 1.4rem;
		display: grid;
		gap: 0.6rem;
	}
	.sum-title {
		font-family: var(--font-display);
		font-size: 1.45rem;
		line-height: 1.15;
		color: var(--ink);
	}
	.sum-ins {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}
	.sum-price {
		margin-top: 0.4rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.offer-k {
		margin-bottom: 0.5rem;
	}
	.sum-list {
		list-style: none;
		margin: 0.4rem 0 0;
		padding: 1rem 0 0;
		border-top: 1px solid var(--border);
		display: grid;
		gap: 0.55rem;
		font-size: 0.84rem;
		color: var(--text-secondary);
	}
	.sum-list li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	@media (max-width: 960px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.summary {
			position: static;
			order: -1;
		}
		.sum-card {
			display: grid;
			grid-template-columns: 9rem minmax(0, 1fr);
		}
		.sum-card img {
			height: 100%;
			aspect-ratio: auto;
		}
		.sum-list {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
		.sum-card {
			grid-template-columns: minmax(0, 1fr);
		}
		.sum-card img {
			aspect-ratio: 16 / 7;
		}
		.sum-body {
			padding: 1.1rem;
		}
		.sum-title {
			font-size: 1.2rem;
		}
	}
</style>
