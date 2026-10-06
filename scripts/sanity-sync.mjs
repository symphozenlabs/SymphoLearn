/**
 * Pulls the published catalog from Sanity into src/lib/data/sanity.generated.json,
 * which the static build bakes in (see src/lib/data/catalog.ts).
 *
 * Runs before `dev` and `build`. Configure in .env:
 *   SANITY_PROJECT_ID=abc123   SANITY_DATASET=production
 *   SANITY_READ_TOKEN=…        (only for a private dataset)
 *   SANITY_STRICT=1            (fail the build if Sanity can't be reached)
 * Not configured → the bundled seed content is used.
 */
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/lib/data/sanity.generated.json');
const { SANITY_PROJECT_ID: projectId, SANITY_DATASET: dataset = 'production', SANITY_READ_TOKEN: token } = process.env;
const apiVersion = process.env.SANITY_API_VERSION ?? '2025-02-19';
const strict = process.env.SANITY_STRICT === '1';

const IMAGE = `{ "url": asset->url, "ext": asset->extension, hotspot, alt }`;
const QUERY = `{
  "site": *[_id == "siteSettings"][0]{ tagline, taglineNote, currency, locale, offerNote, contactEmail, "heroCourseId": heroCourse->slug.current },
  "categories": *[_type == "category" && defined(slug.current)] | order(order asc, name asc){ "id": slug.current, name, description },
  "courses": *[_type == "course" && defined(slug.current)] | order(order asc, title asc){
    "id": slug.current, title, subtitle, description, level, duration, rating, ratingCount, students,
    outcomes, requirements, skills, tone, featured, updated, language, price,
    "thumbnail": thumbnail${IMAGE},
    "category": category->slug.current,
    "instructor": instructor->{ "id": slug.current, name, role, bio, "avatar": avatar${IMAGE} },
    "sections": sections[]{ _key, title, "lessons": lessons[]{ _key, title, "slug": slug.current, duration, description, keyPoints, videoUrl, "video": video.asset->url, "poster": poster${IMAGE}, preview } },
    "reviews": reviews[]{ _key, author, role, rating, body, date }
  }
}`;

/** Sanity image URL, cropped to w×h around the editor's hotspot (SVGs pass through untouched). */
function imageUrl(img, w, h) {
	if (!img?.url) return '';
	if (img.ext === 'svg') return img.url;
	const p = new URLSearchParams({ w: String(w), h: String(h), fit: 'crop', auto: 'format', q: '80' });
	if (img.hotspot) {
		p.set('crop', 'focalpoint');
		p.set('fp-x', img.hotspot.x.toFixed(3));
		p.set('fp-y', img.hotspot.y.toFixed(3));
	}
	return `${img.url}?${p}`;
}

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function toCourse(d, warn) {
	const missing = ['title', 'subtitle', 'description', 'category', 'level', 'duration'].filter((k) => !d[k]);
	if (!d.instructor?.id) missing.push('instructor');
	if (d.price?.offer == null || d.price?.original == null) missing.push('price');
	if (!d.sections?.some((s) => s.lessons?.length)) missing.push('lessons');
	if (missing.length) {
		warn(`course "${d.id}" skipped — missing ${missing.join(', ')}`);
		return null;
	}
	let count = 0;
	return {
		id: d.id,
		title: d.title,
		subtitle: d.subtitle,
		description: d.description,
		instructor: { id: d.instructor.id, name: d.instructor.name, role: d.instructor.role ?? '', bio: d.instructor.bio ?? '', avatar: imageUrl(d.instructor.avatar, 160, 160) },
		thumbnail: imageUrl(d.thumbnail, 1600, 1000),
		category: d.category,
		level: d.level,
		duration: d.duration,
		rating: d.rating ?? 0,
		ratingCount: d.ratingCount ?? 0,
		students: d.students ?? 0,
		price: { original: d.price.original, offer: d.price.offer },
		sections: d.sections
			.filter((s) => s.lessons?.length)
			.map((s, i) => ({
				id: `${d.id}--s${i + 1}`,
				title: s.title,
				lessons: s.lessons.map((l) => {
					const number = String(++count).padStart(2, '0');
					const slug = l.slug || kebab(l.title) || l._key;
					return {
						id: `${d.id}--${slug}`,
						number,
						title: l.title,
						duration: l.duration ?? '0:00',
						videoUrl: l.video || l.videoUrl || `/videos/${d.id}/${number}-${slug}.mp4`,
						description: l.description ?? '',
						keyPoints: l.keyPoints ?? [],
						completed: false,
						...(l.poster?.url ? { poster: imageUrl(l.poster, 1600, 900) } : {}),
						...(l.preview ? { preview: true } : {})
					};
				})
			})),
		outcomes: d.outcomes ?? [],
		requirements: d.requirements ?? [],
		reviews: (d.reviews ?? []).map((r) => ({ id: r._key, author: r.author, role: r.role ?? '', rating: r.rating, body: r.body, date: r.date ?? '' })),
		skills: d.skills ?? [],
		tone: d.tone ?? 'paper',
		...(d.featured ? { featured: true } : {}),
		updated: d.updated ?? new Date().toISOString().slice(0, 7),
		language: d.language ?? 'English'
	};
}

async function main() {
	if (!projectId) {
		if (existsSync(OUT)) rmSync(OUT);
		console.log('◦ content: Sanity not configured (SANITY_PROJECT_ID) — using the bundled seed catalog');
		return;
	}
	const host = token ? 'api.sanity.io' : 'apicdn.sanity.io';
	const url = `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(QUERY)}&perspective=published`;
	const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
	if (!res.ok) throw new Error(`Sanity responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
	const { result } = await res.json();

	const warnings = [];
	const courses = (result.courses ?? []).map((d) => toCourse(d, (m) => warnings.push(m))).filter(Boolean);
	warnings.forEach((w) => console.warn(`  ! ${w}`));
	if (!courses.length) {
		if (existsSync(OUT)) rmSync(OUT);
		console.warn(`! content: no publishable courses in ${projectId}/${dataset} — using the bundled seed catalog`);
		return;
	}
	const catalog = { site: result.site ?? {}, categories: result.categories ?? [], courses };
	// drop unset settings so the bundled defaults fill them in
	for (const [k, v] of Object.entries(catalog.site)) if (v == null || v === '') delete catalog.site[k];
	writeFileSync(OUT, JSON.stringify(catalog, null, '\t') + '\n');
	console.log(`✓ content: ${courses.length} courses, ${catalog.categories.length} categories from Sanity (${projectId}/${dataset})`);
}

main().catch((err) => {
	console.error(`✗ content: ${err.message}`);
	if (strict) process.exit(1);
	console.warn(existsSync(OUT) ? '  keeping the last synced content' : '  using the bundled seed catalog');
});
