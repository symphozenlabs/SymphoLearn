import type { Action } from 'svelte/action';
import { prefersReducedMotion, useGsap } from './gsap';

/**
 * Reveals `[data-reveal]` descendants (or the node itself) as they enter the
 * viewport: a short rise + fade, staggered by `data-reveal-delay` (seconds).
 *
 * Each element is owned by exactly one `reveal` (nested ones skip what an outer
 * one already watches) and is marked `data-revealed` when it starts, which
 * switches off the hidden starting state in app.css — so finishing the tween
 * can never drop the element back to its offset.
 */
export const reveal: Action<HTMLElement, { stagger?: number } | undefined> = (node, opts) => {
	const { gsap } = useGsap();
	const reduced = prefersReducedMotion();
	const collect = () =>
		(node.hasAttribute('data-reveal') ? [node] : Array.from(node.querySelectorAll<HTMLElement>('[data-reveal]'))).filter(
			(el) => !el.hasAttribute('data-reveal-watched')
		);

	const io = new IntersectionObserver(
		(entries) => {
			const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
			visible.forEach((el, i) => {
				io.unobserve(el);
				// stagger, but never leave a visible card waiting long in its offset
				const delay = Math.min(0.24, Number(el.dataset.revealDelay ?? 0) + i * (opts?.stagger ?? 0.06));
				el.setAttribute('data-revealed', '');
				gsap.fromTo(
					el,
					{ opacity: 0, y: reduced ? 0 : 14 },
					{
						opacity: 1,
						y: 0,
						duration: reduced ? 0.4 : 0.8,
						delay: reduced ? 0 : delay,
						ease: 'expo.out',
						overwrite: 'auto',
						clearProps: 'opacity,transform'
					}
				);
			});
		},
		// start well before entering, so the rise is mostly done by the time it's seen
		{ rootMargin: '0px 0px 22% 0px', threshold: 0 }
	);
	const watch = () =>
		collect().forEach((t) => {
			t.setAttribute('data-reveal-watched', '');
			io.observe(t);
		});
	watch();

	// Keyed lists (filters, search) add new [data-reveal] children later
	const mo = new MutationObserver(watch);
	mo.observe(node, { childList: true, subtree: true });

	return {
		destroy() {
			io.disconnect();
			mo.disconnect();
		}
	};
};

/** Gently pulls an element toward the pointer (buttons, play affordances). */
export const magnetic: Action<HTMLElement, number | undefined> = (node, strength = 0.25) => {
	if (prefersReducedMotion() || !window.matchMedia('(hover: hover)').matches) return;
	const { gsap } = useGsap();
	const xTo = gsap.quickTo(node, 'x', { duration: 0.6, ease: 'expo.out' });
	const yTo = gsap.quickTo(node, 'y', { duration: 0.6, ease: 'expo.out' });

	const move = (e: PointerEvent) => {
		const r = node.getBoundingClientRect();
		xTo((e.clientX - (r.left + r.width / 2)) * strength);
		yTo((e.clientY - (r.top + r.height / 2)) * strength);
	};
	const leave = () => {
		xTo(0);
		yTo(0);
	};
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
};

/** Animates a number from 0 → target when scrolled into view. */
export const countUp: Action<HTMLElement, { to: number; pad?: number; duration?: number }> = (node, params) => {
	const { gsap } = useGsap();
	const state = { v: 0 };
	const render = () => (node.textContent = String(Math.round(state.v)).padStart(params.pad ?? 2, '0'));
	render();
	const io = new IntersectionObserver(([e]) => {
		if (!e.isIntersecting) return;
		io.disconnect();
		gsap.to(state, {
			v: params.to,
			duration: prefersReducedMotion() ? 0 : (params.duration ?? 1.6),
			ease: 'power3.out',
			onUpdate: render
		});
	});
	io.observe(node);
	return { destroy: () => io.disconnect() };
};
