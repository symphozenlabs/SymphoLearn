/**
 * Course data access.
 *
 * Phase 1 resolves against the seeded catalog. Every function is async and
 * returns plain serialisable objects, so swapping the body for Firestore
 * (e.g. `getDoc(doc(db, 'courses', id))`) does not change any caller.
 */
import { categories, courses } from '$lib/data/catalog';
import type { Category, CategoryId, Course } from '$lib/types';

export async function listCourses(): Promise<Course[]> {
	return courses;
}

export async function getCourse(id: string): Promise<Course | undefined> {
	return courses.find((c) => c.id === id);
}

export async function listFeaturedCourses(): Promise<Course[]> {
	return courses.filter((c) => c.featured);
}

export async function listCategories(): Promise<Category[]> {
	return categories;
}

/** Synchronous lookups for client-only UI (hero, dashboard) */
export function getCourseSync(id: string): Course | undefined {
	return courses.find((c) => c.id === id);
}

export function getCategory(id: CategoryId): Category {
	return categories.find((c) => c.id === id)!;
}

export function countByCategory(id: CategoryId): number {
	return courses.filter((c) => c.category === id).length;
}

export function allCourseIds(): string[] {
	return courses.map((c) => c.id);
}
