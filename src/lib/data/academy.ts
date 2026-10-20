/**
 * Marketing copy shared across pages: how the academy teaches, who it is for,
 * how joining works, and the questions people ask before they enquire.
 */

export interface Mode {
	id: 'online' | 'classroom' | 'hybrid' | 'corporate';
	title: string;
	lead: string;
	points: string[];
}

export const modes: Mode[] = [
	{
		id: 'online',
		title: 'Live online',
		lead: 'Instructor-led classes you join from anywhere, with the same projects and mentors as the classroom.',
		points: ['Interactive live sessions', 'Every class recorded', 'Doubt-clearing on chat']
	},
	{
		id: 'classroom',
		title: 'Classroom',
		lead: 'Small batches at our training centre — learn side by side with your mentor and your cohort.',
		points: ['Hands-on lab time', 'Small batch sizes', 'Peer project teams']
	},
	{
		id: 'hybrid',
		title: 'Hybrid',
		lead: 'Weekday classes online, weekend labs in person. Switch between the two whenever your week changes.',
		points: ['Flexible weekly rhythm', 'In-person project reviews', 'Ideal for working professionals']
	},
	{
		id: 'corporate',
		title: 'Corporate & campus',
		lead: 'Programs tailored to your team or college, delivered on-site, online or as a blended cohort.',
		points: ['Custom curriculum', 'Progress reports for managers', 'On-site or virtual']
	}
];

export const batches = [
	{ title: 'Weekday batch', when: 'Mon – Fri', time: 'Morning or evening slots' },
	{ title: 'Weekend batch', when: 'Sat & Sun', time: 'Built for working professionals' },
	{ title: 'Fast-track', when: 'Daily, intensive', time: 'Finish in about half the time' }
];

export const features = [
	{ title: 'Mentor-led live classes', body: 'Learn from practitioners who do this work every day — and ask them anything, in every session.' },
	{ title: 'Real projects, not quizzes', body: 'Every program ends with a capstone you can show in interviews, built on industry tools.' },
	{ title: 'Industry-recognised certificate', body: 'Complete the program and your capstone to earn a SymphoZen Academia certificate.' },
	{ title: 'Career support', body: 'Resume and LinkedIn reviews, mock interviews and introductions to hiring teams.' },
	{ title: 'Every session recorded', body: 'Missed a class or want to revisit one? Recordings and notes stay available to you.' },
	{ title: 'Flexible batches & EMI', body: 'Weekday, weekend and fast-track batches, with easy instalments on every program.' }
];

export const steps = [
	{ title: 'Free counselling', body: 'Tell us your goal. A counsellor maps the program and batch that fit your background.' },
	{ title: 'Free demo class', body: 'Sit in on a live class, meet your mentor and see how sessions run — before you pay anything.' },
	{ title: 'Enrol & pick a batch', body: 'Choose online, classroom or hybrid, weekday or weekend — with instalments if you prefer.' },
	{ title: 'Learn by building', body: 'Live classes, guided labs and assignments, reviewed by your mentor every week.' },
	{ title: 'Capstone & certificate', body: 'Ship a portfolio-ready project and earn your certificate of completion.' },
	{ title: 'Career support', body: 'Resume reviews, mock interviews and referrals until you are interview-ready.' }
];

export const audiences = [
	{
		id: 'students',
		label: 'Students & freshers',
		title: 'Start your career with proof.',
		body: 'Graduate with a portfolio, a certificate and interview practice — not just a degree.',
		cta: { label: 'Explore programs', href: '/courses' }
	},
	{
		id: 'professionals',
		label: 'Working professionals',
		title: 'Switch roles or level up.',
		body: 'Weekend and evening batches, recorded sessions and mentors who understand a full-time job.',
		cta: { label: 'Find a weekend batch', href: '/courses' }
	},
	{
		id: 'teams',
		label: 'Companies & colleges',
		title: 'Upskill your people at scale.',
		body: 'Custom programs for teams and campuses, delivered on-site or online, with reporting built in.',
		cta: { label: 'Corporate training', href: '/corporate-training' }
	}
];

export const corporateOfferings = [
	{ title: 'Employee upskilling', body: 'Role-based programs in development, data, AI, design and marketing — mapped to the skills your teams need next.' },
	{ title: 'Campus programs', body: 'Industry-readiness programs and faculty development for colleges, aligned to your academic calendar.' },
	{ title: 'Custom curriculum', body: 'We co-design content around your stack, your products and your workflows — with your own case studies.' },
	{ title: 'Workshops & bootcamps', body: 'One-day workshops to multi-week bootcamps for launches, new tools and leadership teams.' }
];

export const corporateSteps = [
	{ title: 'Discover', body: 'We meet your team leads to understand goals, current skills and constraints.' },
	{ title: 'Design', body: 'A tailored curriculum, schedule and delivery format — reviewed with you before we start.' },
	{ title: 'Deliver', body: 'Live, hands-on sessions on-site or online, led by practitioner mentors.' },
	{ title: 'Measure', body: 'Assessments, project reviews and a report on outcomes for every cohort.' }
];

export const faqs = [
	{
		q: 'Are classes live or recorded?',
		a: 'Classes are live and instructor-led — online, in the classroom or both. Every session is also recorded so you can revisit it or catch up on one you missed.'
	},
	{
		q: 'Can I attend a demo class before I enrol?',
		a: 'Yes. Book a free demo and you will sit in on a live session, meet your mentor and ask about the curriculum before deciding anything.'
	},
	{
		q: 'I am new to the field. Which program should I choose?',
		a: 'Book a free counselling call. We will look at your background and goals and suggest a program and batch that fit — beginner programs assume no prior experience.'
	},
	{
		q: 'Do I get a certificate?',
		a: 'Yes. When you complete the program and submit your capstone project you receive a SymphoZen Academia certificate of completion.'
	},
	{
		q: 'Do you help with jobs after the course?',
		a: 'Every program includes career support: resume and LinkedIn reviews, mock interviews and introductions to hiring teams. We do not promise placements — we prepare you to win them.'
	},
	{
		q: 'Can I pay in instalments?',
		a: 'Yes. Every program can be paid in easy instalments. Ask your counsellor for the current offer and EMI options.'
	},
	{
		q: 'Do you train teams and colleges?',
		a: 'Yes. We run custom programs, workshops and bootcamps for companies and campuses — on-site or online. See Corporate training for details.'
	}
];
