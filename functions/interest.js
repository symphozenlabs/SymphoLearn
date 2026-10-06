/**
 * Course-interest handler — the one piece of server code the static site needs.
 *
 * A visitor clicks "Enroll" and leaves their name + email; this sends ONE email
 * (via Resend) to the SymphoZen team saying that person is interested in that
 * course, with reply-to set to the visitor so the team can answer directly.
 *
 * Shared by the Firebase Function (production, `index.js`) and the Vite dev
 * server (`vite.config.ts`), so local and deployed behaviour match.
 * Plain JS with no dependencies: Resend is called over its HTTP API.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,95}$/;

/** @param {unknown} s */
const esc = (s) =>
	String(s).replace(/[&<>"']/g, (c) => /** @type {Record<string, string>} */ ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/** @param {unknown} v @param {number} max */
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Best-effort burst protection per client (per warm instance). */
/** @type {Map<string, number[]>} */
const recent = new Map();
/** @param {string} key */
function limited(key, now = Date.now()) {
	const hits = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
	hits.push(now);
	recent.set(key, hits);
	if (recent.size > 5000) recent.clear();
	return hits.length > 5;
}

/**
 * @typedef {{ name: string, email: string, phone: string, message: string, courseId: string,
 *   courseTitle: string, price: string, page: string, company: string }} Interest
 */

/**
 * Validates the form.
 * @param {unknown} body
 * @returns {{ data: Interest, errors?: undefined } | { errors: Record<string, string>, data?: undefined }}
 */
export function parseInterest(body) {
	const b = /** @type {Record<string, unknown>} */ (body && typeof body === 'object' ? body : {});
	const data = {
		name: clean(b.name, 80),
		email: clean(b.email, 120).toLowerCase(),
		phone: clean(b.phone, 24),
		message: typeof b.message === 'string' ? b.message.trim().slice(0, 600) : '',
		courseId: clean(b.courseId, 96),
		courseTitle: clean(b.courseTitle, 140),
		price: clean(b.price, 40),
		page: clean(b.page, 300),
		// honeypot: humans never see this field
		company: clean(b.company, 100)
	};
	/** @type {Record<string, string>} */
	const errors = {};
	if (data.name.length < 2) errors.name = 'Enter your name.';
	if (!EMAIL_RE.test(data.email)) errors.email = 'Enter a valid email address.';
	if (data.phone && !/^\+?[\d\s()-]{7,24}$/.test(data.phone)) errors.phone = 'Use digits, spaces and an optional +.';
	if (!SLUG_RE.test(data.courseId) || !data.courseTitle) errors.course = 'Unknown course.';
	return Object.keys(errors).length ? { errors } : { data };
}

/** @param {Interest} d */
export function interestEmail(d) {
	const when = new Date().toUTCString();
	const subject = `${d.name} is interested in ${d.courseTitle}`;
	/** @param {string} k @param {string} v */
	const row = (k, v) =>
		v
			? `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7e2;color:#90948c;font:13px Helvetica,Arial,sans-serif;width:120px">${k}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7e2;color:#171916;font:500 14px Helvetica,Arial,sans-serif">${v}</td></tr>`
			: '';
	const html = `<!doctype html><html><body style="margin:0;background:#f4f5f1">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f1"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e5e7e2;border-radius:18px">
<tr><td style="padding:32px 32px 28px">
<p style="margin:0 0 12px;font:600 12px Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#5a8a45">Course interest</p>
<h1 style="margin:0;font:500 26px/1.25 Georgia,'Times New Roman',serif;color:#171916"><strong style="font-weight:600">${esc(d.name)}</strong> is interested in <em style="color:#5a8a45">${esc(d.courseTitle)}</em>.</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #e5e7e2">
${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#171916">${esc(d.email)}</a>`)}
${row('Phone', esc(d.phone))}
${row('Course', esc(d.courseTitle))}
${row('Price shown', esc(d.price))}
${row('Received', esc(when))}
</table>
${d.message ? `<p style="margin:22px 0 0;padding:14px 16px;border-left:3px solid #5a8a45;background:#f4f5f1;font:italic 15px/1.6 Georgia,serif;color:#171916">“${esc(d.message)}”</p>` : ''}
<p style="margin:22px 0 0;font:13px/1.6 Helvetica,Arial,sans-serif;color:#646464">Reply to this email to reach ${esc(d.name.split(' ')[0])} directly.${d.page ? ` Sent from <a href="${esc(d.page)}" style="color:#646464">${esc(d.page)}</a>.` : ''}</p>
</td></tr></table>
<p style="margin:16px 0 0;font:12px Helvetica,Arial,sans-serif;color:#90948c">SymphoLearn · Learn with SymphoZen</p>
</td></tr></table></body></html>`;
	const details = [
		`Email: ${d.email}`,
		d.phone ? `Phone: ${d.phone}` : '',
		d.price ? `Price shown: ${d.price}` : '',
		d.message ? `Note: “${d.message}”` : '',
		`Received: ${when}`,
		d.page ? `Page: ${d.page}` : ''
	].filter(Boolean);
	const text = [`${d.name} is interested in ${d.courseTitle}.`, '', ...details].join('\n');
	return { subject, html, text };
}

/**
 * @param {unknown} body  parsed JSON body
 * @param {{ apiKey?: string, from?: string, to?: string, ip?: string, dryRun?: boolean, log?: (m: string) => void }} env
 * @returns {Promise<{ status: number, body: Record<string, unknown> }>}
 */
export async function handleInterest(body, env) {
	const parsed = parseInterest(body);
	if (parsed.errors) return { status: 422, body: { ok: false, errors: parsed.errors } };
	const d = parsed.data;
	// bots fill every field; pretend success so they learn nothing
	if (d.company) return { status: 200, body: { ok: true } };
	if (env.ip && limited(env.ip)) return { status: 429, body: { ok: false, error: 'Too many requests — please try again in a few minutes.' } };

	const mail = interestEmail(d);
	const to = (env.to ?? '').split(',').map((s) => s.trim()).filter(Boolean);

	if (!env.apiKey || !env.from || !to.length) {
		if (env.dryRun) {
			env.log?.(`[interest] email not configured — would send to ${to.join(', ') || '(INTEREST_TO unset)'}: ${mail.subject}`);
			return { status: 200, body: { ok: true, simulated: true } };
		}
		return { status: 503, body: { ok: false, error: 'Email is not configured on the server.' } };
	}

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from: env.from,
			to,
			reply_to: d.email,
			subject: mail.subject,
			html: mail.html,
			text: mail.text,
			tags: [
				{ name: 'category', value: 'course_interest' },
				{ name: 'course', value: d.courseId }
			]
		})
	});
	if (!res.ok) {
		env.log?.(`[interest] Resend ${res.status}: ${await res.text().catch(() => '')}`);
		return { status: 502, body: { ok: false, error: 'We couldn’t send that just now. Please try again.' } };
	}
	const { id } = await res.json().catch(() => ({}));
	return { status: 200, body: { ok: true, id } };
}
