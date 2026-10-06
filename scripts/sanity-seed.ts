/**
 * Exports the bundled catalog (src/lib/data) as a Sanity import file, so the
 * Studio starts with every course, image, price and setting the site ships with.
 *
 *   npm run sanity:seed                       → writes studio/seed/catalog.ndjson
 *   cd studio && npm run seed                 → imports it (images are uploaded)
 *
 * Runs with Node's built-in TypeScript support (Node ≥ 22.18).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { categories, courses } from '../src/lib/data/courses.ts';
import { siteSeed } from '../src/lib/data/site.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'studio/seed/catalog.ndjson');

let n = 0;
const key = () => `k${(n++).toString(36).padStart(4, '0')}`;
const slug = (current: string) => ({ _type: 'slug', current });
const ref = (_ref: string) => ({ _type: 'reference', _ref });
/** a local /static file → an asset Sanity uploads during import */
const asset = (kind: 'image' | 'file', sitePath: string) => `${kind}@${pathToFileURL(resolve(root, 'static', sitePath.replace(/^\//, ''))).href}`;

const docs: Record<string, unknown>[] = [];

docs.push({
	_id: 'siteSettings',
	_type: 'siteSettings',
	tagline: siteSeed.tagline,
	taglineNote: siteSeed.taglineNote,
	currency: siteSeed.currency,
	locale: siteSeed.locale,
	offerNote: siteSeed.offerNote,
	contactEmail: siteSeed.contactEmail,
	heroCourse: ref(`course-${siteSeed.heroCourseId}`)
});

categories.forEach((c, i) =>
	docs.push({ _id: `category-${c.id}`, _type: 'category', name: c.name, slug: slug(c.id), description: c.description, order: i })
);

const instructors = new Map(courses.map((c) => [c.instructor.id, c.instructor]));
for (const p of instructors.values())
	docs.push({ _id: `instructor-${p.id}`, _type: 'instructor', name: p.name, slug: slug(p.id), role: p.role, bio: p.bio });

courses.forEach((c, i) =>
	docs.push({
		_id: `course-${c.id}`,
		_type: 'course',
		title: c.title,
		slug: slug(c.id),
		subtitle: c.subtitle,
		description: c.description,
		thumbnail: { _type: 'image', _sanityAsset: asset('image', c.thumbnail), alt: '' },
		category: ref(`category-${c.category}`),
		instructor: ref(`instructor-${c.instructor.id}`),
		price: { _type: 'object', original: c.price.original, offer: c.price.offer },
		sections: c.sections.map((s) => ({
			_key: key(),
			_type: 'section',
			title: s.title,
			lessons: s.lessons.map((l) => ({
				_key: key(),
				_type: 'lesson',
				title: l.title,
				slug: slug(l.id.split('--').pop()!),
				duration: l.duration,
				description: l.description,
				keyPoints: l.keyPoints,
				videoUrl: l.videoUrl,
				...(l.poster ? { poster: { _type: 'image', _sanityAsset: asset('image', l.poster) } } : {}),
				preview: !!l.preview
			}))
		})),
		level: c.level,
		duration: c.duration,
		outcomes: c.outcomes,
		requirements: c.requirements,
		skills: c.skills,
		reviews: c.reviews.map((r) => ({ _key: key(), _type: 'review', author: r.author, role: r.role, rating: r.rating, body: r.body, date: r.date })),
		rating: c.rating,
		ratingCount: c.ratingCount,
		students: c.students,
		tone: c.tone,
		featured: !!c.featured,
		updated: c.updated,
		language: c.language,
		order: i
	})
);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
console.log(`✓ ${docs.length} documents (${courses.length} courses) → ${out.replace(root, '.')}`);
