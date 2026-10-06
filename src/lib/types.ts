/**
 * Domain models. These mirror the shape documents will have in Firestore
 * (courses/{courseId}, with sections + lessons embedded), so the seeded data
 * and a future backend can be swapped without touching components.
 */

/** Category slug — categories are managed in the CMS, so any slug is valid. */
export type CategoryId = string;

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

/** Visual treatment used by generated course covers. */
export type CoverTone = 'ink' | 'paper' | 'green' | 'warm';

export interface Category {
	id: CategoryId;
	name: string;
	description: string;
}

export interface Instructor {
	id: string;
	name: string;
	/** Image URL; when empty a monogram is rendered instead. */
	avatar: string;
	role: string;
	bio: string;
}

export interface Lesson {
	id: string;
	/** 1-based position across the whole course, e.g. "01". */
	number: string;
	title: string;
	/** Human readable, "mm:ss" or "h:mm:ss". */
	duration: string;
	videoUrl: string;
	poster?: string;
	description: string;
	keyPoints: string[];
	/** Server-provided completion (per user). The client progress store takes precedence. */
	completed: boolean;
	/** Free preview lessons can be watched before enrolling. */
	preview?: boolean;
}

export interface CourseSection {
	id: string;
	title: string;
	lessons: Lesson[];
}

export interface Review {
	id: string;
	author: string;
	role: string;
	rating: number;
	body: string;
	date: string;
}

/** What a course costs: the list price (shown slashed) and the price it's offered at. */
export interface Price {
	original: number;
	offer: number;
}

export interface Course {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	instructor: Instructor;
	thumbnail: string;
	category: CategoryId;
	level: Level;
	duration: string;
	rating: number;
	ratingCount: number;
	students: number;
	sections: CourseSection[];
	outcomes: string[];
	requirements: string[];
	reviews: Review[];
	skills: string[];
	tone: CoverTone;
	featured?: boolean;
	updated: string;
	language: string;
	price: Price;
}

/** Site-wide copy and settings (a singleton document in Sanity). */
export interface SiteSettings {
	/** the signature line, e.g. "Learn with SymphoZen" — the last word is set in italic */
	tagline: string;
	taglineNote: string;
	/** ISO 4217 code for every course price */
	currency: string;
	/** BCP 47 locale used to format prices */
	locale: string;
	/** short line next to prices, e.g. "Launch offer" */
	offerNote: string;
	/** the course the home-page story follows */
	heroCourseId: string;
	/** where course-interest leads should be answered from, shown to visitors */
	contactEmail: string;
}

/** Everything the static site renders — from Sanity at build time, or the bundled seed. */
export interface Catalog {
	site: SiteSettings;
	categories: Category[];
	courses: Course[];
}
