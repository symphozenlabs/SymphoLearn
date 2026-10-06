import { TagIcon } from '@sanity/icons/Tag';
import { UserIcon } from '@sanity/icons/User';
import { defineField, defineType } from 'sanity';

export const category = defineType({
	name: 'category',
	title: 'Category',
	type: 'document',
	icon: TagIcon,
	fields: [
		defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
		defineField({ name: 'description', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'order', title: 'Sort order', type: 'number' })
	],
	orderings: [{ title: 'Sort order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
	preview: { select: { title: 'name', subtitle: 'description' } }
});

export const instructor = defineType({
	name: 'instructor',
	title: 'Instructor',
	type: 'document',
	icon: UserIcon,
	fields: [
		defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
		defineField({ name: 'avatar', type: 'image', options: { hotspot: true }, description: 'Square works best. Leave empty for a monogram.' }),
		defineField({ name: 'role', type: 'string', description: 'e.g. "Senior Engineer · 11 years shipping web products"' }),
		defineField({ name: 'bio', type: 'text', rows: 4 })
	],
	preview: { select: { title: 'name', subtitle: 'role', media: 'avatar' } }
});
