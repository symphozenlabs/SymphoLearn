/**
 * Firebase Function behind `/api/interest` (see the rewrite in ../firebase.json).
 *
 *   firebase functions:secrets:set RESEND_API_KEY
 *   # functions/.env  →  RESEND_FROM="SymphoLearn <hello@your-domain.com>"
 *   #                    INTEREST_TO=team@your-domain.com
 */
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { handleInterest } from './interest.js';

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

export const interest = onRequest(
	{ secrets: [RESEND_API_KEY], maxInstances: 5, timeoutSeconds: 15, memory: '256MiB' },
	async (req, res) => {
		if (req.method !== 'POST') {
			res.set('Allow', 'POST').status(405).json({ ok: false, error: 'Method not allowed' });
			return;
		}
		const { status, body } = await handleInterest(req.body, {
			apiKey: RESEND_API_KEY.value(),
			from: process.env.RESEND_FROM,
			to: process.env.INTEREST_TO,
			ip: req.ip,
			log: (m) => logger.warn(m)
		});
		res.status(status).json(body);
	}
);
