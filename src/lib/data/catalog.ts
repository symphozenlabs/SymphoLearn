/**
 * The content the site renders.
 *
 * `npm run content` (also run before `dev` and `build`) pulls courses, images,
 * prices and site copy from Sanity into `sanity.generated.json`; everything is
 * then baked into the static build. Without Sanity configured, the bundled seed
 * in `courses.ts` / `site.ts` is used, so the site always builds.
 */
import type { Catalog } from '$lib/types';
import { categories as seedCategories, courses as seedCourses } from './courses';
import { siteSeed } from './site';

const generated = Object.values(
	import.meta.glob<Catalog>('./sanity.generated.json', { eager: true, import: 'default' })
)[0];

const fromSanity = !!generated?.courses?.length;

export const contentSource: 'sanity' | 'seed' = fromSanity ? 'sanity' : 'seed';
export const site = { ...siteSeed, ...(fromSanity ? generated.site : {}) };
export const categories = fromSanity ? generated.categories : seedCategories;
export const courses = fromSanity ? generated.courses : seedCourses;

/** The course the home-page story and the dashboard's "first lesson" follow. */
export const SEEDED_COURSE_ID = courses.some((c) => c.id === site.heroCourseId) ? site.heroCourseId : courses[0].id;
