import { listFeaturedCourses } from '$lib/services/courseService';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({
	featured: await listFeaturedCourses()
});
