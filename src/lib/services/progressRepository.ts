/**
 * Persistence boundary for learner progress.
 *
 * Phase 1 uses localStorage. A Firestore implementation would store the same
 * `ProgressState` under `users/{uid}/progress/state` and implement this
 * interface — the progress store does not need to change.
 */

export interface CourseProgress {
	courseId: string;
	currentLessonId: string | null;
	completedLessons: string[];
	/** lessonId → watched ratio 0..1 */
	lessonProgress: Record<string, number>;
	/** lessonId → last playback position in seconds */
	lastPosition: Record<string, number>;
	enrolledAt: string;
	lastAccessedAt: string;
}

export type ActivityType = 'enrolled' | 'started' | 'completed' | 'course-completed';

export interface ActivityEntry {
	id: string;
	type: ActivityType;
	courseId: string;
	lessonId?: string;
	at: string;
}

export interface ProgressState {
	version: 1;
	courses: Record<string, CourseProgress>;
	activity: ActivityEntry[];
	/** ISO dates (YYYY-MM-DD) on which the learner made progress */
	activeDays: string[];
}

export interface ProgressRepository {
	load(): ProgressState;
	save(state: ProgressState): void;
	clear(): void;
}

export const emptyProgress = (): ProgressState => ({
	version: 1,
	courses: {},
	activity: [],
	activeDays: []
});

const KEY = 'sympholearn:progress:v1';

export const localProgressRepository: ProgressRepository = {
	load() {
		try {
			const raw = localStorage.getItem(KEY);
			if (!raw) return emptyProgress();
			const parsed = JSON.parse(raw) as ProgressState;
			return parsed?.version === 1 ? { ...emptyProgress(), ...parsed } : emptyProgress();
		} catch {
			return emptyProgress();
		}
	},
	save(state) {
		try {
			localStorage.setItem(KEY, JSON.stringify(state));
		} catch {
			/* storage full or unavailable — progress stays in memory */
		}
	},
	clear() {
		try {
			localStorage.removeItem(KEY);
		} catch {
			/* ignore */
		}
	}
};
