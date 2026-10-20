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
	// The Studio's URL prefix. On the website it lives at /studio (see ../vercel.json);
	// the hosted copy on *.sanity.studio is served from the root (`npm run deploy` sets "/").
	// Don't also set `basePath` in sanity.config.ts — the two stack up into /studio/studio.
	project: { basePath: process.env.SANITY_STUDIO_BASEPATH || "/studio" },
	// Pin Vite to the studio's own tsconfig so it never walks up into the
	// SvelteKit root tsconfig (which extends the generated .svelte-kit/tsconfig.json)
	vite: (config) => ({
		...config,
		tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
	}),
});
