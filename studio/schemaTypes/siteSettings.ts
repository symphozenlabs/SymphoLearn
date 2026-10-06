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
			initialValue: 'Learn with SymphoZen',
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
		defineField({ name: 'offerNote', title: 'Offer label', type: 'string', description: 'Shown above prices, e.g. "Launch offer"', initialValue: 'Launch offer' }),
		defineField({
			name: 'heroCourse',
			title: 'Home-page story course',
			type: 'reference',
			to: [{ type: 'course' }],
			description: 'The course the scroll story on the home page follows'
		}),
		defineField({ name: 'contactEmail', title: 'Contact email', type: 'string', validation: (r) => r.email() })
	],
	preview: { prepare: () => ({ title: 'Site settings' }) }
});
