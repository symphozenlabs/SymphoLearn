import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/** Registers GSAP plugins once, client-side only. */
export function useGsap() {
	if (!registered && typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
		// mobile browser bars show/hide while scrolling; re-measuring then made pinned
		// sections (and everything below them) jump
		ScrollTrigger.config({ ignoreMobileResize: true });
		gsap.defaults({ ease: 'expo.out', duration: 0.9 });
		registered = true;
	}
	return { gsap, ScrollTrigger };
}

export function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Brand ease — cubic-bezier(.22, 1, .36, 1) — closest GSAP equivalent */
export const EASE = 'expo.out';
