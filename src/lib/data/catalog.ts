/**
 * The content the site renders.
 *
 * `npm run content` (also run before `dev` and `build`) pulls courses, images,
 * prices and site copy from Sanity into `sanity.generated.json`; everything is
 * then baked into the static build. Without Sanity configured, the bundled seed
 * in `courses.ts` / `site.ts` is used, so the site always builds.
 */
import type { Catalog, Course } from '$lib/types';
import { categories as seedCategories, courses as seedCourses } from './courses';
import { siteSeed } from './site';

const generated = Object.values(
	import.meta.glob<Catalog>('./sanity.generated.json', { eager: true, import: 'default' })
)[0];

const fromSanity = !!generated?.courses?.length;

export const contentSource: 'sanity' | 'seed' = fromSanity ? 'sanity' : 'seed';
export const site = { ...siteSeed, ...(fromSanity ? generated.site : {}) };
// career roles are newer than most CMS entries — fall back to the seed's until the Studio has them
export const courses: Course[] = fromSanity
	? generated.courses.map((c) => ({
			...c,
			careers: c.careers?.length ? c.careers : seedCourses.find((s) => s.id === c.id)?.careers
		}))
	: seedCourses;
// only categories that have at least one course, so no page links to an empty list
export const categories = (fromSanity ? generated.categories : seedCategories).filter((c) =>
	courses.some((x) => x.category === c.id)
);

/* ── Contact links (each is empty when the setting is) ───────── */

export const telHref = site.phone ? `tel:${site.phone.replace(/[^\d+]/g, '')}` : '';
export const mailHref = site.contactEmail ? `mailto:${site.contactEmail}` : '';

/** wa.me link with a pre-filled first message */
export function whatsappHref(text = 'Hi SymphoZen Academia, I’d like to know more about your programs.') {
	const n = site.whatsapp.replace(/\D/g, '');
	return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : '';
}

export const whatsappForCourse = (course: Course) =>
	whatsappHref(`Hi SymphoZen Academia, I’d like batch dates and fees for ${course.title}.`);

/* ── Headline numbers, derived from the catalog ──────────────── */

const learners = courses.reduce((n, c) => n + c.students, 0);
const ratings = courses.reduce((n, c) => n + c.ratingCount, 0);

export const stats = {
	programs: courses.length,
	disciplines: categories.length,
	learners,
	/** "60k+" style */
	learnersLabel: learners >= 1000 ? `${Math.floor(learners / 1000)}k+` : `${learners}`,
	rating: ratings ? courses.reduce((n, c) => n + c.rating * c.ratingCount, 0) / ratings : 0,
	reviews: ratings,
	/** only show learner counts and ratings once there are real ones to show */
	hasRatings: ratings > 0,
	hasLearners: learners >= 100,
	/** the most affordable program's offer price */
	fromPrice: courses.length ? Math.min(...courses.map((c) => c.price.offer)) : 0
};

/** Price formatted in the site currency, e.g. "₹4,999" */
export const money = (n: number) =>
	new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.currency, maximumFractionDigits: 0 }).format(n);

/** The lead mentor's track record — real numbers shown until the academy has its own learner stats. */
export const mentorProof = { years: 13, lectures: 30, panels: 30 };
