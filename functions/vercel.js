/**
 * Vercel Function behind `/api/interest` (the `api` service in ../vercel.json).
 * Same handler as the Firebase Function in index.js; set RESEND_API_KEY,
 * RESEND_FROM and INTEREST_TO in the Vercel project's environment variables.
 */
import { handleInterest } from './interest.js';

const json = (status, body, headers = {}) =>
	Response.json(body, { status, headers });

export default {
	async fetch(request) {
		const { pathname } = new URL(request.url);
		if (pathname !== '/api/interest') return json(404, { ok: false, error: 'Not found' });
		if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' }, { Allow: 'POST' });

		let body;
		try {
			body = await request.json();
		} catch {
			return json(400, { ok: false, error: 'Invalid JSON' });
		}
		const { status, body: out } = await handleInterest(body, {
			apiKey: process.env.RESEND_API_KEY,
			from: process.env.RESEND_FROM,
			to: process.env.INTEREST_TO,
			ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim(),
			log: (m) => console.warn(m)
		});
		return json(status, out);
	}
};
