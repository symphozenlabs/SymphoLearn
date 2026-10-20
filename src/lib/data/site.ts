import type { SiteSettings } from '$lib/types';

/** Bundled defaults for the site-settings singleton (Sanity overrides these at build time). */
export const siteSeed: SiteSettings = {
	tagline: 'Beyond Classrooms. Into Possibilities',
	taglineNote:
		'Mentor-led, project-first training from the SymphoZen Labs team — built to take you from learning to working.',
	currency: 'INR',
	locale: 'en-IN',
	offerNote: 'Early-bird offer',
	announcement: 'New batches start every month · Book a free demo class',
	contactEmail: 'hello@symphozen.com',
	// Fill these in (here or in the Studio) to switch on call / WhatsApp buttons and the address
	phone: '',
	whatsapp: '',
	address: '',
	hours: 'Mon – Sat · 9:30 am – 7:00 pm'
};

/** The academy's name, as on the logo. */
export const BRAND = 'SymphoZen Academia';
