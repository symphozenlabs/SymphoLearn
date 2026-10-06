import { error } from '@sveltejs/kit';
import { allCourseIds, getCourse, listCourses } from '$lib/services/courseService';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => allCourseIds().map((id) => ({ id }));

export const load: PageLoad = async ({ params }) => {
	const course = await getCourse(params.id);
	if (!course) error(404, 'Course not found');
	const related = (await listCourses())
		.filter((c) => c.id !== course.id)
		.sort((a, b) => Number(b.category === course.category) - Number(a.category === course.category))
		.slice(0, 2);
	return { course, related };
};
