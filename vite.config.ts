import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
// the same handler the Firebase Function runs in production
import { handleInterest } from './functions/interest.js';

/**
 * Serves POST /api/interest during `vite dev` / `vite preview`, reading
 * RESEND_API_KEY, RESEND_FROM and INTEREST_TO from .env. Without a key the
 * email is logged instead of sent, so the form can be tried locally.
 */
function interestApi(mode: string): Plugin {
	const env = loadEnv(mode, process.cwd(), '');
	const middleware: Connect.NextHandleFunction = async (req, res, next) => {
		if (req.url?.split('?')[0] !== '/api/interest') return next();
		const send = (status: number, body: unknown) => {
			res.statusCode = status;
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(body));
		};
		if (req.method !== 'POST') return send(405, { ok: false, error: 'Method not allowed' });
		let raw = '';
		for await (const chunk of req) raw += chunk;
		let body: unknown;
		try {
			body = JSON.parse(raw);
		} catch {
			return send(400, { ok: false, error: 'Invalid JSON' });
		}
		const { status, body: out } = await handleInterest(body, {
			apiKey: env.RESEND_API_KEY,
			from: env.RESEND_FROM,
			to: env.INTEREST_TO,
			ip: req.socket.remoteAddress,
			dryRun: true,
			log: (m: string) => console.log(m)
		});
		send(status, out);
	};
	return {
		name: 'sympholearn-interest-api',
		configureServer: (server) => void server.middlewares.use(middleware),
		configurePreviewServer: (server) => void server.middlewares.use(middleware)
	};
}

export default defineConfig(({ mode }) => ({
	plugins: [tailwindcss(), sveltekit(), interestApi(mode)]
}));
