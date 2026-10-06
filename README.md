# SymphoLearn

Learning, designed as a journey. A SymphoZen Labs product — a static site whose content is managed in Sanity.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in /build (every route prerendered)
npm run check      # svelte-check / TypeScript
```

Stack: Svelte 5 (runes) · SvelteKit (static adapter) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Three.js · Lucide · Sanity (content) · Resend (one email, via a Firebase Function).

```bash
firebase deploy --only hosting,functions   # static site + the /api/interest function
```

## What's in Phase 1

| Route | What it does |
| --- | --- |
| `/` | Scroll-driven story hero (Curiosity → Discovery → Learning → Progress → Transformation), featured courses, disciplines index, platform principles, learning-room showcase, CTA |
| `/courses` | Discovery: search, category chips, level / length filters, sort, gallery ⇄ list. State is mirrored in the URL (`?category=design&level=Beginner`) |
| `/courses/[id]` | Editorial course page: inline preview video, outcomes, curriculum, instructor, requirements, reviews, sticky enrolment panel |
| `/learn/[courseId]` | The learning room: real `<video>` player, curriculum sidebar (bottom sheet on mobile), lesson notes, previous / next, mark complete, auto-advance. Deep links via `?lesson=` |
| `/courses/[id]/enroll` | “I’m interested” form (name, email, optional phone + note). Sends one email to the SymphoZen team: *<name> is interested in <course>*, reply-to the visitor |
| `/dashboard` | Greeting, continue learning, learning streak, your courses, recent activity (progress kept in this browser) |

Search is also available everywhere with <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> or <kbd>/</kbd>.

## Content & pricing (Sanity)

Every course — title, copy, cover image, curriculum, instructor, **original + offer price** — plus site settings (the *Learn with SymphoZen* line, currency, offer label, which course the home story follows) are edited in the Sanity Studio in `studio/`.

```bash
# one-time
cd studio && npm install && cp .env.example .env    # add SANITY_STUDIO_PROJECT_ID
npm run sanity:seed                                  # (repo root) export today's catalog → studio/seed/catalog.ndjson
cd studio && npm run seed                            # import it, uploading every image
npm run dev                                          # (studio) the editor at http://localhost:3333
```

The site reads Sanity **at build time**: `npm run content` (runs automatically before `dev` and `build`) writes `src/lib/data/sanity.generated.json`, which is baked into the static pages. Set `SANITY_PROJECT_ID` / `SANITY_DATASET` in `.env` (see `.env.example`). Without them the bundled seed in `src/lib/data/courses.ts` + `site.ts` is used, so the site always builds. To publish edits, rebuild and deploy — e.g. a Sanity webhook that triggers your CI deploy.

Prices render as the offer price, the original slashed beside it, and the saving (`PriceTag.svelte`), formatted with the CMS currency + locale (default INR, `en-IN`).

## Course-interest email (Resend)

The only server code is `functions/interest.js`: validation, a honeypot, light rate-limiting and one Resend call. Production runs it as the Firebase Function `interest` (Hosting rewrites `/api/interest` to it); `npm run dev` serves the same handler from `vite.config.ts`.

```bash
firebase functions:secrets:set RESEND_API_KEY
cp functions/.env.example functions/.env   # RESEND_FROM (verified domain) + INTEREST_TO (team inbox)
```

Locally, put the same three values in `.env`; without a key the email is printed to the terminal instead of sent.

## Video

`static/videos/welcome.mp4` is a real 46-second lesson (H.264/AAC, ~0.9 MB) rendered from `scripts/make-welcome-video.py` with ffmpeg in the brand typography. Lesson 01 of *Full Stack Web Development* plays it.

Every other lesson already has a canonical path, e.g. `/videos/full-stack-web-development/02-how-the-web-works.mp4`. Drop an MP4 at `static/` + that path and it plays — no code changes. Until then the player shows where the file belongs.

Player: play/pause, seek with buffered range, ±10 s, volume, speed (0.75–2×), fullscreen, time/duration, resume-from-position, keyboard (`Space`/`K`, `←`/`→`, `J`/`L`, `↑`/`↓`, `M`, `F`, `0–9`).

## Progress

Stored in `localStorage` (`sympholearn:progress:v1`): `currentLessonId`, `completedLessons`, `lessonProgress` (watched ratio), `lastPosition`, plus an activity log and active days for the streak. A lesson completes at 90 % watched, on *Next lesson*, or via *Mark as complete*. Writes are throttled during playback and flushed when the tab hides. Tabs stay in sync through the `storage` event.

## Design system

The SymphoZen Labs brand, verified token-for-token against symphozen.com (`src/app.css`):

- **Colour** — paper `#fcfcfa` / `#f4f5f1` / warm `#f3efe7`, text `#242424`, muted `#646464`, faint `#90948c`, ink `#171916` for dark surfaces, sage green `#5a8a45` (hover `#4d783b`, soft `#b8cea9`, faint `#edf4e9`), hairlines `#e5e7e2` / `#d3d6cf`. No other colours are used (apart from form error/warning states).
- **Type** — exactly the company's set: Inter 400–700 for UI, Playfair Display 500/600 for display. Display headings: −0.035em tracking, 1.04 line height. Italic accents are synthesised from the upright Playfair, as on symphozen.com (no italic font file is loaded). Eyebrows: Inter 650, uppercase, +0.19em, green; small labels uppercase and tracked.
- **Buttons** — brand green, 0.3rem radius, 3.25rem tall, 650 weight; secondary is an outlined box.
- **Shadows & motion** — the company's long soft shadows, `cubic-bezier(.22, 1, .36, 1)`, 160 / 260 / 650 ms.
- **Cards** keep a softer radius (`--radius-lg/xl`) as the learning product's own shape.

### Logo & favicon

`static/brand/` holds the SymphoLearn lockup, built from the official SymphoZen Labs artwork: the lotus and the “Sympho” outlines are untouched; “Learn” is set in Figtree Bold and the tagline “Learn with SymphoZen” in Figtree Medium — the typeface the original wordmark matches — at the original's cap height, baseline and letter-spacing. Variants: `sympholearn-logo.svg` (light backgrounds), `sympholearn-logo-on-dark.svg`, `sympholearn-mark.svg` / `-mark-light.svg` (lotus only).

Favicon: the white lotus on a brand-green tile (`favicon.svg`, `favicon.ico` 16/32/48 each tuned for its size, `apple-touch-icon.png`, `icons/` for the web manifest).

## Architecture

```
src/lib/
  types.ts                    domain models (Course, Price, SiteSettings, Catalog)
  data/catalog.ts             the content the site renders: Sanity build output, else the seed
  data/courses.ts, site.ts    bundled seed — 10 courses, 7 categories, site settings
  services/courseService.ts   data access over the catalog
  services/progressRepository.ts  persistence interface + localStorage impl
  stores/progress.svelte.ts   reactive progress store (runes)
  motion/                     GSAP setup + reveal / magnetic actions
  three/                      the hero laptop (LaptopScene) + its screen painters
  components/                 Navbar, HeroStory, CourseCard, PriceTag, CourseGrid, CoursePlayer,
                              VideoPlayer, LessonList, Footer, SearchDialog, form/*, home/*
functions/                    interest.js (shared handler) + index.js (Firebase Function)
studio/                       Sanity Studio — schemas for course, category, instructor, site settings
scripts/                      sanity-sync (build-time content), sanity-seed (export), cover + video generators
```

Every route is prerendered; progress is read on the client, so the build stays fully static.
