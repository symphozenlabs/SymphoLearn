// Generates the geometric course covers in static/images/courses.
// Run: node scripts/generate-covers.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 1600;
const H = 1000;
const C = {
	ink: '#171916',
	inkSoft: '#22261f',
	paper: '#fcfcfa',
	paperSoft: '#f1f2ed',
	warm: '#f0ebe1',
	g100: '#e6efe0',
	g300: '#b8cea9',
	g500: '#6f9d59',
	g600: '#5a8a45',
	g700: '#4d783b',
	g800: '#3c5e2e',
	line: '#d9dcd4'
};

// deterministic pseudo-random
function rng(seed) {
	let s = seed;
	return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const frame = (bg, body, gridColor = null) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<rect width="${W}" height="${H}" fill="${bg}"/>
${gridColor ? grid(gridColor) : ''}
${body}
</svg>`;

function grid(color) {
	let g = '';
	for (let x = 200; x < W; x += 200) g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${color}" stroke-width="1"/>`;
	for (let y = 200; y < H; y += 200) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${color}" stroke-width="1"/>`;
	return `<g opacity="0.5">${g}</g>`;
}

const covers = {
	// Layers of the stack: interface, API, data
	'full-stack-web-development': () => {
		const layer = (y, op, stroke) =>
			`<path d="M800 ${y} L1180 ${y + 190} L800 ${y + 380} L420 ${y + 190} Z" fill="${op}" stroke="${stroke}" stroke-width="2"/>`;
		return frame(
			C.ink,
			`${layer(420, C.inkSoft, '#3a3f37')}
			 ${layer(290, '#1d201b', '#4a5046')}
			 ${layer(160, '#262a23', C.g500)}
			 <circle cx="800" cy="350" r="12" fill="${C.g300}"/>
			 <line x1="800" y1="350" x2="800" y2="740" stroke="${C.g600}" stroke-width="2" stroke-dasharray="4 10"/>
			 <circle cx="800" cy="740" r="6" fill="${C.g600}"/>`,
			'#2a2e27'
		);
	},
	// A token grid
	'design-systems-in-practice': () => {
		let b = '';
		const r = rng(7);
		for (let i = 0; i < 5; i++)
			for (let j = 0; j < 3; j++) {
				const x = 380 + i * 180;
				const y = 230 + j * 180;
				const k = r();
				const fill = k > 0.82 ? C.g600 : k > 0.6 ? C.ink : k > 0.35 ? C.g300 : 'none';
				const stroke = fill === 'none' ? C.ink : 'none';
				b += (i + j) % 2
					? `<rect x="${x}" y="${y}" width="120" height="120" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
					: `<circle cx="${x + 60}" cy="${y + 60}" r="60" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
			}
		return frame(C.warm, b, '#e2dccf');
	},
	// Two classes separated by a decision boundary
	'applied-machine-learning': () => {
		const r = rng(42);
		let b = `<path d="M260 900 C 620 760, 760 420, 1340 120" fill="none" stroke="${C.paper}" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/>`;
		for (let i = 0; i < 90; i++) {
			const x = 200 + r() * 1200;
			const y = 120 + r() * 760;
			const above = y < 900 - ((x - 260) / 1080) * 780 - 40 * Math.sin(x / 200);
			b += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${above ? 9 : 7}" fill="${above ? C.paper : C.g300}" opacity="${above ? 0.95 : 0.8}"/>`;
		}
		return frame(C.g700, b, C.g600);
	},
	// One bar tells the story
	'data-storytelling': () => {
		const hs = [220, 300, 260, 340, 310, 580, 360, 330];
		let b = '';
		hs.forEach((h, i) => {
			const x = 330 + i * 125;
			b += `<rect x="${x}" y="${820 - h}" width="72" height="${h}" fill="${i === 5 ? C.g600 : '#d6d9d1'}"/>`;
		});
		b += `<line x1="270" y1="820" x2="1330" y2="820" stroke="${C.ink}" stroke-width="2"/>
		      <line x1="991" y1="210" x2="991" y2="150" stroke="${C.ink}" stroke-width="2"/>
		      <line x1="991" y1="150" x2="1180" y2="150" stroke="${C.ink}" stroke-width="2"/>
		      <circle cx="1180" cy="150" r="8" fill="${C.ink}"/>`;
		return frame(C.paperSoft, b);
	},
	// Attention: nodes connected across layers
	'building-with-llms': () => {
		const cols = [3, 5, 5, 3];
		const pts = cols.map((n, ci) =>
			Array.from({ length: n }, (_, i) => [380 + ci * 280, 500 + (i - (n - 1) / 2) * 140])
		);
		let b = '';
		for (let c = 0; c < pts.length - 1; c++)
			for (const [x1, y1] of pts[c])
				for (const [x2, y2] of pts[c + 1])
					b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3b4137" stroke-width="1.5"/>`;
		b += `<path d="M${pts[0][1].join(' ')} L${pts[1][3].join(' ')} L${pts[2][1].join(' ')} L${pts[3][2].join(' ')}" fill="none" stroke="${C.g500}" stroke-width="3"/>`;
		pts.flat().forEach(([x, y], i) => {
			b += `<circle cx="${x}" cy="${y}" r="${14}" fill="${C.ink}" stroke="${[1, 8, 9, 15].includes(i) ? C.g300 : '#5d6458'}" stroke-width="2.5"/>`;
		});
		return frame(C.ink, b);
	},
	// Many paths, one direction
	'product-strategy-fundamentals': () => {
		let b = '';
		for (let i = 0; i < 9; i++) {
			const y = 260 + i * 60;
			const end = 760 + (i - 4) * 70;
			b += `<path d="M220 ${y} C 700 ${y}, 820 ${end}, 1380 ${i === 4 ? 500 : end}" fill="none" stroke="${i === 4 ? C.g700 : '#a9c296'}" stroke-width="${i === 4 ? 4 : 2}"/>`;
		}
		b += `<circle cx="1380" cy="500" r="16" fill="${C.g700}"/>`;
		return frame(C.g100, b);
	},
	// Ripples of recognition
	'brand-marketing-essentials': () => {
		let b = '';
		for (let i = 7; i >= 1; i--)
			b += `<circle cx="640" cy="560" r="${i * 70}" fill="none" stroke="${i === 3 ? C.g600 : C.ink}" stroke-width="${i === 3 ? 4 : 1.5}" opacity="${i === 3 ? 1 : 0.7 - i * 0.06}"/>`;
		b += `<circle cx="640" cy="560" r="26" fill="${C.ink}"/>
		      <circle cx="1120" cy="300" r="90" fill="${C.g600}"/>`;
		return frame(C.warm, b);
	},
	// A shaft of window light
	'the-art-of-light': () =>
		frame(
			C.ink,
			`<defs><radialGradient id="l" cx="0.62" cy="0.36" r="0.55"><stop offset="0" stop-color="#f3efe7" stop-opacity="0.95"/><stop offset="0.45" stop-color="#b8cea9" stop-opacity="0.25"/><stop offset="1" stop-color="#171916" stop-opacity="0"/></radialGradient></defs>
			 <polygon points="760,0 1180,0 1500,1000 820,1000" fill="url(#l)"/>
			 <rect x="440" y="180" width="300" height="420" fill="none" stroke="#4a5046" stroke-width="2"/>
			 <line x1="590" y1="180" x2="590" y2="600" stroke="#4a5046" stroke-width="2"/>
			 <line x1="440" y1="390" x2="740" y2="390" stroke="#4a5046" stroke-width="2"/>
			 <circle cx="1040" cy="620" r="70" fill="#f3efe7"/>`
		),
	// cubic-bezier(.22, 1, .36, 1) with a motion trail
	'motion-for-interfaces': () => {
		const P = (t) => {
			const bx = (p1, p2) => 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3;
			return [320 + bx(0.22, 0.36) * 960, 820 - bx(1, 1) * 620];
		};
		let d = 'M320 820';
		for (let t = 0.02; t <= 1.0001; t += 0.02) d += ` L${P(t)[0].toFixed(1)} ${P(t)[1].toFixed(1)}`;
		let dots = '';
		for (let i = 0; i <= 12; i++) {
			const [x, y] = P(i / 12);
			dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 12 ? 16 : 7}" fill="${i === 12 ? C.g600 : C.ink}" opacity="${i === 12 ? 1 : 0.3 + i * 0.05}"/>`;
		}
		return frame(
			C.paper,
			`<line x1="320" y1="820" x2="1280" y2="820" stroke="${C.line}" stroke-width="2"/>
			 <line x1="320" y1="820" x2="320" y2="200" stroke="${C.line}" stroke-width="2"/>
			 <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="3"/>${dots}`,
			'#eceee8'
		);
	},
	// Generic angle brackets
	'typescript-in-depth': () =>
		frame(
			C.g800,
			`<path d="M620 300 L420 500 L620 700" fill="none" stroke="${C.paper}" stroke-width="10" stroke-linecap="square"/>
			 <path d="M980 300 L1180 500 L980 700" fill="none" stroke="${C.paper}" stroke-width="10" stroke-linecap="square"/>
			 <rect x="740" y="380" width="120" height="240" fill="${C.g300}"/>
			 <rect x="700" y="380" width="200" height="40" fill="${C.g300}"/>`,
			C.g700
		)
};

mkdirSync('static/images/courses', { recursive: true });
for (const [id, make] of Object.entries(covers)) {
	writeFileSync(`static/images/courses/${id}.svg`, make().replace(/\n\s+/g, '\n'));
}
console.log(`Wrote ${Object.keys(covers).length} covers`);
