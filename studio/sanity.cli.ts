import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: process.env.SANITY_STUDIO_DATASET ?? 'production'
	},
	// asset URLs in the build start with /studio, matching the config's basePath
	project: { basePath: '/studio' }
});
