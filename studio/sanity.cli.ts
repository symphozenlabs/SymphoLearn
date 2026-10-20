import { fileURLToPath } from "node:url";
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID,
		dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
	},
	deployment: {
		appId: "qcqhdz4kg8xfjz5ih5uhgefw",
	},
	// asset URLs in the build start with /studio, matching the config's basePath
	project: { basePath: "/studio" },
	// Pin Vite to the studio's own tsconfig so it never walks up into the
	// SvelteKit root tsconfig (which extends the generated .svelte-kit/tsconfig.json)
	vite: (config) => ({
		...config,
		tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
	}),
});
