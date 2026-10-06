/**
 * Canvas painters for the laptop screen.
 *
 * - `QuestionScreen` draws the SymphoLearn search page the story opens on:
 *   a question being typed, then the courses that answer it.
 * - `paintHandoff` repaints the live HTML course window (from the DOM) into the
 *   exact place it will appear on the page, so the camera can fly into the
 *   screen and hand over to the real UI without a visible cut.
 */

export interface QuestionResult {
	title: string;
	meta: string;
	thumb: string;
}

export interface QuestionScreenData {
	question: string;
	results: QuestionResult[];
}

const C = {
	paper: '#fcfcfa',
	surface: '#ffffff',
	ink: '#171916',
	text2: '#646464',
	muted: '#90948c',
	border: '#e5e7e2',
	borderStrong: '#d3d6cf',
	green: '#5a8a45',
	green100: '#edf4e9',
	green300: '#b8cea9'
};
const DISPLAY = '"Playfair Display", Georgia, serif';
const BODY = 'Inter, system-ui, "Segoe UI", sans-serif';

/** virtual layout size the screen is designed at */
const VW = 1280;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	g.beginPath();
	g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

export class QuestionScreen {
	readonly canvas = document.createElement('canvas');
	#g: CanvasRenderingContext2D;
	#data: QuestionScreenData;
	#thumbs: (HTMLImageElement | null)[];
	#logo: HTMLImageElement;
	#scale: number;
	#vh: number;
	#key = '';
	onAsset: () => void = () => {};

	constructor(data: QuestionScreenData, width: number, aspect: number) {
		this.#data = data;
		this.canvas.width = width;
		this.canvas.height = Math.round(width / aspect);
		this.#scale = width / VW;
		this.#vh = this.canvas.height / this.#scale;
		this.#g = this.canvas.getContext('2d')!;
		this.#thumbs = data.results.map((r) => {
			const img = new Image();
			img.decoding = 'async';
			img.onload = () => {
				this.#key = '';
				this.onAsset();
			};
			img.src = r.thumb;
			return img;
		});
		// the real SymphoLearn lockup in the app's top bar
		this.#logo = new Image();
		this.#logo.onload = () => {
			this.#key = '';
			this.onAsset();
		};
		this.#logo.src = '/brand/sympholearn-logo.svg';
		// the screen is typeset in the brand fonts; redraw once they're in
		document.fonts?.ready.then(() => {
			this.#key = '';
			this.onAsset();
		});
	}

	/**
	 * Draws the screen for `typed` characters (fractional while typing) and
	 * `results` (0..1). Returns false when nothing changed since the last draw.
	 */
	draw(typed: number, results: number, caretOn: boolean): boolean {
		const chars = Math.floor(typed);
		const key = `${chars}|${results.toFixed(3)}|${caretOn}`;
		if (key === this.#key) return false;
		this.#key = key;

		const g = this.#g;
		const { question } = this.#data;
		g.setTransform(this.#scale, 0, 0, this.#scale, 0, 0);
		g.fillStyle = C.paper;
		g.fillRect(0, 0, VW, this.#vh);

		/* top bar */
		if (this.#logo.complete && this.#logo.naturalWidth) g.drawImage(this.#logo, 52, 21, (38 * 1140) / 216, 38);
		g.textBaseline = 'middle';
		g.font = `400 16px ${BODY}`;
		g.fillStyle = C.text2;
		g.fillText('Explore', 300, 40);
		g.fillText('My Learning', 384, 40);
		g.fillText('Categories', 503, 40);
		g.fillStyle = C.green100;
		g.beginPath();
		g.arc(VW - 66, 40, 19, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = C.green;
		g.font = `600 15px ${BODY}`;
		g.textAlign = 'center';
		g.fillText('Y', VW - 66, 41);
		g.textAlign = 'left';
		g.fillStyle = C.border;
		g.fillRect(0, 80, VW, 1.5);

		/* heading */
		const x0 = 96;
		g.fillStyle = C.muted;
		g.font = `500 14px ${BODY}`;
		g.letterSpacing = '2px';
		g.fillText('WELCOME BACK', x0, 150);
		g.letterSpacing = '0px';
		g.textBaseline = 'alphabetic';
		g.fillStyle = C.ink;
		g.font = `500 64px ${DISPLAY}`;
		g.fillText('What do you want to', x0, 240);
		const lw = g.measureText('What do you want to ').width;
		g.fillStyle = C.green;
		g.font = `italic 500 64px ${DISPLAY}`;
		g.fillText('learn?', x0 + lw, 240);

		/* search box */
		const by = 290;
		const bw = VW - x0 * 2;
		const bh = 82;
		g.save();
		g.shadowColor = 'rgba(36,36,36,0.10)';
		g.shadowBlur = 40;
		g.shadowOffsetY = 14;
		g.fillStyle = C.surface;
		roundRect(g, x0, by, bw, bh, 18);
		g.fill();
		g.restore();
		g.lineWidth = chars > 0 ? 2 : 1.5;
		g.strokeStyle = chars > 0 ? C.green : C.borderStrong;
		roundRect(g, x0, by, bw, bh, 18);
		g.stroke();
		// magnifier
		g.strokeStyle = chars > 0 ? C.green : C.muted;
		g.lineWidth = 2.6;
		g.beginPath();
		g.arc(x0 + 44, by + 38, 11, 0, Math.PI * 2);
		g.moveTo(x0 + 52, by + 46);
		g.lineTo(x0 + 60, by + 54);
		g.stroke();
		// text
		g.textBaseline = 'middle';
		g.font = `400 27px ${BODY}`;
		const tx = x0 + 84;
		if (chars === 0) {
			g.fillStyle = C.muted;
			g.fillText('Ask a question, or search 120+ courses…', tx, by + bh / 2 + 1);
		}
		const shown = question.slice(0, chars);
		g.fillStyle = C.ink;
		g.fillText(shown, tx, by + bh / 2 + 1);
		if (caretOn) {
			g.fillStyle = C.green;
			g.fillRect(tx + g.measureText(shown).width + 3, by + 24, 2.5, bh - 48);
		}
		// return hint
		g.font = `500 14px ${BODY}`;
		const done = chars >= question.length;
		g.fillStyle = done ? C.ink : C.border;
		roundRect(g, x0 + bw - 70, by + 25, 48, 32, 8);
		g.fill();
		g.fillStyle = done ? '#fff' : C.muted;
		g.textAlign = 'center';
		g.fillText('↵', x0 + bw - 46, by + 42);
		g.textAlign = 'left';

		/* results */
		if (results > 0) {
			const ry = by + bh + 50;
			g.globalAlpha = ease(results * 2);
			g.fillStyle = C.muted;
			g.font = `500 14px ${BODY}`;
			g.letterSpacing = '2px';
			g.fillText(`BEST MATCHES · ${this.#data.results.length} COURSES`, x0, ry);
			g.letterSpacing = '0px';
			this.#data.results.forEach((r, i) => {
				const t = ease((results - i * 0.18) / 0.55);
				if (t <= 0) return;
				const y = ry + 30 + i * 112 + (1 - t) * 26;
				g.globalAlpha = t;
				if (i === 0) {
					g.fillStyle = C.green100;
					roundRect(g, x0 - 14, y - 12, bw + 28, 104, 16);
					g.fill();
				}
				const img = this.#thumbs[i];
				g.save();
				roundRect(g, x0, y, 128, 80, 10);
				g.clip();
				g.fillStyle = C.border;
				g.fillRect(x0, y, 128, 80);
				if (img?.complete && img.naturalWidth) g.drawImage(img, x0, y, 128, 80);
				g.restore();
				g.textBaseline = 'alphabetic';
				g.fillStyle = C.ink;
				g.font = `500 23px ${BODY}`;
				g.fillText(r.title, x0 + 154, y + 34);
				g.fillStyle = C.text2;
				g.font = `400 17px ${BODY}`;
				g.fillText(r.meta, x0 + 154, y + 64);
				if (i === 0) {
					g.fillStyle = C.ink;
					roundRect(g, x0 + bw - 150, y + 18, 150, 44, 22);
					g.fill();
					g.fillStyle = '#fff';
					g.font = `500 17px ${BODY}`;
					g.textBaseline = 'middle';
					g.fillText('Start course  →', x0 + bw - 130, y + 41);
				}
			});
			g.globalAlpha = 1;
		}
		return true;
	}
}

/* ── Handoff: repaint live DOM into the screen ───────────────────────── */

export interface HandoffFrame {
	/** texture size in pixels */
	texW: number;
	texH: number;
	/** stage-pixel position of the texture's top-left corner */
	originX: number;
	originY: number;
	/** texture pixels per stage pixel */
	k: number;
}

export interface HandoffOptions {
	stage: HTMLElement;
	/** the element that fades in over the screen (positioned by GSAP x/y/scale) */
	wrap: HTMLElement;
	/** the part of `wrap` that is visible at the handoff */
	content: HTMLElement;
	/** selector for descendants that are not visible yet at the handoff */
	skip: string;
	/** GSAP transform `wrap` has at the handoff */
	x: number;
	y: number;
	scale: number;
	/** the dot pattern the stage shows behind everything */
	grid?: { spacing: number; radius: number; color: string; cx: number; cy: number; inner: number; outer: number };
	frame: HandoffFrame;
}

function parseShadows(v: string) {
	if (!v || v === 'none') return [];
	const parts = v.split(/,(?![^(]*\))/);
	return parts
		.map((p) => {
			const color = p.match(/rgba?\([^)]*\)|#[0-9a-f]+/i)?.[0] ?? 'transparent';
			const nums = p
				.replace(color, '')
				.trim()
				.split(/\s+/)
				.filter((s) => s && s !== 'inset')
				.map(parseFloat);
			return { color, x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0, spread: nums[3] || 0, inset: p.includes('inset') };
		})
		.filter((s) => !s.inset);
}

const transparent = (c: string) => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c);

function radius(cs: CSSStyleDeclaration, w: number, h: number) {
	const r = cs.borderTopLeftRadius;
	if (r.endsWith('%')) return (Math.min(w, h) * parseFloat(r)) / 100;
	return parseFloat(r) || 0;
}

async function rasterSvg(svg: SVGSVGElement, w: number, h: number, color: string) {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	clone.setAttribute('width', String(w * 4));
	clone.setAttribute('height', String(h * 4));
	clone.setAttribute('style', `color:${color}`);
	const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		return img;
	} catch {
		return null;
	} finally {
		URL.revokeObjectURL(url);
	}
}

export async function paintHandoff(o: HandoffOptions): Promise<HTMLCanvasElement> {
	const { frame: f } = o;
	const canvas = document.createElement('canvas');
	canvas.width = f.texW;
	canvas.height = f.texH;
	const g = canvas.getContext('2d')!;

	// stage pixels → texture pixels
	const toStage = () => g.setTransform(f.k, 0, 0, f.k, -f.originX * f.k, -f.originY * f.k);
	toStage();

	const stageCs = getComputedStyle(o.stage);
	g.fillStyle = stageCs.backgroundColor;
	g.fillRect(f.originX, f.originY, f.texW / f.k, f.texH / f.k);

	const sw = o.stage.clientWidth;
	const sh = o.stage.clientHeight;

	/* the stage's dot grid (matches .gridlines: radial mask, farthest-corner ellipse) */
	if (o.grid) {
		const gr = o.grid;
		const dots = document.createElement('canvas');
		dots.width = f.texW;
		dots.height = f.texH;
		const d = dots.getContext('2d')!;
		d.setTransform(f.k, 0, 0, f.k, -f.originX * f.k, -f.originY * f.k);
		d.fillStyle = gr.color;
		const half = gr.spacing / 2;
		const x0 = Math.floor(f.originX / gr.spacing) * gr.spacing;
		const y0 = Math.floor(f.originY / gr.spacing) * gr.spacing;
		const x1 = f.originX + f.texW / f.k;
		const y1 = f.originY + f.texH / f.k;
		d.beginPath();
		for (let y = y0; y < y1; y += gr.spacing)
			for (let x = x0; x < x1; x += gr.spacing) {
				d.moveTo(x + half + gr.radius, y + half);
				d.arc(x + half, y + half, gr.radius, 0, Math.PI * 2);
			}
		d.fill();
		const cx = gr.cx * sw;
		const cy = gr.cy * sh;
		const rx0 = Math.min(cx, sw - cx);
		const ry0 = Math.min(cy, sh - cy);
		const fc = Math.hypot(Math.max(cx, sw - cx) / rx0, Math.max(cy, sh - cy) / ry0);
		d.globalCompositeOperation = 'destination-in';
		d.translate(cx, cy);
		d.scale(rx0 * fc, ry0 * fc);
		const grd = d.createRadialGradient(0, 0, 0, 0, 0, 1);
		grd.addColorStop(0, '#000');
		grd.addColorStop(gr.inner, '#000');
		grd.addColorStop(gr.outer, 'rgba(0,0,0,0)');
		grd.addColorStop(1, 'rgba(0,0,0,0)');
		d.fillStyle = grd;
		d.fillRect(-2, -2, 4, 4);
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.drawImage(dots, 0, 0);
		toStage();
	}

	/* measure the wrap's untransformed layout */
	const prev = o.wrap.style.transform;
	o.wrap.style.transform = 'none';
	const stageRect = o.stage.getBoundingClientRect();
	const wrapRect = o.wrap.getBoundingClientRect();
	const [ox, oy] = getComputedStyle(o.wrap).transformOrigin.split(' ').map(parseFloat);

	type Op = (g: CanvasRenderingContext2D) => void;
	const ops: Op[] = [];
	const pending: Promise<unknown>[] = [];
	const rel = (r: DOMRect) => ({ x: r.left - wrapRect.left, y: r.top - wrapRect.top, w: r.width, h: r.height });
	const total = f.k * o.scale; // device scale, for shadows (not affected by transforms)

	const walk = (el: Element) => {
		if (el.matches(o.skip)) return;
		const cs = getComputedStyle(el);
		if (cs.display === 'none' || cs.visibility === 'hidden') return;
		const r = rel(el.getBoundingClientRect());

		if (el instanceof SVGSVGElement) {
			const slot = { img: null as HTMLImageElement | null };
			pending.push(rasterSvg(el, r.w, r.h, cs.color).then((img) => (slot.img = img)));
			ops.push((g) => slot.img && g.drawImage(slot.img, r.x, r.y, r.w, r.h));
			return;
		}

		const rad = radius(cs, r.w, r.h);
		const bg = cs.backgroundColor;
		const shadows = parseShadows(cs.boxShadow);
		ops.push((g) => {
			for (const s of [...shadows].reverse()) {
				g.save();
				g.shadowColor = s.color;
				g.shadowBlur = s.blur * total;
				g.shadowOffsetX = (s.x + 10000) * total;
				g.shadowOffsetY = s.y * total;
				g.fillStyle = '#000';
				roundRect(g, r.x - s.spread - 10000, r.y - s.spread, r.w + s.spread * 2, r.h + s.spread * 2, rad + s.spread);
				g.fill();
				g.restore();
			}
			if (!transparent(bg)) {
				g.fillStyle = bg;
				roundRect(g, r.x, r.y, r.w, r.h, rad);
				g.fill();
			}
			const bw = parseFloat(cs.borderTopWidth);
			if (bw > 0 && cs.borderTopStyle !== 'none' && !transparent(cs.borderTopColor)) {
				g.lineWidth = bw;
				g.strokeStyle = cs.borderTopColor;
				roundRect(g, r.x + bw / 2, r.y + bw / 2, r.w - bw, r.h - bw, Math.max(0, rad - bw / 2));
				g.stroke();
			}
		});

		const clips = cs.overflow !== 'visible';
		if (clips)
			ops.push((g) => {
				g.save();
				roundRect(g, r.x, r.y, r.w, r.h, rad);
				g.clip();
			});

		for (const node of el.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				const raw = node.textContent ?? '';
				const start = raw.search(/\S/);
				if (start < 0) continue;
				const end = raw.trimEnd().length;
				const range = document.createRange();
				range.setStart(node, start);
				range.setEnd(node, end);
				const rr = range.getClientRects()[0];
				if (!rr) continue;
				const tr = rel(rr);
				let text = raw.slice(start, end).replace(/\s+/g, ' ');
				if (cs.textTransform === 'uppercase') text = text.toUpperCase();
				const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
				const ls = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
				const color = cs.color;
				ops.push((g) => {
					g.font = font;
					g.letterSpacing = ls;
					g.fillStyle = color;
					g.textBaseline = 'alphabetic';
					const m = g.measureText(text);
					const asc = m.fontBoundingBoxAscent;
					const y = tr.y + (tr.h - (asc + m.fontBoundingBoxDescent)) / 2 + asc;
					g.fillText(text, tr.x, y);
				});
			} else if (node instanceof Element) walk(node);
		}
		if (clips) ops.push((g) => g.restore());
	};
	walk(o.content);
	o.wrap.style.transform = prev;
	await Promise.all(pending);

	/* wrap-local → stage: p' = wrapPos + origin + T + S·(p − origin) */
	g.translate(wrapRect.left - stageRect.left + ox + o.x, wrapRect.top - stageRect.top + oy + o.y);
	g.scale(o.scale, o.scale);
	g.translate(-ox, -oy);
	for (const op of ops) op(g);
	g.letterSpacing = '0px';
	return canvas;
}
