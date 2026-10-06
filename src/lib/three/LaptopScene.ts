/**
 * LaptopScene — a procedurally modelled, physically lit laptop for the hero.
 *
 * Everything is driven by a plain `LaptopState` object that GSAP animates
 * (an intro on load, then scroll); the scene only re-renders when that state,
 * the pointer, the idle float or the screen UI changes (render-on-demand).
 *
 * The screen tells the first beats of the story itself: a question is typed
 * into SymphoLearn, the courses that answer it appear, and as the camera flies
 * into the screen it crossfades to a pixel-matched paint of the real course
 * window (see `paintHandoff`), so the page can take over without a cut.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { QuestionScreen, type HandoffFrame, type QuestionScreenData } from './screenUi';
import { initialLaptopState, type LaptopState } from './laptopState';

export type { LaptopState };

const W = 3.0; // base width
const D = 2.05; // base depth
const H = 0.085; // base height
const LID_T = 0.05; // lid thickness
const LID_D = 1.98; // lid depth (screen height when open)
const SW = 2.86; // display width
const SH = 1.8; // display height
const SCREEN_Z = 0.12 + SH / 2; // display centre, measured from the hinge
const MAX_ANGLE = THREE.MathUtils.degToRad(108);
const MIN_ANGLE = THREE.MathUtils.degToRad(0.6);

/* keyboard */
const P = 0.163; // key pitch
const GAP = 0.02;
const KW = 14.5 * P;
const KD = 5.55 * P;
const KZ = -0.88; // back edge of the keyboard

type Key = { w: number; l: string; h?: number; dy?: number; adv?: number };
const k = (labels: string, w = 1): Key[] => [...labels].map((l) => ({ w, l }));
const ROWS: { h: number; keys: Key[] }[] = [
	{
		h: 0.55,
		keys: [{ w: 1.5, l: 'esc' }, ...Array.from({ length: 12 }, (_, i) => ({ w: 1, l: `F${i + 1}` })), { w: 1, l: '' }]
	},
	{ h: 1, keys: [...k('`1234567890-='), { w: 1.5, l: 'delete' }] },
	{ h: 1, keys: [{ w: 1.5, l: 'tab' }, ...k('QWERTYUIOP[]'), { w: 1, l: '\\' }] },
	{ h: 1, keys: [{ w: 1.75, l: 'caps lock' }, ...k("ASDFGHJKL;'"), { w: 1.75, l: 'return' }] },
	{ h: 1, keys: [{ w: 2.25, l: 'shift' }, ...k('ZXCVBNM,./'), { w: 2.25, l: 'shift' }] },
	{
		h: 1,
		keys: [
			{ w: 1, l: 'fn' },
			{ w: 1, l: 'control' },
			{ w: 1, l: 'option' },
			{ w: 1.25, l: 'command' },
			{ w: 5, l: '' },
			{ w: 1.25, l: 'command' },
			{ w: 1, l: 'option' },
			{ w: 1, l: '◀', h: 0.5, dy: 0.5 },
			{ w: 1, l: '▲', h: 0.5, adv: 0 },
			{ w: 1, l: '▼', h: 0.5, dy: 0.5 },
			{ w: 1, l: '▶', h: 0.5, dy: 0.5 }
		]
	}
];

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	draw(c.getContext('2d')!);
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

function radialTexture(inner: string, outer: string, size = 256) {
	return canvasTexture(size, size, (g) => {
		const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		grd.addColorStop(0, inner);
		grd.addColorStop(1, outer);
		g.fillStyle = grd;
		g.fillRect(0, 0, size, size);
	});
}

/** The SymphoLearn lotus (the official mark), etched into the lid — drawn once the SVG loads. */
function lotusTexture(onReady: () => void) {
	const tex = canvasTexture(512, 512, () => {});
	const img = new Image();
	img.onload = () => {
		const g = (tex.image as HTMLCanvasElement).getContext('2d')!;
		const w = 400, h = (w * 216) / 239;
		g.clearRect(0, 0, 512, 512);
		g.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h);
		tex.needsUpdate = true;
		onReady();
	};
	img.src = '/brand/sympholearn-mark-light.svg';
	return tex;
}

function roundedRectShape(w: number, h: number, r: number) {
	const s = new THREE.Shape();
	const x = -w / 2;
	const y = -h / 2;
	r = Math.min(r, w / 2, h / 2);
	s.moveTo(x + r, y);
	s.lineTo(x + w - r, y);
	s.quadraticCurveTo(x + w, y, x + w, y + r);
	s.lineTo(x + w, y + h - r);
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	s.lineTo(x + r, y + h);
	s.quadraticCurveTo(x, y + h, x, y + h - r);
	s.lineTo(x, y + r);
	s.quadraticCurveTo(x, y, x + r, y);
	return s;
}

/** A thin rounded slab lying flat (x × z), its top at y = 0. */
function slab(w: number, d: number, r: number, depth: number, bevel: number) {
	const g = new THREE.ExtrudeGeometry(roundedRectShape(w - bevel * 2, d - bevel * 2, r), {
		depth,
		bevelEnabled: bevel > 0,
		bevelThickness: bevel,
		bevelSize: bevel,
		bevelSegments: 2,
		curveSegments: 4
	});
	g.rotateX(-Math.PI / 2);
	g.translate(0, -depth - bevel, 0);
	return g;
}

export interface LaptopLayout {
	/** horizontal offset of the laptop as a fraction of the canvas width (+ = right) */
	shiftX: number;
	/** vertical offset as a fraction of the canvas height (+ = down) */
	shiftY: number;
	/** share of the canvas width the laptop should occupy */
	widthFraction: number;
}

export class LaptopScene {
	readonly state: LaptopState;

	#renderer: THREE.WebGLRenderer;
	#scene = new THREE.Scene();
	#camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
	#root = new THREE.Group();
	#laptop = new THREE.Group();
	#lid = new THREE.Group();
	#screen: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
	#handoff: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
	#glass: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
	#glow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
	#contact: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
	#question: QuestionScreen;
	#questionTex: THREE.CanvasTexture;
	#typeTimes: number[];
	#qStart: number | null = null;
	#handoffReady = false;
	#warm = false;
	#raf = 0;
	#dirty = true;
	#pointer = { x: 0, y: 0, tx: 0, ty: 0 };
	#layout: LaptopLayout = { shiftX: 0.22, shiftY: 0, widthFraction: 0.36 };
	#size = { w: 1, h: 1 };
	#visible = true;
	#canvas: HTMLCanvasElement;
	#v = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3() };

	constructor(canvas: HTMLCanvasElement, opts: { screen: QuestionScreenData; state?: LaptopState }) {
		this.#canvas = canvas;
		this.state = opts.state ?? initialLaptopState();
		const r = (this.#renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }));
		r.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
		r.toneMapping = THREE.ACESFilmicToneMapping;
		r.toneMappingExposure = 1.0;
		r.outputColorSpace = THREE.SRGBColorSpace;
		r.shadowMap.enabled = true;
		r.shadowMap.type = THREE.PCFShadowMap;

		// Studio reflections — what makes the aluminium read as real metal
		const pmrem = new THREE.PMREMGenerator(r);
		this.#scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		this.#scene.environmentIntensity = 0.9;
		pmrem.dispose();

		const key = new THREE.DirectionalLight(0xfffaf2, 1.6);
		key.position.set(-2.5, 7, 3.5);
		key.castShadow = true;
		key.shadow.mapSize.set(2048, 2048);
		key.shadow.radius = 6;
		key.shadow.bias = -0.0004;
		Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 20 });
		this.#scene.add(key);
		const rim = new THREE.DirectionalLight(0xe4efdf, 1.1);
		rim.position.set(4, 3, -5);
		this.#scene.add(rim);

		/* ── Materials ─────────────────────────────────── */
		// space grey, bead-blasted
		const aluminium = new THREE.MeshPhysicalMaterial({
			color: 0x8a8d88,
			metalness: 1,
			roughness: 0.36,
			clearcoat: 0.15,
			clearcoatRoughness: 0.5
		});
		const darkAlu = new THREE.MeshStandardMaterial({ color: 0x3a3c39, metalness: 1, roughness: 0.5 });
		const keyMat = new THREE.MeshStandardMaterial({ color: 0x141514, roughness: 0.55, metalness: 0.05 });
		const wellMat = new THREE.MeshBasicMaterial({ color: 0x0a0b0a });
		const padMat = new THREE.MeshPhysicalMaterial({ color: 0x7c7f7a, metalness: 0.85, roughness: 0.2, clearcoat: 0.6 });
		const bezelMat = new THREE.MeshPhysicalMaterial({ color: 0x050605, roughness: 0.12, metalness: 0, clearcoat: 1 });

		/* ── Base ──────────────────────────────────────── */
		const base = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 6, 0.042), aluminium);
		base.position.y = H / 2;
		base.castShadow = true;
		this.#laptop.add(base);

		// keyboard well, keycaps and their legends
		const well = new THREE.Mesh(new THREE.PlaneGeometry(KW + 0.03, KD + 0.03), wellMat);
		well.rotation.x = -Math.PI / 2;
		well.position.set(0, H + 0.0008, KZ + KD / 2);
		this.#laptop.add(well);

		const keyGeos: THREE.BufferGeometry[] = [];
		const legends: { x: number; z: number; w: number; d: number; l: string }[] = [];
		let z = KZ;
		for (const row of ROWS) {
			let x = -KW / 2;
			for (const key of row.keys) {
				const kh = (key.h ?? 1) * row.h;
				const kw = key.w * P - GAP;
				const kd = kh * P - GAP;
				const cx = x + (key.w * P) / 2;
				const cz = z + ((key.dy ?? 0) * row.h + kh / 2) * P;
				const g = slab(kw, kd, 0.022, 0.006, 0.004);
				g.translate(cx, H + 0.012, cz);
				keyGeos.push(g);
				if (key.l) legends.push({ x: cx, z: cz, w: kw, d: kd, l: key.l });
				x += (key.adv ?? key.w) * P;
			}
			z += row.h * P;
		}
		const keys = new THREE.Mesh(mergeGeometries(keyGeos), keyMat);
		keys.castShadow = true;
		this.#laptop.add(keys);
		keyGeos.forEach((g) => g.dispose());

		const LW = 2048;
		const LH = Math.round((LW * KD) / KW);
		const legendTex = canvasTexture(LW, LH, (g) => {
			const s = LW / KW;
			g.fillStyle = 'rgba(236,238,233,0.82)';
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			for (const k of legends) {
				const px = (k.x + KW / 2) * s;
				const pz = (k.z - KZ) * s;
				if (k.l.length === 1) {
					g.font = `500 ${Math.round(k.d * s * 0.34)}px Inter, system-ui, sans-serif`;
					g.fillText(k.l, px, pz);
				} else {
					g.font = `400 ${Math.round(Math.min(k.d, P - GAP) * s * 0.16)}px Inter, system-ui, sans-serif`;
					const right = k.x > 0.2 && !k.l.startsWith('F');
					g.textAlign = k.l.startsWith('F') || k.l === 'esc' ? 'center' : right ? 'right' : 'left';
					const ix = g.textAlign === 'center' ? px : right ? px + k.w * s * 0.4 : px - k.w * s * 0.4;
					const iz = k.d < P * 0.7 ? pz : pz + k.d * s * 0.27;
					g.fillText(k.l, ix, iz);
					g.textAlign = 'center';
				}
			}
		});
		legendTex.anisotropy = r.capabilities.getMaxAnisotropy();
		const legend = new THREE.Mesh(
			new THREE.PlaneGeometry(KW, KD),
			new THREE.MeshStandardMaterial({ map: legendTex, transparent: true, roughness: 0.6, depthWrite: false })
		);
		legend.rotation.x = -Math.PI / 2;
		legend.position.set(0, H + 0.0125, KZ + KD / 2);
		this.#laptop.add(legend);

		// speaker grilles either side of the keys
		const grilleTex = canvasTexture(128, 512, (g) => {
			g.fillStyle = 'rgba(8,9,8,0.9)';
			for (let y = 6; y < 512; y += 9)
				for (let x = 6 + ((y / 9) % 2) * 4.5; x < 128; x += 9) {
					g.beginPath();
					g.arc(x, y, 2.3, 0, Math.PI * 2);
					g.fill();
				}
		});
		for (const side of [-1, 1]) {
			const grille = new THREE.Mesh(
				new THREE.PlaneGeometry(0.17, KD),
				new THREE.MeshBasicMaterial({ map: grilleTex, transparent: true, depthWrite: false })
			);
			grille.rotation.x = -Math.PI / 2;
			grille.position.set(side * (KW / 2 + 0.135), H + 0.0008, KZ + KD / 2);
			this.#laptop.add(grille);
		}

		const pad = new THREE.Mesh(slab(1.4, 0.86, 0.05, 0.0015, 0.0015), padMat);
		pad.position.set(0, H + 0.0016, 0.57);
		this.#laptop.add(pad);

		// light leaking from the gap while the lid is nearly closed
		this.#glow = new THREE.Mesh(
			new THREE.PlaneGeometry(3.8, 2.8),
			new THREE.MeshBasicMaterial({
				map: radialTexture('rgba(184,206,169,0.95)', 'rgba(184,206,169,0)'),
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				toneMapped: false
			})
		);
		this.#glow.rotation.x = -Math.PI / 2;
		this.#glow.position.set(0, H + 0.004, 0.1);
		this.#laptop.add(this.#glow);

		/* ── Lid ───────────────────────────────────────── */
		this.#lid.position.set(0, H, -D / 2 + 0.03);
		const lidShell = new THREE.Mesh(new RoundedBoxGeometry(W, LID_T, LID_D, 6, 0.024), aluminium);
		lidShell.position.set(0, LID_T / 2, LID_D / 2);
		lidShell.castShadow = true;
		this.#lid.add(lidShell);

		const bezel = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(W - 0.024, LID_D - 0.024, 0.07), 6), bezelMat);
		bezel.rotation.x = Math.PI / 2;
		bezel.position.set(0, -0.0012, LID_D / 2);
		this.#lid.add(bezel);

		const cam = new THREE.Mesh(new THREE.CircleGeometry(0.011, 20), new THREE.MeshBasicMaterial({ color: 0x1d2a33 }));
		cam.rotation.x = Math.PI / 2;
		cam.position.set(0, -0.0016, LID_D - 0.032);
		this.#lid.add(cam);

		// the display: the search page, then the course window it hands over to
		const qAspect = SW / SH;
		this.#question = new QuestionScreen(opts.screen, 1600, qAspect);
		this.#question.onAsset = () => this.#redrawQuestion();
		this.#questionTex = new THREE.CanvasTexture(this.#question.canvas);
		this.#questionTex.colorSpace = THREE.SRGBColorSpace;
		this.#questionTex.anisotropy = r.capabilities.getMaxAnisotropy();
		this.#screen = new THREE.Mesh(
			new THREE.PlaneGeometry(SW, SH),
			new THREE.MeshBasicMaterial({ map: this.#questionTex, toneMapped: false })
		);
		this.#screen.rotation.x = Math.PI / 2;
		this.#screen.position.set(0, -0.0024, SCREEN_Z);
		this.#lid.add(this.#screen);

		this.#handoff = new THREE.Mesh(
			new THREE.PlaneGeometry(SW, SH),
			new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0, depthWrite: false, depthTest: false })
		);
		this.#handoff.position.z = 0.0004;
		this.#handoff.renderOrder = 1;
		this.#screen.add(this.#handoff);

		// glass: only adds reflections (additive), fades out before the handoff
		this.#glass = new THREE.Mesh(
			new THREE.PlaneGeometry(W - 0.03, LID_D - 0.03),
			new THREE.MeshPhysicalMaterial({
				color: 0x000000,
				roughness: 0.05,
				metalness: 0,
				clearcoat: 1,
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				envMapIntensity: 1
			})
		);
		this.#glass.position.set(0, LID_D / 2 - SCREEN_Z, 0.0012);
		this.#glass.renderOrder = 2;
		this.#screen.add(this.#glass);

		const logo = new THREE.Mesh(
			new THREE.PlaneGeometry(0.5, 0.5),
			new THREE.MeshPhysicalMaterial({ map: lotusTexture(() => this.invalidate()), transparent: true, metalness: 1, roughness: 0.08, color: 0xffffff })
		);
		logo.rotation.x = -Math.PI / 2;
		logo.position.set(0, LID_T + 0.0015, LID_D / 2);
		this.#lid.add(logo);

		const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, W - 0.64, 32), darkAlu);
		hinge.rotation.z = Math.PI / 2;
		hinge.position.set(0, 0.006, 0.01);
		this.#lid.add(hinge);

		this.#laptop.add(this.#lid);

		/* ── Ground: soft cast shadow + contact occlusion ── */
		const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: 0.1 }));
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		this.#scene.add(ground);

		this.#contact = new THREE.Mesh(
			new THREE.PlaneGeometry(4.3, 3.2),
			new THREE.MeshBasicMaterial({
				map: radialTexture('rgba(23,25,22,0.6)', 'rgba(23,25,22,0)'),
				transparent: true,
				depthWrite: false
			})
		);
		this.#contact.rotation.x = -Math.PI / 2;
		this.#contact.position.y = 0.001;
		this.#scene.add(this.#contact);

		this.#root.add(this.#laptop);
		this.#scene.add(this.#root);

		// per-character typing rhythm — slower after spaces, a little uneven
		let t = 0;
		this.#typeTimes = [...opts.screen.question].map((ch, i) => {
			t += 52 + Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1) * 48 + (ch === ' ' ? 45 : 0);
			return t;
		});
		this.#redrawQuestion();

		this.#raf = requestAnimationFrame(this.#loop);
	}

	/** Compiles every shader up front, so the intro never stalls on its first frame. */
	async warm() {
		try {
			await this.#renderer.compileAsync(this.#scene, this.#camera);
		} finally {
			this.#warm = true;
			this.#dirty = true;
		}
	}

	/** Starts typing the question on the screen after `delay` ms. */
	playQuestion(delay = 0) {
		this.#qStart = performance.now() + delay;
	}

	/** Skips straight to the answered question (e.g. when the visitor scrolls early). */
	finishQuestion() {
		if (this.#qStart === null || performance.now() - this.#qStart < this.#typeEnd + 1300)
			this.#qStart = performance.now() - this.#typeEnd - 1300;
	}

	get #typeEnd() {
		return this.#typeTimes[this.#typeTimes.length - 1] ?? 0;
	}

	#redrawQuestion() {
		const now = performance.now();
		const el = this.#qStart === null ? -1 : now - this.#qStart;
		let typed = 0;
		while (typed < this.#typeTimes.length && el >= this.#typeTimes[typed]) typed++;
		const typing = el >= 0 && typed < this.#typeTimes.length;
		const results = THREE.MathUtils.clamp((el - this.#typeEnd - 380) / 900, 0, 1);
		const caret = typing || Math.floor(now / 530) % 2 === 0;
		if (this.#question.draw(typed, results, caret)) {
			this.#questionTex.needsUpdate = true;
			this.#dirty = true;
		}
	}

	setLayout(layout: Partial<LaptopLayout>) {
		Object.assign(this.#layout, layout);
		this.resize(this.#size.w, this.#size.h);
	}

	resize(w: number, h: number) {
		this.#size = { w, h };
		this.#renderer.setSize(w, h, false);
		this.#camera.aspect = w / h;
		this.#camera.updateProjectionMatrix();
		this.invalidate();
	}

	/** Pointer in -1..1 — the laptop leans gently toward it. */
	pointer(x: number, y: number) {
		this.#pointer.tx = x;
		this.#pointer.ty = y;
		this.invalidate();
	}

	setVisible(v: boolean) {
		this.#visible = v;
		this.invalidate();
	}

	invalidate() {
		this.#dirty = true;
	}

	#fillDistance() {
		const tan = Math.tan(THREE.MathUtils.degToRad(this.#camera.fov / 2));
		// close enough that the display covers the whole stage
		return 0.965 * Math.min(SH / (2 * tan), SW / (2 * tan * this.#camera.aspect));
	}

	/**
	 * Where the display lands once `focus` reaches 1: it fills the stage
	 * head-on, so stage pixels map affinely onto the screen texture.
	 */
	handoffFrame(): HandoffFrame {
		const { w, h } = this.#size;
		const tan = Math.tan(THREE.MathUtils.degToRad(this.#camera.fov / 2));
		const pxPerUnit = h / (2 * tan * this.#fillDistance());
		const spw = SW * pxPerUnit;
		const sph = SH * pxPerUnit;
		const texW = THREE.MathUtils.clamp(Math.round(spw * this.#renderer.getPixelRatio()), 1024, 4096);
		return {
			texW,
			texH: Math.round((texW * SH) / SW),
			originX: w / 2 - spw / 2,
			originY: h / 2 - sph / 2,
			k: texW / spw
		};
	}

	/** Paints of the course window, made for the current `handoffFrame()`. */
	setHandoff(canvas: HTMLCanvasElement) {
		const old = this.#handoff.material.map;
		const tex = new THREE.CanvasTexture(canvas);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.generateMipmaps = false;
		tex.minFilter = THREE.LinearFilter;
		this.#handoff.material.map = tex;
		this.#handoff.material.needsUpdate = true;
		old?.dispose();
		this.#handoffReady = true;
		this.invalidate();
	}

	#framingDistance() {
		const tan = Math.tan(THREE.MathUtils.degToRad(this.#camera.fov / 2));
		const visW = 3.5 / this.#layout.widthFraction;
		const byWidth = visW / (2 * tan * this.#camera.aspect);
		const byHeight = 2.6 / (0.62 * 2 * tan);
		return Math.max(byWidth, byHeight);
	}

	#loop = (now: number) => {
		this.#raf = requestAnimationFrame(this.#loop);
		if (!this.#visible || !this.#warm) return;
		const p = this.#pointer;
		const moving = Math.abs(p.tx - p.x) > 0.001 || Math.abs(p.ty - p.y) > 0.001;
		if (moving) {
			p.x += (p.tx - p.x) * 0.06;
			p.y += (p.ty - p.y) * 0.06;
		}
		if (this.state.ui < 1) this.#redrawQuestion();
		const floating = this.state.idle > 0.001;
		if (!this.#dirty && !moving && !floating) return;
		this.#dirty = false;
		this.#render(now / 1000);
	};

	#render(time: number) {
		const s = this.state;
		const { a: centre, b: normal, c: orbit, d: target } = this.#v;
		const f = THREE.MathUtils.clamp(s.focus, 0, 1);
		const free = 1 - f;
		const open = THREE.MathUtils.clamp(s.open, 0, 1);
		const idle = THREE.MathUtils.clamp(s.idle, 0, 1);

		this.#lid.rotation.x = -(MIN_ANGLE + (MAX_ANGLE - MIN_ANGLE) * open);
		this.#laptop.rotation.y = s.yaw + this.#pointer.x * 0.14 * free;
		this.#laptop.rotation.z = Math.sin(time * 0.7) * 0.01 * idle;
		const float = (Math.sin(time * 1.1) * 0.5 + 0.5) * 0.07 * idle;
		this.#root.position.y = s.lift + float;

		// the glow leaks out of the gap, then fades as the screen takes over
		this.#glow.material.opacity = 0.7 * Math.max(0, 1 - open * 2.4);
		const air = s.lift + float;
		this.#contact.material.opacity = THREE.MathUtils.clamp(0.95 - air * 2.2, 0.2, 0.95);
		this.#contact.scale.setScalar(1 + air * 0.6);

		// the display wakes as the lid opens
		const lum = THREE.MathUtils.smoothstep(open, 0.12, 0.55);
		this.#screen.material.color.setScalar(0.04 + 0.96 * lum);
		this.#handoff.material.opacity = this.#handoffReady ? THREE.MathUtils.clamp(s.ui, 0, 1) : 0;
		this.#glass.material.opacity = 0.3 * free * free * free;

		// camera: framed orbit → head-on, stage-filling view of the display
		const { w, h } = this.#size;
		this.#camera.setViewOffset(
			w,
			h,
			-w * this.#layout.shiftX * free,
			-h * (this.#layout.shiftY + s.offsetY) * free,
			w,
			h
		);
		this.#camera.updateProjectionMatrix();

		this.#root.updateMatrixWorld(true);
		this.#screen.getWorldPosition(centre);
		normal.set(0, 0, 1).transformDirection(this.#screen.matrixWorld);

		const pitch = s.pitch + this.#pointer.y * 0.05 * free;
		const dist = this.#framingDistance() * s.dolly;
		target.set(0, 0.62 + s.lift + float, 0);
		orbit.set(0, Math.sin(pitch) * dist, Math.cos(pitch) * dist).add(target);

		target.lerp(centre, f);
		this.#camera.position.copy(orbit.lerp(centre.addScaledVector(normal, this.#fillDistance()), f));
		this.#camera.lookAt(target);

		this.#renderer.render(this.#scene, this.#camera);
		if (this.#canvas.dataset.ready !== '1') this.#canvas.dataset.ready = '1';
	}

	dispose() {
		cancelAnimationFrame(this.#raf);
		this.#scene.traverse((o) => {
			const mesh = o as THREE.Mesh;
			mesh.geometry?.dispose();
			const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
			(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => {
				(m as THREE.MeshBasicMaterial).map?.dispose();
				m.dispose();
			});
		});
		this.#scene.environment?.dispose();
		this.#renderer.dispose();
	}
}
