import { listCategories, listCourses } from '$lib/services/courseService';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({
	courses: await listCourses(),
	categories: await listCategories()
});
