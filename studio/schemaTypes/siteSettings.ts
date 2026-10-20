import { CogIcon } from '@sanity/icons/Cog';
import { defineField, defineType } from 'sanity';

/** Singleton (document id "siteSettings") — opened directly from the Studio sidebar. */
export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Site settings',
	type: 'document',
	icon: CogIcon,
	fields: [
		defineField({
			name: 'tagline',
			type: 'string',
			description: 'The signature line on the home page and footer. The last word is set in italic.',
			initialValue: 'Beyond Classrooms. Into Possibilities',
			validation: (r) => r.required().max(48)
		}),
		defineField({ name: 'taglineNote', title: 'Line under the tagline', type: 'text', rows: 2, validation: (r) => r.max(180) }),
		defineField({
			name: 'currency',
			type: 'string',
			description: 'Used for every course price',
			options: {
				list: [
					{ title: 'Indian rupee (₹)', value: 'INR' },
					{ title: 'US dollar ($)', value: 'USD' },
					{ title: 'Euro (€)', value: 'EUR' },
					{ title: 'British pound (£)', value: 'GBP' },
					{ title: 'UAE dirham', value: 'AED' },
					{ title: 'Singapore dollar', value: 'SGD' }
				]
			},
			initialValue: 'INR',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'locale',
			type: 'string',
			description: 'Number formatting, e.g. en-IN (₹12,999) or en-US ($129.00)',
			initialValue: 'en-IN',
			validation: (r) => r.required().regex(/^[a-z]{2}(-[A-Z]{2})?$/, { name: 'locale' })
		}),
		defineField({ name: 'offerNote', title: 'Offer label', type: 'string', description: 'Shown above prices, e.g. "Early-bird offer"', initialValue: 'Early-bird offer' }),
		defineField({
			name: 'announcement',
			title: 'Announcement bar',
			type: 'string',
			description: 'The line at the very top of every page, e.g. "New batches start every month · Book a free demo class"',
			validation: (r) => r.max(90)
		}),
		defineField({ name: 'contactEmail', title: 'Contact email', type: 'string', validation: (r) => r.email() }),
		defineField({ name: 'phone', title: 'Phone', type: 'string', description: 'As shown to visitors, e.g. +91 98765 43210. Leave empty to hide call buttons.' }),
		defineField({
			name: 'whatsapp',
			title: 'WhatsApp number',
			type: 'string',
			description: 'International format, digits only, e.g. 919876543210. Leave empty to hide WhatsApp buttons.',
			validation: (r) => r.regex(/^\d{8,15}$/, { name: 'digits only' })
		}),
		defineField({ name: 'address', title: 'Training centre address', type: 'text', rows: 2 }),
		defineField({ name: 'hours', title: 'Opening hours', type: 'string', description: 'e.g. Mon – Sat · 9:30 am – 7:00 pm' })
	],
	preview: { prepare: () => ({ title: 'Site settings' }) }
});
