<!--
	EnquiryForm — the one lead form behind every "Book a free demo", "Free
	counselling", course enquiry, corporate and contact form on the site.
	It posts to /api/interest (functions/interest.js) and swaps itself for a
	thank-you note once the team has been told.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import { ArrowRight, Check, Mail, Phone, User, Building2, RotateCcw, MessageCircle } from '@lucide/svelte';
	import Field from './form/Field.svelte';
	import Spinner from './form/Spinner.svelte';
	import { courses, categories, site, whatsappHref } from '$lib/data/catalog';
	import { modes } from '$lib/data/academy';
	import { formatPrice } from '$lib/utils/course';
	import type { EnquiryKind } from '$lib/stores/enquiry.svelte';

	interface Props {
		kind?: EnquiryKind;
		/** pre-selected course */
		courseId?: string;
		/** hide the course picker (the page is already about one course) */
		lockCourse?: boolean;
		/** compact: name, phone, course · full: adds email, mode and a note */
		size?: 'compact' | 'full';
		submitLabel?: string;
		/** unique per page, so several forms can share it */
		uid?: string;
	}

	let {
		kind = 'demo',
		courseId = '',
		lockCourse = false,
		size = 'full',
		submitLabel,
		uid = 'enq'
	}: Props = $props();

	const corporate = $derived(kind === 'corporate');
	const label = $derived(
		submitLabel ??
			{
				demo: 'Book my free demo',
				counselling: 'Book my free call',
				course: 'Send enquiry',
				corporate: 'Request a proposal',
				contact: 'Send enquiry'
			}[kind]
	);

	let name = $state('');
	let phone = $state('');
	let email = $state('');
	let course = $state('');
	let mode = $state('');
	let organisation = $state('');
	let teamSize = $state('');
	let message = $state('');
	let company = $state(''); // honeypot
	let submitted = $state(false);
	let busy = $state(false);
	let sent = $state(false);
	let failure = $state('');
	let serverErrors = $state<Record<string, string>>({});

	// follow the pre-selected course (the dialog reuses one form for every button)
	$effect(() => {
		course = courseId;
	});

	const chosen = $derived(courses.find((c) => c.id === course));
	const grouped = categories.map((cat) => ({ cat, list: courses.filter((c) => c.category === cat.id) }));

	const errors = $derived.by(() => {
		if (!submitted) return {} as Record<string, string>;
		const e: Record<string, string> = {};
		if (name.trim().length < 2) e.name = 'Enter your name.';
		if (!/^\+?[\d\s()-]{7,24}$/.test(phone.trim())) e.phone = 'Enter a phone number we can call you on.';
		const mail = email.trim();
		if ((corporate || mail) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) e.email = 'Enter a valid email address.';
		if (corporate && organisation.trim().length < 2) e.organisation = 'Enter your organisation’s name.';
		return { ...e, ...serverErrors };
	});

	let form = $state<HTMLFormElement>();

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitted = true;
		serverErrors = {};
		failure = '';
		await tick();
		if (Object.keys(errors).length) {
			form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			return;
		}
		busy = true;
		try {
			const res = await fetch('/api/interest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					kind,
					name,
					phone,
					email,
					message,
					mode,
					organisation,
					teamSize,
					company,
					courseId: chosen?.id ?? '',
					courseTitle: chosen?.title ?? '',
					price: chosen ? formatPrice(chosen.price.offer, site.currency, site.locale) : '',
					page: location.href
				})
			});
			const out = await res.json().catch(() => ({}));
			if (res.ok && out.ok) sent = true;
			else if (out.errors) serverErrors = out.errors;
			else failure = out.error ?? 'We couldn’t send that just now. Please try again.';
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

	const wa = $derived(whatsappHref(chosen ? `Hi SymphoZen Academia, I just enquired about ${chosen.title}.` : undefined));
</script>

{#if sent}
	<div class="done" aria-live="polite">
		<span class="seal" aria-hidden="true"><Check size={22} strokeWidth={2.4} /></span>
		<p class="d-title">Thank you, {name.trim().split(' ')[0]}.</p>
		<p class="d-body">
			{#if corporate}
				Our corporate team will reach out to <strong>{email.trim()}</strong> within one working day with next steps.
			{:else}
				A counsellor will call you on <strong>{phone.trim()}</strong> within one working day{chosen
					? ` about ${chosen.title}`
					: ''}.
			{/if}
		</p>
		<div class="d-actions">
			{#if wa}
				<a class="wa" href={wa} target="_blank" rel="noopener"><MessageCircle size={16} strokeWidth={1.8} /> Chat on WhatsApp</a>
			{/if}
			<button type="button" class="again" onclick={reset}><RotateCcw size={14} strokeWidth={1.8} /> Send another</button>
		</div>
	</div>
{:else}
	<form class="form {size}" bind:this={form} onsubmit={submit} novalidate>
		<div class="cols">
			<Field id="{uid}-name" label="Your name" autocomplete="name" placeholder="Full name" bind:value={name} error={errors.name}>
				{#snippet icon()}<User size={16} strokeWidth={1.6} />{/snippet}
			</Field>
			<Field
				id="{uid}-phone"
				label={corporate ? 'Phone' : 'Phone / WhatsApp'}
				type="tel"
				inputmode="tel"
				autocomplete="tel"
				placeholder="+91 ••••• •••••"
				bind:value={phone}
				error={errors.phone}
			>
				{#snippet icon()}<Phone size={16} strokeWidth={1.6} />{/snippet}
			</Field>
		</div>

		{#if corporate}
			<div class="cols">
				<Field id="{uid}-org" label="Organisation" autocomplete="organization" placeholder="Company or college" bind:value={organisation} error={errors.organisation}>
					{#snippet icon()}<Building2 size={16} strokeWidth={1.6} />{/snippet}
				</Field>
				<Field id="{uid}-email" label="Work email" type="email" autocomplete="email" placeholder="you@company.com" bind:value={email} error={errors.email}>
					{#snippet icon()}<Mail size={16} strokeWidth={1.6} />{/snippet}
				</Field>
			</div>
			<div class="field">
				<label for="{uid}-team">People to train</label>
				<select id="{uid}-team" bind:value={teamSize}>
					<option value="">Select team size</option>
					<option>1 – 10</option>
					<option>11 – 50</option>
					<option>51 – 200</option>
					<option>200+</option>
				</select>
			</div>
		{:else if size === 'full'}
			<Field id="{uid}-email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" optional bind:value={email} error={errors.email}>
				{#snippet icon()}<Mail size={16} strokeWidth={1.6} />{/snippet}
			</Field>
		{/if}

		{#if !lockCourse && !corporate}
			<div class="field">
				<label for="{uid}-course">I’m interested in</label>
				<select id="{uid}-course" bind:value={course}>
					<option value="">Not sure yet — help me choose</option>
					{#each grouped as g (g.cat.id)}
						<optgroup label={g.cat.name}>
							{#each g.list as c (c.id)}<option value={c.id}>{c.title}</option>{/each}
						</optgroup>
					{/each}
				</select>
			</div>
		{/if}

		{#if size === 'full' && !corporate}
			<div class="field">
				<span class="lbl" id="{uid}-mode-l">Preferred mode <span class="opt">Optional</span></span>
				<div class="modes" role="radiogroup" aria-labelledby="{uid}-mode-l">
					{#each modes.filter((m) => m.id !== 'corporate') as m (m.id)}
						<label class="mode" class:on={mode === m.id}>
							<input type="radio" name="{uid}-mode" value={m.id} bind:group={mode} />
							{m.title}
						</label>
					{/each}
				</div>
			</div>
		{/if}

		{#if size === 'full' || corporate}
			<div class="field">
				<label for="{uid}-msg">{corporate ? 'What would you like your team to learn?' : 'Anything we should know?'} <span class="opt">Optional</span></label>
				<textarea
					id="{uid}-msg"
					rows="3"
					maxlength="600"
					placeholder={corporate ? 'Skills, tools, timelines, on-site or online…' : 'Your background, goals, preferred timings…'}
					bind:value={message}
				></textarea>
			</div>
		{/if}

		<!-- honeypot: hidden from people, irresistible to bots -->
		<div class="hp" aria-hidden="true">
			<label for="{uid}-company">Company</label>
			<input id="{uid}-company" tabindex="-1" autocomplete="off" bind:value={company} />
		</div>

		{#if failure}<p class="fail" role="alert">{failure}</p>{/if}
		<button class="submit" type="submit" disabled={busy}>
			{#if busy}<Spinner /> Sending…{:else}{label} <ArrowRight size={16} strokeWidth={1.75} />{/if}
		</button>
		<p class="fine">No spam, no obligation. We only use your details to get back to you.</p>
	</form>
{/if}

<style>
	.form {
		display: grid;
		gap: 1rem;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 1.1rem;
	}
	.compact .cols {
		grid-template-columns: minmax(0, 1fr);
	}
	.field {
		display: grid;
		gap: 0.45rem;
		min-width: 0;
	}
	.field label,
	.lbl {
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
	select,
	textarea {
		width: 100%;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
		background-color: var(--surface);
		font: inherit;
		font-size: 0.95rem;
		color: var(--ink);
		transition:
			border-color var(--duration-normal),
			box-shadow var(--duration-normal);
	}
	select {
		height: 3.15rem;
		padding: 0 2.5rem 0 1rem;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='m4 6 4 4 4-4' fill='none' stroke='%2390948c' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.9rem center;
		background-size: 1rem;
		text-overflow: ellipsis;
	}
	textarea {
		min-height: 6rem;
		padding: 0.85rem 1rem;
		line-height: 1.55;
		resize: vertical;
	}
	select:hover,
	textarea:hover {
		border-color: var(--gray-500);
	}
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--brand-primary);
		box-shadow: 0 0 0 4px rgb(90 138 69 / 0.14);
	}

	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}
	.mode {
		position: relative;
		display: inline-flex;
		align-items: center;
		height: 2.5rem;
		padding: 0 1rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-pill);
		font-size: 0.85rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			border-color var(--duration-fast),
			background var(--duration-fast),
			color var(--duration-fast);
	}
	.mode input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.mode:hover {
		border-color: var(--gray-500);
	}
	.mode.on {
		border-color: var(--brand-primary);
		background: var(--green-100);
		color: var(--ink);
	}
	.mode:has(input:focus-visible) {
		outline: 2px solid var(--brand-primary);
		outline-offset: 2px;
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
		height: 3.4rem;
		font-size: 0.92rem;
	}
	.fine {
		text-align: center;
		font-size: 0.76rem;
		color: var(--text-muted);
	}

	/* sent */
	.done {
		display: grid;
		gap: 0.8rem;
		justify-items: start;
		padding: 0.5rem 0;
		animation: rise 600ms var(--ease-out) both;
	}
	.seal {
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 50%;
		background: var(--brand-primary);
		color: #fff;
		box-shadow: 0 0 0 7px var(--green-100);
		margin-bottom: 0.4rem;
		animation: pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	.d-title {
		font-family: var(--font-display);
		font-size: 1.75rem;
		line-height: 1.1;
		color: var(--ink);
	}
	.d-body {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}
	.d-body strong {
		font-weight: 500;
		color: var(--ink);
		overflow-wrap: anywhere;
	}
	.d-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 0.4rem;
	}
	.wa,
	.again {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 2.6rem;
		padding: 0 1rem;
		border-radius: var(--button-radius);
		font-size: 0.82rem;
		font-weight: 600;
	}
	.wa {
		background: var(--brand-primary);
		color: #fff;
	}
	.again {
		border: 1px solid var(--border);
		background: none;
		color: var(--text-secondary);
	}
	.again:hover {
		color: var(--ink);
		border-color: var(--border-strong);
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
			transform: translateY(10px);
		}
	}
	@media (max-width: 560px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
