import { defineConfig } from 'sanity';
import { structureTool, type StructureResolver } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { BookIcon } from '@sanity/icons/Book';
import { CogIcon } from '@sanity/icons/Cog';
import { TagIcon } from '@sanity/icons/Tag';
import { UserIcon } from '@sanity/icons/User';
import { schemaTypes } from './schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? '';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

const SINGLETON = 'siteSettings';

const structure: StructureResolver = (S) =>
	S.list()
		.title('SymphoLearn')
		.items([
			S.listItem().title('Site settings').icon(CogIcon).child(S.document().schemaType(SINGLETON).documentId(SINGLETON)),
			S.divider(),
			S.documentTypeListItem('course').title('Courses').icon(BookIcon),
			S.documentTypeListItem('category').title('Categories').icon(TagIcon),
			S.documentTypeListItem('instructor').title('Instructors').icon(UserIcon)
		]);

export default defineConfig({
	name: 'sympholearn',
	title: 'SymphoLearn',
	// served at /studio on the site's domain (see ../vercel.json)
	basePath: '/studio',
	projectId,
	dataset,
	plugins: [structureTool({ structure }), visionTool()],
	schema: {
		types: schemaTypes,
		// the settings singleton can't be created from "new document" menus
		templates: (templates) => templates.filter(({ schemaType }) => schemaType !== SINGLETON)
	},
	document: {
		actions: (actions, { schemaType }) =>
			schemaType === SINGLETON ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action)) : actions
	}
});
