import type { SiteSettings } from '$lib/types';

/** Bundled defaults for the site-settings singleton (Sanity overrides these at build time). */
export const siteSeed: SiteSettings = {
	tagline: 'Learn with SymphoZen',
	taglineNote: 'Calm, considered courses from the SymphoZen Labs studio — made to be finished, not just started.',
	currency: 'INR',
	locale: 'en-IN',
	offerNote: 'Launch offer',
	heroCourseId: 'full-stack-web-development',
	contactEmail: 'hello@symphozen.com'
};
