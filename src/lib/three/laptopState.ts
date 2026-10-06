/** The animatable state of the hero laptop — kept apart from three.js so the page can tween it before the scene loads. */

export interface LaptopState {
	/** 0 = lid closed, 1 = fully open */
	open: number;
	/** laptop turntable angle (radians) */
	yaw: number;
	/** camera elevation (radians) */
	pitch: number;
	/** camera distance multiplier (1 = framing distance, <1 = push in) */
	dolly: number;
	/** 0..1 — the camera flies head-on into the screen until it fills the stage */
	focus: number;
	/** vertical lift of the whole laptop (intro) */
	lift: number;
	/** extra vertical framing offset (fraction of height, - = up) */
	offsetY: number;
	/** 0..1 — the screen crossfades from the search page to the course window */
	ui: number;
	/** 0..1 — gentle floating while the story waits for the first scroll */
	idle: number;
}

export const initialLaptopState = (): LaptopState => ({
	open: 0,
	yaw: -0.62,
	pitch: 0.42,
	dolly: 1,
	focus: 0,
	lift: 0.35,
	offsetY: 0,
	ui: 0,
	idle: 1
});

/** where the load intro leaves the laptop — the scroll timeline starts here */
export const restingLaptopState = { open: 0.84, yaw: -0.36, pitch: 0.3, lift: 0 };
