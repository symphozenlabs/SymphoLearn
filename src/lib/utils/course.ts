import type { Course, CourseSection, Lesson } from '$lib/types';

/** "1:12:40" | "38:20" → seconds */
export function parseDuration(value: string): number {
	const parts = value.split(':').map(Number);
	return parts.reduce((total, part) => total * 60 + (Number.isFinite(part) ? part : 0), 0);
}

/** seconds → "m:ss" or "h:mm:ss" (video clock) */
export function formatClock(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
	const s = Math.floor(seconds % 60);
	const m = Math.floor((seconds / 60) % 60);
	const h = Math.floor(seconds / 3600);
	const ss = String(s).padStart(2, '0');
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** seconds → "12h 30m" | "38m" */
export function formatSpan(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.round((seconds % 3600) / 60);
	if (h === 0) return `${m}m`;
	return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`;
}

export function allLessons(course: Course): Lesson[] {
	return course.sections.flatMap((s) => s.lessons);
}

export function lessonCount(course: Course): number {
	return course.sections.reduce((n, s) => n + s.lessons.length, 0);
}

export function sectionDuration(section: CourseSection): number {
	return section.lessons.reduce((t, l) => t + parseDuration(l.duration), 0);
}

export function findLesson(course: Course, lessonId: string | null | undefined) {
	const lessons = allLessons(course);
	const index = lessons.findIndex((l) => l.id === lessonId);
	if (index === -1) return null;
	const section = course.sections.find((s) => s.lessons.some((l) => l.id === lessonId))!;
	return {
		lesson: lessons[index],
		section,
		index,
		previous: lessons[index - 1] ?? null,
		next: lessons[index + 1] ?? null
	};
}

export function formatStudents(n: number): string {
	return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

/** Headline course length in hours: "12h 30m" → 12.5 */
export function courseHours(course: Course): number {
	const h = Number(course.duration.match(/(\d+)\s*h/)?.[1] ?? 0);
	const m = Number(course.duration.match(/(\d+)\s*m/)?.[1] ?? 0);
	return h + m / 60;
}

/** Weeks to finish at a weekly pace (at least one). */
export const weeksToFinish = (course: Course, hoursPerWeek: number) =>
	Math.max(1, Math.ceil(courseHours(course) / hoursPerWeek));

/** Price formatting, using the site's currency + locale (both managed in the CMS). */
export function formatPrice(amount: number, currency: string, locale: string): string {
	return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
}

/** Whole-number discount, e.g. 62 for 12,999 → 4,999. */
export const discountPercent = (original: number, offer: number) =>
	original > offer && original > 0 ? Math.round(((original - offer) / original) * 100) : 0;
