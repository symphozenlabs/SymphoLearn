# SymphoZen Academia

*Beyond Classrooms. Into Possibilities.* The marketing and lead-generation site for SymphoZen Academia, the training academy of SymphoZen Labs. It's a static site whose content is managed in Sanity.

This is **not an LMS**. There are no logins, enrolments or lesson players. The site presents programs, fees and the academy, and turns visitors into enquiries: free demo classes, career counselling calls, course enquiries and corporate-training requests.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in /build (every route prerendered)
npm run check      # svelte-check / TypeScript
```

Stack: Svelte 5 (runes) · SvelteKit (static adapter) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lucide · Sanity (content) · Resend (enquiry emails, via a Firebase or Vercel function).

```bash
firebase deploy --only hosting,functions   # static site + the /api/interest function
```

## Pages

| Route | What it does |
| --- | --- |
| `/` | Hero with a free-counselling form and headline numbers; **"Your story" scroll story** (pinned, five chapters: Stuck → Discover → Build → Prove → Rise — a career-profile card fills with the featured program's real skills, a certificate and an offer, ending on the enrolment CTA; plain list without JS or with reduced motion); signature line, who it's for, popular programs, disciplines, why us, modes of training and batches, how it works (six steps), testimonials, corporate band, FAQs and contact |
| `/courses` | Programs and fees: search, category chips, level / length filters, sort, gallery ⇄ list. State is mirrored in the URL (`?category=design&level=Beginner`) |
| `/courses/[id]` | Program brochure: facts strip, sample-class video, sticky section tabs, about, outcomes, tools, curriculum (modules), career roles and career support, modes and batches, certificate, mentor, who should join, reviews, FAQs. Sticky fee panel with a callback form |
| `/courses/[id]/enquire` | Full enquiry form for one program, beside a summary card |
| `/corporate-training` | Corporate and campus offering, benefits, four-step process, proposal form (organisation, work email, team size) |
| `/about` | Story, numbers, mission and vision, how we teach, modes, how it works |
| `/contact` | Enquiry form, direct contact details, FAQs |

Lead capture on every page:
- an announcement bar with phone, email and WhatsApp;
- a **Book a free demo** button in the header;
- a floating WhatsApp (or enquire) button on desktop;
- a sticky *Call · Book a free demo* bar on phones.

Every enquiry button opens one shared modal (`EnquiryDialog`) with the right enquiry kind and course pre-selected. Search: <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> or <kbd>/</kbd>.

## Content (Sanity)

Programs, with title, copy, cover, curriculum, mentor, **original + offer price** and **career roles**, are edited in the Sanity Studio in `studio/`. So are the site settings:
- the tagline;
- currency and offer label;
- the announcement bar;
- **phone, WhatsApp number, address and opening hours**.

Leave phone or WhatsApp empty and every call or WhatsApp button hides itself; the floating button then opens the enquiry form instead.

```bash
# one-time
cd studio && npm install && cp .env.example .env    # add SANITY_STUDIO_PROJECT_ID
npm run sanity:seed                                  # (repo root) export today's catalog → studio/seed/catalog.ndjson
cd studio && npm run seed                            # import it, uploading every image
npm run dev                                          # (studio) the editor at http://localhost:3333
```

The site reads Sanity **at build time**. `npm run content` runs automatically before `dev` and `build` and writes `src/lib/data/sanity.generated.json`, which is baked into the static pages. Set `SANITY_PROJECT_ID` / `SANITY_DATASET` in `.env` (see `.env.example`). Without them the bundled seed in `src/lib/data/courses.ts` and `site.ts` is used, so the site always builds. Settings that are set in Sanity override the bundled defaults.

Shared marketing copy lives in `src/lib/data/academy.ts`:
- training modes and batches;
- why us and how it works;
- audiences;
- corporate offerings;
- FAQs.

Headline numbers (learners, programs, rating) are derived from the catalog in `src/lib/data/catalog.ts`. They are never typed in by hand.

## Enquiry email (Resend)

The only server code is `functions/interest.js`. It does validation, a honeypot field, light rate-limiting and one Resend call per enquiry. Enquiry kinds are `demo`, `counselling`, `course`, `corporate` and `contact`:
- name and phone are always required;
- a course is optional ("not sure yet" is allowed);
- corporate enquiries also need an organisation and a work email.

The email goes to `INTEREST_TO`, with reply-to set to the visitor when they leave an email address.

The handler runs in three places:
- production on Firebase, as the Function `interest` (Hosting rewrites `/api/interest` to it);
- production on Vercel, through `functions/vercel.js`;
- `npm run dev`, which serves the same handler from `vite.config.ts`.

```bash
firebase functions:secrets:set RESEND_API_KEY
cp functions/.env.example functions/.env   # RESEND_FROM (verified domain) + INTEREST_TO (team inbox)
```

Locally, put the same three values in `.env`. Without a key, the email is printed to the terminal instead of sent.

## Brand

`static/brand/` holds the assets derived from the master artwork `SymphoZen Academia Logo.png`. The lotus-and-mortarboard mark, "SymphoZen" and the bold green "Academia" are used as drawn:

- `academia-logo.svg` / `-on-dark.svg`: the full lockup with the *Beyond Classrooms. Into Possibilities* line, used in the header and footer (charcoal or white text, green "Zen")
- `academia-wordmark.svg` / `-on-dark.svg`: the same lockup without the tagline
- `.png` copies of both, rendered from the SVG master (`SymphoZen Academia Logo.svg`), for social previews
- `academia-mark.png`: the lotus alone (marquee, certificate, watermark)
- favicon, apple-touch and manifest icons: a white lotus on a brand-green tile

The design system is the SymphoZen Labs brand, token for token (`src/app.css`):
- **Colour:** warm paper, ink, and sage green `#5a8a45`. `--green-400` `#7bbd5f` is the logo's green, the same hue lighter, used for accents on dark surfaces.
- **Type:** Inter for the interface and Playfair Display for headings.
- **Details:** hairline borders, long soft shadows, and `cubic-bezier(.22, 1, .36, 1)` motion.

## Architecture

```
src/lib/
  types.ts                    domain models (Course, Price, SiteSettings, Catalog)
  data/catalog.ts             the content the site renders (Sanity build output, else the seed),
                              contact links (tel / mailto / wa.me), headline numbers
  data/courses.ts, site.ts    bundled seed: 10 programs, 7 categories, site settings
  data/academy.ts             shared marketing copy (modes, batches, steps, FAQs, corporate)
  services/courseService.ts   data access over the catalog
  stores/enquiry.svelte.ts    the site-wide enquiry modal (open with a kind + course)
  motion/                     GSAP setup + reveal / magnetic / count-up actions
  components/                 Navbar, Footer, EnquiryForm, EnquiryDialog, ContactDock, CourseCard,
                              CourseGrid, Curriculum, PriceTag, Faq, SearchDialog, home/*
functions/                    interest.js (shared handler) + index.js (Firebase) + vercel.js (Vercel)
studio/                       Sanity Studio: schemas for course, category, instructor, site settings
scripts/                      sanity-sync (build-time content), sanity-seed (export), cover + video generators
```
