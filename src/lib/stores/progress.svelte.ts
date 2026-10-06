import type { Course } from '$lib/types';
import { allLessons, lessonCount } from '$lib/utils/course';
import {
	emptyProgress,
	localProgressRepository,
	type ActivityEntry,
	type ActivityType,
	type CourseProgress,
	type ProgressRepository,
	type ProgressState
} from '$lib/services/progressRepository';

/** A lesson counts as complete once this share of it has been watched. */
export const COMPLETION_THRESHOLD = 0.9;

/** Local calendar day as YYYY-MM-DD (streaks follow the learner's clock, not UTC). */
export const dayKey = (d: Date = new Date()) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => dayKey();
const now = () => new Date().toISOString();

class ProgressStore {
	state = $state<ProgressState>(emptyProgress());
	/** false until localStorage has been read on the client */
	ready = $state(false);

	#repo: ProgressRepository;
	#saveTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(repo: ProgressRepository) {
		this.#repo = repo;
	}

	/** Called once from the root layout after mount (keeps SSR/hydration consistent). */
	hydrate() {
		if (this.ready) return;
		this.state = this.#repo.load();
		this.ready = true;
		// never lose the last few seconds of playback position
		const flush = () => this.#saveTimer && this.#write();
		window.addEventListener('pagehide', flush);
		document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
		window.addEventListener('storage', (e) => {
			if (e.key?.startsWith('sympholearn:progress')) this.state = this.#repo.load();
		});
	}

	#write = () => {
		clearTimeout(this.#saveTimer);
		this.#saveTimer = undefined;
		this.#repo.save($state.snapshot(this.state) as ProgressState);
	};

	/** Immediate for discrete actions; throttled (≤ 1 write / 1.5 s) during playback. */
	#persist(immediate = false) {
		if (immediate) this.#write();
		else this.#saveTimer ??= setTimeout(this.#write, 1500);
	}

	#log(type: ActivityType, courseId: string, lessonId?: string) {
		const entry: ActivityEntry = { id: crypto.randomUUID(), type, courseId, lessonId, at: now() };
		this.state.activity = [entry, ...this.state.activity].slice(0, 40);
		const day = today();
		if (!this.state.activeDays.includes(day)) this.state.activeDays = [...this.state.activeDays, day];
	}

	/* ── Queries ─────────────────────────────────────────────── */

	get(courseId: string): CourseProgress | undefined {
		return this.state.courses[courseId];
	}

	isEnrolled(courseId: string) {
		return Boolean(this.state.courses[courseId]);
	}

	isCompleted(courseId: string, lessonId: string) {
		return this.state.courses[courseId]?.completedLessons.includes(lessonId) ?? false;
	}

	lessonRatio(courseId: string, lessonId: string) {
		return this.state.courses[courseId]?.lessonProgress[lessonId] ?? 0;
	}

	lastPosition(courseId: string, lessonId: string) {
		return this.state.courses[courseId]?.lastPosition[lessonId] ?? 0;
	}

	/** 0..100, by completed lessons */
	percent(course: Course): number {
		const p = this.state.courses[course.id];
		if (!p) return 0;
		const total = lessonCount(course);
		return total ? Math.round((p.completedLessons.length / total) * 100) : 0;
	}

	enrolledIds(): string[] {
		return Object.values(this.state.courses)
			.sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt))
			.map((p) => p.courseId);
	}

	/** Consecutive active days ending today (or yesterday, so a streak survives until midnight). */
	streak(): number {
		const days = new Set(this.state.activeDays);
		const d = new Date();
		if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
		let n = 0;
		while (days.has(dayKey(d))) {
			n += 1;
			d.setDate(d.getDate() - 1);
		}
		return n;
	}

	/* ── Commands ────────────────────────────────────────────── */

	enroll(course: Course) {
		if (this.state.courses[course.id]) return this.state.courses[course.id];
		const first = allLessons(course)[0]?.id ?? null;
		this.state.courses[course.id] = {
			courseId: course.id,
			currentLessonId: first,
			completedLessons: [],
			lessonProgress: {},
			lastPosition: {},
			enrolledAt: now(),
			lastAccessedAt: now()
		};
		this.#log('enrolled', course.id);
		this.#persist(true);
		return this.state.courses[course.id];
	}

	setCurrentLesson(course: Course, lessonId: string) {
		const p = this.enroll(course);
		if (p.currentLessonId !== lessonId) {
			p.currentLessonId = lessonId;
			if (!p.completedLessons.includes(lessonId) && !p.lessonProgress[lessonId]) {
				this.#log('started', course.id, lessonId);
			}
		}
		p.lastAccessedAt = now();
		this.#persist(true);
	}

	/** Called from the video's timeupdate; writes are debounced. */
	trackPlayback(course: Course, lessonId: string, position: number, duration: number) {
		const p = this.state.courses[course.id];
		if (!p || !duration) return;
		const ratio = Math.min(1, position / duration);
		p.lastPosition[lessonId] = position;
		p.lessonProgress[lessonId] = Math.max(p.lessonProgress[lessonId] ?? 0, ratio);
		p.lastAccessedAt = now();
		if (ratio >= COMPLETION_THRESHOLD) this.completeLesson(course, lessonId);
		else this.#persist();
	}

	completeLesson(course: Course, lessonId: string) {
		const p = this.enroll(course);
		if (p.completedLessons.includes(lessonId)) return;
		p.completedLessons = [...p.completedLessons, lessonId];
		p.lessonProgress[lessonId] = 1;
		p.lastAccessedAt = now();
		this.#log('completed', course.id, lessonId);
		if (p.completedLessons.length === lessonCount(course)) this.#log('course-completed', course.id);
		this.#persist(true);
	}

	uncompleteLesson(course: Course, lessonId: string) {
		const p = this.state.courses[course.id];
		if (!p) return;
		p.completedLessons = p.completedLessons.filter((id) => id !== lessonId);
		p.lessonProgress[lessonId] = 0;
		this.#persist(true);
	}

	/** Fills in a realistic learning history so the dashboard can be previewed. */
	seedDemo(course: Course) {
		const lessons = allLessons(course);
		const done = lessons.slice(0, Math.round(lessons.length * 0.35));
		const current = lessons[done.length] ?? lessons[0];
		const at = (daysAgo: number, hour = 19) => {
			const d = new Date();
			d.setDate(d.getDate() - daysAgo);
			d.setHours(Math.min(hour, d.getHours() || hour), (12 + daysAgo * 7) % 60, 0, 0);
			return d;
		};
		const stamp = (daysAgo: number, hour?: number) => at(daysAgo, hour).toISOString();
		this.state.courses[course.id] = {
			courseId: course.id,
			currentLessonId: current.id,
			completedLessons: done.map((l) => l.id),
			lessonProgress: Object.fromEntries([...done.map((l) => [l.id, 1]), [current.id, 0.18]]),
			lastPosition: {},
			enrolledAt: stamp(9),
			lastAccessedAt: stamp(0, 8)
		};
		this.state.activity = [
			{ id: crypto.randomUUID(), type: 'started', courseId: course.id, lessonId: current.id, at: stamp(0, 8) },
			...done
				.map((l, i) => ({
					id: crypto.randomUUID(),
					type: 'completed' as const,
					courseId: course.id,
					lessonId: l.id,
					at: stamp(done.length - i)
				}))
				.reverse(),
			{ id: crypto.randomUUID(), type: 'enrolled', courseId: course.id, at: stamp(9) }
		];
		this.state.activeDays = [0, 1, 2, 3, 5, 6, 8, 9].map((n) => dayKey(at(n)));
		this.#persist(true);
	}

	reset() {
		this.state = emptyProgress();
		this.#repo.clear();
	}
}

export const progress = new ProgressStore(localProgressRepository);
