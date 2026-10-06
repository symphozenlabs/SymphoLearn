import { error } from '@sveltejs/kit';
import { allCourseIds, getCourse } from '$lib/services/courseService';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => allCourseIds().map((id) => ({ id }));

export const load: PageLoad = async ({ params }) => {
	const course = await getCourse(params.id);
	if (!course) error(404, 'Course not found');
	return { course };
};
