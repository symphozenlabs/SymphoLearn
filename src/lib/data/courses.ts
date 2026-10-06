import type { Category, Course, CourseSection, Instructor, Lesson } from '$lib/types';

/* ── Categories ─────────────────────────────────────────────── */

export const categories: Category[] = [
	{
		id: 'development',
		name: 'Development',
		description: 'Build for the web, from first tag to production.'
	},
	{
		id: 'design',
		name: 'Design',
		description: 'Interfaces, systems and the craft behind them.'
	},
	{
		id: 'data-science',
		name: 'Data Science',
		description: 'Turn raw numbers into decisions and stories.'
	},
	{
		id: 'artificial-intelligence',
		name: 'Artificial Intelligence',
		description: 'Models, agents and the products they power.'
	},
	{
		id: 'business',
		name: 'Business',
		description: 'Strategy, operations and leading with clarity.'
	},
	{
		id: 'marketing',
		name: 'Marketing',
		description: 'Positioning, growth and building a brand.'
	},
	{
		id: 'photography',
		name: 'Photography',
		description: 'Light, composition and a point of view.'
	}
];

/* ── Instructors ────────────────────────────────────────────── */

const instructors = {
	alex: {
		id: 'alex-morgan',
		name: 'Alex Morgan',
		avatar: '',
		role: 'Senior Engineer · 11 years shipping web products',
		bio: 'Alex has built web platforms for healthcare, logistics and education teams, and has spent the last six years teaching developers to think in systems rather than snippets. Their courses favour understanding over memorisation.'
	},
	priya: {
		id: 'priya-raman',
		name: 'Priya Raman',
		avatar: '',
		role: 'Design Systems Lead',
		bio: 'Priya leads design systems for multi-product companies and writes about the space between design and engineering.'
	},
	daniel: {
		id: 'daniel-okafor',
		name: 'Daniel Okafor',
		avatar: '',
		role: 'Data Scientist & Educator',
		bio: 'Daniel helps teams turn analytics into narratives that executives actually read.'
	},
	mei: {
		id: 'mei-lin',
		name: 'Mei Lin',
		avatar: '',
		role: 'Machine Learning Engineer',
		bio: 'Mei has deployed ML systems in fintech and climate tech, and cares about models that survive contact with production.'
	},
	samuel: {
		id: 'samuel-reyes',
		name: 'Samuel Reyes',
		avatar: '',
		role: 'Applied AI Engineer',
		bio: 'Samuel builds LLM-powered products and teaches the evaluation habits that keep them honest.'
	},
	hannah: {
		id: 'hannah-weiss',
		name: 'Hannah Weiss',
		avatar: '',
		role: 'Product Strategist',
		bio: 'Hannah has led product at three early-stage companies and now advises founders on focus.'
	},
	leila: {
		id: 'leila-haddad',
		name: 'Leila Haddad',
		avatar: '',
		role: 'Brand Director',
		bio: 'Leila has shaped brands for consumer and B2B companies across three continents.'
	},
	tomas: {
		id: 'tomas-varga',
		name: 'Tomás Varga',
		avatar: '',
		role: 'Documentary Photographer',
		bio: 'Tomás photographs people at work, and teaches how to see light before you meter it.'
	}
} satisfies Record<string, Instructor>;

/* ── Helpers ────────────────────────────────────────────────── */

let counter = 0;

function lesson(
	courseId: string,
	slug: string,
	title: string,
	duration: string,
	description: string,
	keyPoints: string[] = [],
	extra: Partial<Lesson> = {}
): Lesson {
	counter += 1;
	const number = String(counter).padStart(2, '0');
	return {
		id: `${courseId}--${slug}`,
		number,
		title,
		duration,
		// Every lesson has a canonical location; drop the MP4 there and it plays.
		videoUrl: `/videos/${courseId}/${number}-${slug}.mp4`,
		description,
		keyPoints,
		completed: false,
		...extra
	};
}

/** Resets lesson numbering so each course starts at 01. */
function sections(build: (l: typeof lesson) => CourseSection[]) {
	counter = 0;
	return build(lesson);
}

/** Short-hand for courses where only titles + durations are seeded. */
function outline(courseId: string, parts: [string, [string, string][]][]): CourseSection[] {
	counter = 0;
	return parts.map(([title, items], i) => ({
		id: `${courseId}--s${i + 1}`,
		title,
		lessons: items.map(([t, d]) =>
			lesson(
				courseId,
				t
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, ''),
				t,
				d,
				`A focused session on ${t.toLowerCase()}, with a worked example you can follow along with and a short exercise at the end.`
			)
		)
	}));
}

/* ── Seeded flagship course ─────────────────────────────────── */

const FS = 'full-stack-web-development';

const fullStackSections: CourseSection[] = sections((l) => [
	{
		id: `${FS}--s1`,
		title: 'Introduction',
		lessons: [
			l(
				FS,
				'welcome-to-the-course',
				'Welcome to the Course',
				'0:46',
				'Meet the course, the project you will build, and the rhythm of watching, building and reflecting that every lesson follows.',
				[
					'What you will be able to build by the end',
					'How lessons, exercises and checkpoints fit together',
					'The one habit that makes self-paced learning stick'
				],
				{ videoUrl: '/videos/welcome.mp4', poster: '/images/welcome-poster.jpg', preview: true }
			),
			l(
				FS,
				'how-the-web-works',
				'How the Web Works',
				'38:20',
				'Follow a single request from your browser to a server and back. DNS, HTTP, status codes and what actually arrives on the page.',
				[
					'Clients, servers and the request–response cycle',
					'DNS, IP addresses and ports in plain language',
					'Reading HTTP requests in your browser’s network panel'
				]
			),
			l(
				FS,
				'setting-up-your-environment',
				'Setting Up Your Environment',
				'32:15',
				'Install and configure the tools professionals use daily: an editor, a terminal, Node.js and Git — and learn why each one matters.',
				[
					'Visual Studio Code with a minimal, useful setup',
					'Your first terminal commands without fear',
					'Node.js, npm and version control with Git'
				]
			)
		]
	},
	{
		id: `${FS}--s2`,
		title: 'HTML & CSS',
		lessons: [
			l(
				FS,
				'html-fundamentals',
				'HTML Fundamentals',
				'54:30',
				'Structure content with meaning. Semantic elements, document outline, forms and the accessibility you get for free when you choose the right tag.',
				[
					'Semantic elements and why they matter',
					'Links, images, lists and tables done properly',
					'Accessible forms with labels and validation'
				]
			),
			l(
				FS,
				'css-fundamentals',
				'CSS Fundamentals',
				'61:10',
				'Selectors, the cascade, the box model and custom properties — the mental model that makes CSS predictable instead of mysterious.',
				[
					'The cascade, specificity and inheritance',
					'Box model, spacing and typography',
					'Design tokens with custom properties'
				]
			),
			l(
				FS,
				'responsive-design',
				'Responsive Design',
				'48:45',
				'Design layouts that adapt from phones to wide desktops using Flexbox, Grid and fluid type — and test them like a professional.',
				[
					'Mobile-first thinking and breakpoints',
					'Flexbox and CSS Grid for real layouts',
					'Fluid typography with clamp()'
				]
			)
		]
	},
	{
		id: `${FS}--s3`,
		title: 'JavaScript',
		lessons: [
			l(
				FS,
				'javascript-basics',
				'JavaScript Basics',
				'1:12:40',
				'Variables, types, functions, arrays and objects — written the modern way, and explained through small programs rather than trivia.',
				[
					'Values, types and variables with let and const',
					'Functions, scope and closures',
					'Working with arrays and objects'
				]
			),
			l(
				FS,
				'dom-manipulation',
				'DOM Manipulation',
				'52:20',
				'Bring pages to life. Query elements, respond to events and update the interface without reloading the page.',
				[
					'Selecting and updating elements',
					'Events, delegation and user input',
					'Rendering lists from data'
				]
			),
			l(
				FS,
				'async-javascript',
				'Async JavaScript',
				'58:05',
				'Promises, async/await and fetch. Load real data from an API, handle loading and error states, and keep the interface responsive.',
				[
					'The event loop, simply explained',
					'Promises and async / await',
					'Fetching data and handling failure gracefully'
				]
			)
		]
	},
	{
		id: `${FS}--s4`,
		title: 'Building Applications',
		lessons: [
			l(
				FS,
				'application-architecture',
				'Application Architecture',
				'44:30',
				'How real applications are organised: front end, back end, data and the boundaries between them. Draw the system before you write it.',
				[
					'Client, server and database responsibilities',
					'REST APIs and data modelling',
					'Folder structures that scale'
				]
			),
			l(
				FS,
				'building-your-first-application',
				'Building Your First Application',
				'1:32:15',
				'Put everything together. Build a full-stack task manager with a Node.js API, persistent data and a responsive front end.',
				[
					'Designing the API and data model',
					'Connecting the front end to your API',
					'Validation, errors and empty states'
				]
			),
			l(
				FS,
				'deployment',
				'Deployment',
				'36:50',
				'Ship it. Environment variables, builds, hosting and a deployment pipeline that turns every push into a live update.',
				[
					'Production builds and environment variables',
					'Hosting a front end and an API',
					'Continuous deployment from Git'
				]
			)
		]
	},
	{
		id: `${FS}--s5`,
		title: 'Capstone',
		lessons: [
			l(
				FS,
				'planning-your-capstone',
				'Planning Your Capstone',
				'24:10',
				'Choose a project you care about, scope it to something you can finish, and write the plan you will build against.',
				[
					'Picking a project worth building',
					'Scoping with user stories',
					'A realistic milestone plan'
				]
			),
			l(
				FS,
				'building-the-api',
				'Building the API',
				'1:06:35',
				'Design and implement the back end for your capstone with authentication-ready routes, validation and tests.',
				[
					'Routes, controllers and services',
					'Input validation and error handling',
					'Writing your first API tests'
				]
			),
			l(
				FS,
				'polishing-the-interface',
				'Polishing the Interface',
				'42:20',
				'The details that make software feel finished: loading states, motion, accessibility and performance.',
				[
					'Accessible focus and keyboard flows',
					'Purposeful motion and feedback',
					'Measuring and fixing performance'
				]
			),
			l(
				FS,
				'launch-and-whats-next',
				'Launch & What’s Next',
				'24:29',
				'Launch your capstone, write about what you built, and plan the next step in your learning journey.',
				[
					'A launch checklist',
					'Writing a project case study',
					'Where to go from here'
				]
			)
		]
	}
]);

/* ── Catalog ────────────────────────────────────────────────── */

export const courses: Course[] = [
	{
		id: FS,
		title: 'Full Stack Web Development',
		subtitle: 'Build modern web applications from the ground up.',
		description:
			'A complete, project-led path from how the web works to deploying your own application. You will write semantic HTML, design responsive interfaces with modern CSS, program with JavaScript, build an API and ship a real product — understanding every layer along the way.',
		instructor: instructors.alex,
		thumbnail: '/images/courses/full-stack-web-development.svg',
		category: 'development',
		level: 'Beginner',
		duration: '12h 30m',
		rating: 4.8,
		ratingCount: 2184,
		students: 12480,
		sections: fullStackSections,
		outcomes: [
			'Explain how browsers, servers and APIs talk to each other',
			'Write semantic, accessible HTML and maintainable CSS',
			'Build responsive layouts with Flexbox, Grid and fluid type',
			'Program confidently with modern JavaScript',
			'Design and build a REST API with Node.js',
			'Deploy a full-stack application with continuous delivery'
		],
		requirements: [
			'A computer running macOS, Windows or Linux',
			'No prior programming experience — curiosity is enough',
			'Around four hours a week to watch and build'
		],
		reviews: [
			{
				id: 'r1',
				author: 'Ananya K.',
				role: 'Career switcher, now Junior Developer',
				rating: 5,
				body: 'The first course that explained why, not just how. By the deployment lesson I had stopped copying and started designing my own solutions.',
				date: '2026-08-14'
			},
			{
				id: 'r2',
				author: 'Marcus T.',
				role: 'Product Designer',
				rating: 5,
				body: 'Calm, precise and beautifully paced. The capstone gave me a real project to show in interviews.',
				date: '2026-07-02'
			},
			{
				id: 'r3',
				author: 'Sofia R.',
				role: 'Student',
				rating: 4,
				body: 'Async JavaScript finally clicked for me here. I would love even more exercises in the JavaScript section.',
				date: '2026-06-19'
			}
		],
		skills: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'REST APIs', 'Deployment'],
		tone: 'ink',
		featured: true,
		updated: '2026-09',
		language: 'English',
		price: { original: 12999, offer: 4999 }
	},
	{
		id: 'design-systems-in-practice',
		title: 'Design Systems in Practice',
		subtitle: 'Tokens, components and the governance that keeps them alive.',
		description:
			'Learn to build a design system that teams actually adopt — from foundations and tokens to component APIs, documentation and contribution models.',
		instructor: instructors.priya,
		thumbnail: '/images/courses/design-systems-in-practice.svg',
		category: 'design',
		level: 'Intermediate',
		duration: '8h 15m',
		rating: 4.9,
		ratingCount: 961,
		students: 5320,
		sections: outline('design-systems-in-practice', [
			['Foundations', [['Why systems fail', '18:20'], ['Auditing an interface', '32:10'], ['Design tokens', '41:45']]],
			['Components', [['Component anatomy', '38:00'], ['Variants and states', '44:30'], ['Accessible by default', '36:15']]],
			['Operations', [['Documentation people read', '29:40'], ['Contribution models', '33:20'], ['Measuring adoption', '27:05']]]
		]),
		outcomes: ['Define a token architecture', 'Design flexible component APIs', 'Run a contribution process'],
		requirements: ['Working knowledge of a design tool such as Figma'],
		reviews: [],
		skills: ['Design tokens', 'Components', 'Documentation'],
		tone: 'warm',
		featured: true,
		updated: '2026-08',
		language: 'English',
		price: { original: 9999, offer: 3499 }
	},
	{
		id: 'applied-machine-learning',
		title: 'Applied Machine Learning',
		subtitle: 'From a clean dataset to a model in production.',
		description:
			'A practical path through supervised learning, evaluation and deployment — with an emphasis on the decisions that matter in real projects.',
		instructor: instructors.mei,
		thumbnail: '/images/courses/applied-machine-learning.svg',
		category: 'artificial-intelligence',
		level: 'Intermediate',
		duration: '14h 10m',
		rating: 4.8,
		ratingCount: 1402,
		students: 8710,
		sections: outline('applied-machine-learning', [
			['Framing problems', [['What ML is good at', '22:15'], ['Data, labels and leakage', '46:30'], ['Baselines first', '31:40']]],
			['Models', [['Linear models', '52:10'], ['Trees and ensembles', '58:25'], ['Neural networks, gently', '1:04:00']]],
			['Production', [['Evaluation that matters', '48:15'], ['Serving a model', '42:30'], ['Monitoring drift', '36:50']]]
		]),
		outcomes: ['Frame ML problems', 'Train and evaluate models', 'Deploy and monitor a model'],
		requirements: ['Comfort with Python basics'],
		reviews: [],
		skills: ['Python', 'scikit-learn', 'Evaluation'],
		tone: 'green',
		featured: true,
		updated: '2026-09',
		language: 'English',
		price: { original: 14999, offer: 5999 }
	},
	{
		id: 'data-storytelling',
		title: 'Data Storytelling',
		subtitle: 'Make numbers persuasive without making them misleading.',
		description:
			'Learn to find the narrative in a dataset, choose the right chart, and present insight so that decisions follow.',
		instructor: instructors.daniel,
		thumbnail: '/images/courses/data-storytelling.svg',
		category: 'data-science',
		level: 'Beginner',
		duration: '6h 40m',
		rating: 4.7,
		ratingCount: 744,
		students: 6045,
		sections: outline('data-storytelling', [
			['Finding the story', [['Questions before charts', '24:10'], ['Exploring a dataset', '38:45']]],
			['Visual craft', [['Choosing the right chart', '41:20'], ['Colour with intent', '29:30'], ['Annotation', '26:15']]],
			['Presenting', [['The one-slide summary', '31:00'], ['Dashboards that get used', '36:40']]]
		]),
		outcomes: ['Structure an analytical narrative', 'Choose effective charts', 'Present insight clearly'],
		requirements: ['Spreadsheet basics'],
		reviews: [],
		skills: ['Visualisation', 'Analysis', 'Presentation'],
		tone: 'paper',
		updated: '2026-07',
		language: 'English',
		price: { original: 6999, offer: 2499 }
	},
	{
		id: 'building-with-llms',
		title: 'Building with Large Language Models',
		subtitle: 'Prompts, retrieval, tools and evaluation — for real products.',
		description:
			'Design reliable LLM features: structured prompting, retrieval-augmented generation, tool use, agents and the evaluation loops that keep quality high.',
		instructor: instructors.samuel,
		thumbnail: '/images/courses/building-with-llms.svg',
		category: 'artificial-intelligence',
		level: 'Advanced',
		duration: '9h 20m',
		rating: 4.9,
		ratingCount: 1120,
		students: 7390,
		sections: outline('building-with-llms', [
			['Foundations', [['How LLMs behave', '34:20'], ['Prompting with structure', '46:10']]],
			['Systems', [['Retrieval', '52:30'], ['Tools and agents', '58:45'], ['Guardrails', '38:20']]],
			['Quality', [['Building evals', '49:10'], ['Shipping and iterating', '36:00']]]
		]),
		outcomes: ['Design LLM features', 'Build RAG pipelines', 'Evaluate model quality'],
		requirements: ['Experience building web applications'],
		reviews: [],
		skills: ['LLMs', 'RAG', 'Evals', 'Agents'],
		tone: 'ink',
		updated: '2026-09',
		language: 'English',
		price: { original: 11999, offer: 4499 }
	},
	{
		id: 'product-strategy-fundamentals',
		title: 'Product Strategy Fundamentals',
		subtitle: 'Decide what to build — and, more importantly, what not to.',
		description:
			'A clear framework for vision, positioning, roadmaps and trade-offs, taught through case studies from real product teams.',
		instructor: instructors.hannah,
		thumbnail: '/images/courses/product-strategy-fundamentals.svg',
		category: 'business',
		level: 'Beginner',
		duration: '5h 30m',
		rating: 4.6,
		ratingCount: 512,
		students: 3980,
		sections: outline('product-strategy-fundamentals', [
			['Direction', [['Vision vs. strategy', '26:30'], ['Understanding your market', '34:15']]],
			['Choices', [['Positioning', '29:20'], ['Roadmaps as bets', '38:05']]],
			['Execution', [['Metrics that matter', '31:40'], ['Saying no well', '22:10']]]
		]),
		outcomes: ['Write a product strategy', 'Build an outcome roadmap', 'Choose meaningful metrics'],
		requirements: ['None'],
		reviews: [],
		skills: ['Strategy', 'Roadmapping', 'Metrics'],
		tone: 'green',
		updated: '2026-06',
		language: 'English',
		price: { original: 8999, offer: 2999 }
	},
	{
		id: 'brand-marketing-essentials',
		title: 'Brand Marketing Essentials',
		subtitle: 'Build a brand people remember and recommend.',
		description:
			'Positioning, voice, identity and campaigns — the essentials of building a brand with intention rather than by accident.',
		instructor: instructors.leila,
		thumbnail: '/images/courses/brand-marketing-essentials.svg',
		category: 'marketing',
		level: 'Beginner',
		duration: '7h 05m',
		rating: 4.7,
		ratingCount: 638,
		students: 4410,
		sections: outline('brand-marketing-essentials', [
			['Brand', [['What a brand really is', '24:30'], ['Positioning statements', '36:15']]],
			['Expression', [['Voice and tone', '32:40'], ['Visual identity', '41:10']]],
			['Growth', [['Campaign thinking', '38:30'], ['Measuring brand', '29:50']]]
		]),
		outcomes: ['Position a brand', 'Define voice and identity', 'Plan a campaign'],
		requirements: ['None'],
		reviews: [],
		skills: ['Positioning', 'Brand voice', 'Campaigns'],
		tone: 'warm',
		updated: '2026-05',
		language: 'English',
		price: { original: 7999, offer: 2799 }
	},
	{
		id: 'the-art-of-light',
		title: 'The Art of Light',
		subtitle: 'See, shape and photograph light with intention.',
		description:
			'A photography course about seeing: natural and artificial light, composition and the editing choices that create a consistent point of view.',
		instructor: instructors.tomas,
		thumbnail: '/images/courses/the-art-of-light.svg',
		category: 'photography',
		level: 'Intermediate',
		duration: '6h 15m',
		rating: 4.9,
		ratingCount: 830,
		students: 5120,
		sections: outline('the-art-of-light', [
			['Seeing', [['Quality of light', '28:40'], ['Direction and shadow', '33:20']]],
			['Shaping', [['Working with windows', '36:05'], ['One-light portraits', '44:30']]],
			['Finishing', [['Editing with restraint', '39:15'], ['Building a series', '31:20']]]
		]),
		outcomes: ['Read light quality', 'Shape light for portraits', 'Edit a cohesive series'],
		requirements: ['Any camera with manual controls'],
		reviews: [],
		skills: ['Lighting', 'Composition', 'Editing'],
		tone: 'ink',
		updated: '2026-08',
		language: 'English',
		price: { original: 6499, offer: 1999 }
	},
	{
		id: 'motion-for-interfaces',
		title: 'Motion for Interfaces',
		subtitle: 'Animation that explains, guides and delights — never distracts.',
		description:
			'Easing, choreography and scroll-driven storytelling for product interfaces, with accessibility and performance built in.',
		instructor: instructors.priya,
		thumbnail: '/images/courses/motion-for-interfaces.svg',
		category: 'design',
		level: 'Advanced',
		duration: '4h 50m',
		rating: 4.8,
		ratingCount: 402,
		students: 2760,
		sections: outline('motion-for-interfaces', [
			['Principles', [['Why motion matters', '19:30'], ['Easing and timing', '34:20']]],
			['Practice', [['Choreography', '38:10'], ['Scroll storytelling', '46:40']]],
			['Responsibility', [['Reduced motion', '22:15'], ['Performance', '28:40']]]
		]),
		outcomes: ['Choose easing with intent', 'Choreograph transitions', 'Respect reduced motion'],
		requirements: ['Basic CSS knowledge'],
		reviews: [],
		skills: ['Easing', 'Choreography', 'GSAP'],
		tone: 'paper',
		updated: '2026-09',
		language: 'English',
		price: { original: 7499, offer: 2499 }
	},
	{
		id: 'typescript-in-depth',
		title: 'TypeScript in Depth',
		subtitle: 'Types as a design tool, not a chore.',
		description:
			'Go beyond annotations: generics, narrowing, type-level programming and the patterns that make large codebases a pleasure to change.',
		instructor: instructors.alex,
		thumbnail: '/images/courses/typescript-in-depth.svg',
		category: 'development',
		level: 'Intermediate',
		duration: '10h 05m',
		rating: 4.8,
		ratingCount: 1290,
		students: 9150,
		sections: outline('typescript-in-depth', [
			['The type system', [['Structural typing', '32:20'], ['Narrowing', '41:15'], ['Generics', '56:40']]],
			['Patterns', [['Discriminated unions', '44:10'], ['Type-safe APIs', '52:25']]],
			['At scale', [['Configuring for teams', '29:30'], ['Migrating a codebase', '48:20']]]
		]),
		outcomes: ['Model domains with types', 'Write expressive generics', 'Migrate JavaScript safely'],
		requirements: ['Comfort with JavaScript'],
		reviews: [],
		skills: ['TypeScript', 'Generics', 'API design'],
		tone: 'green',
		updated: '2026-08',
		language: 'English',
		price: { original: 8499, offer: 2999 }
	}
];

export const SEEDED_COURSE_ID = FS;
