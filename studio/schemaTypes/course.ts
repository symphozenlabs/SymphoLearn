import { BookIcon } from '@sanity/icons/Book';
import { PlayIcon } from '@sanity/icons/Play';
import { StackIcon } from '@sanity/icons/Stack';
import { defineArrayMember, defineField, defineType } from 'sanity';

const DURATION_H = /^\d+h( \d{1,2}m)?$|^\d{1,2}m$/; // "12h 30m", "45m"
const CLOCK = /^(\d+:)?\d{1,2}:\d{2}$/; // "38:20", "1:12:40"

const lesson = defineArrayMember({
	name: 'lesson',
	title: 'Lesson',
	type: 'object',
	icon: PlayIcon,
	fields: [
		defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			type: 'slug',
			description: 'Used in the lesson URL. Generate from the title.',
			options: { source: (_doc, ctx) => (ctx.parent as { title?: string })?.title ?? '', maxLength: 80 },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'duration',
			type: 'string',
			description: 'Video length, e.g. 38:20 or 1:12:40',
			validation: (r) => r.required().regex(CLOCK, { name: 'mm:ss' })
		}),
		defineField({ name: 'description', type: 'text', rows: 3 }),
		defineField({ name: 'keyPoints', title: 'Key points', type: 'array', of: [{ type: 'string' }] }),
		defineField({
			name: 'video',
			title: 'Video file',
			type: 'file',
			options: { accept: 'video/mp4,video/webm' },
			description: 'Upload the lesson video, or use "Video URL" for one hosted elsewhere.'
		}),
		defineField({ name: 'poster', title: 'Poster image', type: 'image', description: 'Shown before the video plays (16:9)' }),
		defineField({ name: 'videoUrl', title: 'Video URL', type: 'string', description: 'Full URL or a site path like /videos/…/01-intro.mp4' }),
		defineField({ name: 'preview', title: 'Free preview', type: 'boolean', initialValue: false })
	],
	preview: { select: { title: 'title', subtitle: 'duration' } }
});

export const course = defineType({
	name: 'course',
	title: 'Course',
	type: 'document',
	icon: BookIcon,
	groups: [
		{ name: 'content', title: 'Content', default: true },
		{ name: 'pricing', title: 'Pricing' },
		{ name: 'curriculum', title: 'Curriculum' },
		{ name: 'details', title: 'Details' }
	],
	fields: [
		defineField({ name: 'title', type: 'string', group: 'content', validation: (r) => r.required().max(90) }),
		defineField({
			name: 'slug',
			type: 'slug',
			group: 'content',
			description: 'The course URL: /courses/<slug>',
			options: { source: 'title', maxLength: 96 },
			validation: (r) => r.required()
		}),
		defineField({ name: 'subtitle', type: 'string', group: 'content', validation: (r) => r.required().max(140) }),
		defineField({ name: 'description', type: 'text', rows: 5, group: 'content', validation: (r) => r.required() }),
		defineField({
			name: 'thumbnail',
			title: 'Cover image',
			type: 'image',
			group: 'content',
			description: 'Shown on cards and the course page (16:10). Set the hotspot to keep the subject in frame.',
			options: { hotspot: true },
			fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string' })],
			validation: (r) => r.required()
		}),
		defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }], group: 'content', validation: (r) => r.required() }),
		defineField({ name: 'instructor', type: 'reference', to: [{ type: 'instructor' }], group: 'content', validation: (r) => r.required() }),

		defineField({
			name: 'price',
			type: 'object',
			group: 'pricing',
			description: 'The original price is shown slashed next to the offer price. Currency is set in Site settings.',
			options: { columns: 2 },
			fields: [
				defineField({ name: 'original', title: 'Original price', type: 'number', validation: (r) => r.required().min(0) }),
				defineField({ name: 'offer', title: 'Offer price', type: 'number', validation: (r) => r.required().min(0) })
			],
			validation: (r) =>
				r.required().custom((p?: { original?: number; offer?: number }) =>
					p?.original != null && p?.offer != null && p.offer > p.original
						? 'The offer price should not be higher than the original price.'
						: true
				)
		}),

		defineField({
			name: 'sections',
			type: 'array',
			group: 'curriculum',
			of: [
				defineArrayMember({
					name: 'section',
					type: 'object',
					icon: StackIcon,
					fields: [
						defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
						defineField({ name: 'lessons', type: 'array', of: [lesson], validation: (r) => r.required().min(1) })
					],
					preview: {
						select: { title: 'title', lessons: 'lessons' },
						prepare: ({ title, lessons }) => ({ title, subtitle: `${lessons?.length ?? 0} lessons` })
					}
				})
			],
			validation: (r) => r.required().min(1)
		}),

		defineField({
			name: 'level',
			type: 'string',
			group: 'details',
			options: { list: ['Beginner', 'Intermediate', 'Advanced'], layout: 'radio', direction: 'horizontal' },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'duration',
			type: 'string',
			group: 'details',
			description: 'Total length, e.g. "12h 30m"',
			validation: (r) => r.required().regex(DURATION_H, { name: '12h 30m' })
		}),
		defineField({ name: 'outcomes', title: 'What you’ll learn', type: 'array', of: [{ type: 'string' }], group: 'details' }),
		defineField({ name: 'requirements', type: 'array', of: [{ type: 'string' }], group: 'details' }),
		defineField({ name: 'skills', type: 'array', of: [{ type: 'string' }], group: 'details', options: { layout: 'tags' } }),
		defineField({
			name: 'reviews',
			type: 'array',
			group: 'details',
			of: [
				defineArrayMember({
					name: 'review',
					type: 'object',
					fields: [
						defineField({ name: 'author', type: 'string', validation: (r) => r.required() }),
						defineField({ name: 'role', type: 'string' }),
						defineField({ name: 'rating', type: 'number', validation: (r) => r.required().min(1).max(5) }),
						defineField({ name: 'body', type: 'text', rows: 3, validation: (r) => r.required() }),
						defineField({ name: 'date', type: 'date' })
					],
					preview: { select: { title: 'author', subtitle: 'body' } }
				})
			]
		}),
		defineField({ name: 'rating', type: 'number', group: 'details', validation: (r) => r.min(0).max(5), initialValue: 5 }),
		defineField({ name: 'ratingCount', title: 'Number of ratings', type: 'number', group: 'details', initialValue: 0 }),
		defineField({ name: 'students', title: 'Learners', type: 'number', group: 'details', initialValue: 0 }),
		defineField({
			name: 'tone',
			title: 'Card tone',
			type: 'string',
			group: 'details',
			options: { list: ['ink', 'paper', 'green', 'warm'], layout: 'radio', direction: 'horizontal' },
			initialValue: 'paper'
		}),
		defineField({ name: 'featured', type: 'boolean', group: 'details', description: 'Show on the home page', initialValue: false }),
		defineField({
			name: 'updated',
			title: 'Last updated',
			type: 'string',
			group: 'details',
			description: 'YYYY-MM',
			validation: (r) => r.regex(/^\d{4}-\d{2}$/, { name: 'YYYY-MM' })
		}),
		defineField({ name: 'language', type: 'string', group: 'details', initialValue: 'English' }),
		defineField({ name: 'order', title: 'Sort order', type: 'number', group: 'details', description: 'Lower numbers come first' })
	],
	orderings: [
		{ title: 'Sort order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
		{ title: 'Title', name: 'title', by: [{ field: 'title', direction: 'asc' }] }
	],
	preview: {
		select: { title: 'title', offer: 'price.offer', original: 'price.original', media: 'thumbnail' },
		prepare: ({ title, offer, original, media }) => ({
			title,
			subtitle: offer != null ? `${offer}${original ? `  (was ${original})` : ''}` : 'No price set',
			media
		})
	}
});
