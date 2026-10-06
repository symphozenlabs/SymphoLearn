<!--
	VideoPlayer — a real HTML5 <video> with custom, accessible controls.

	Point `src` at any MP4 under /static (e.g. /videos/welcome.mp4). If the file
	is missing, the player shows where to drop it instead of breaking.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		Play,
		Pause,
		Volume2,
		Volume1,
		VolumeX,
		Maximize,
		Minimize,
		RotateCcw,
		RotateCw,
		FileVideo
	} from '@lucide/svelte';
	import { formatClock } from '$lib/utils/course';

	interface Props {
		src: string;
		poster?: string;
		title: string;
		/** Resume position in seconds */
		startAt?: number;
		autoplay?: boolean;
		compact?: boolean;
		ontime?: (position: number, duration: number) => void;
		onended?: () => void;
	}

	let { src, poster, title, startAt = 0, autoplay = false, compact = false, ontime, onended }: Props = $props();

	let video = $state<HTMLVideoElement>();
	let shell = $state<HTMLElement>();

	let paused = $state(true);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(0.85);
	let muted = $state(false);
	let playbackRate = $state(1);
	let buffered = $state<{ start: number; end: number }[]>([]);
	let readyState = $state(0);
	let failed = $state(false);
	let started = $state(false);
	let waiting = $state(false);
	let fullscreen = $state(false);
	let idle = $state(false);
	let speedOpen = $state(false);
	let seeking = $state(false);

	const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

	const pct = $derived(duration ? (currentTime / duration) * 100 : 0);
	const bufferedPct = $derived(duration && buffered.length ? (buffered[buffered.length - 1].end / duration) * 100 : 0);

	// Reset when the lesson (src) changes
	let lastSrc = '';
	$effect(() => {
		if (src !== lastSrc) {
			lastSrc = src;
			failed = false;
			started = false;
			currentTime = 0;
			duration = 0;
		}
	});

	function onloadedmetadata() {
		if (video && startAt > 1 && startAt < video.duration - 2) video.currentTime = startAt;
		if (autoplay) play();
	}

	async function play() {
		try {
			await video?.play();
			started = true;
		} catch {
			/* autoplay blocked — user can press play */
		}
	}

	function toggle() {
		if (failed) return;
		if (paused) play();
		else video?.pause();
		speedOpen = false;
	}

	function seekBy(delta: number) {
		if (!video || !duration) return;
		video.currentTime = Math.max(0, Math.min(duration, video.currentTime + delta));
		wake();
	}

	function setVolume(v: number) {
		volume = Math.max(0, Math.min(1, v));
		muted = volume === 0;
	}

	async function toggleFullscreen() {
		if (!shell) return;
		if (document.fullscreenElement) await document.exitFullscreen();
		else await shell.requestFullscreen?.();
	}

	// Controls fade out while playing and the pointer is still
	let idleTimer: ReturnType<typeof setTimeout> | undefined;
	function wake() {
		idle = false;
		clearTimeout(idleTimer);
		idleTimer = setTimeout(() => {
			if (!paused && !speedOpen && !seeking) idle = true;
		}, 2600);
	}
	onDestroy(() => clearTimeout(idleTimer));

	function onkeydown(e: KeyboardEvent) {
		if ((e.target as HTMLElement).closest('input[type="range"]') && ['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
		const k = e.key.toLowerCase();
		const handled = true;
		if (k === ' ' || k === 'k') toggle();
		else if (k === 'arrowleft' || k === 'j') seekBy(k === 'j' ? -10 : -5);
		else if (k === 'arrowright' || k === 'l') seekBy(k === 'l' ? 10 : 5);
		else if (k === 'arrowup') setVolume(volume + 0.1);
		else if (k === 'arrowdown') setVolume(volume - 0.1);
		else if (k === 'm') muted = !muted;
		else if (k === 'f') toggleFullscreen();
		else if (/^[0-9]$/.test(k) && duration && video) video.currentTime = (duration * Number(k)) / 10;
		else return;
		if (handled) e.preventDefault();
		wake();
	}

	function ontimeupdate() {
		ontime?.(currentTime, duration);
	}
</script>

<svelte:document onfullscreenchange={() => (fullscreen = document.fullscreenElement === shell)} />

<!-- focusable region that owns the player's keyboard shortcuts -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	class="player"
	class:compact
	class:idle={idle && !paused}
	class:fullscreen
	bind:this={shell}
	onpointermove={wake}
	onpointerleave={() => !paused && (idle = true)}
	{onkeydown}
	tabindex="0"
	role="region"
	aria-label="Video player: {title}"
>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={video}
		{src}
		{poster}
		preload="metadata"
		playsinline
		aria-label={title}
		bind:paused
		bind:currentTime
		bind:duration
		bind:volume
		bind:muted
		bind:playbackRate
		bind:buffered
		bind:readyState
		{onloadedmetadata}
		{ontimeupdate}
		onplay={() => {
			started = true;
			wake();
		}}
		onpause={() => (idle = false)}
		onwaiting={() => (waiting = true)}
		onplaying={() => (waiting = false)}
		oncanplay={() => (waiting = false)}
		onended={() => {
			idle = false;
			onended?.();
		}}
		onerror={() => (failed = true)}
		onclick={toggle}
	></video>

	{#if failed}
		<div class="missing">
			<FileVideo size={28} strokeWidth={1.25} />
			<p class="m-title">This lesson’s video hasn’t been published yet.</p>
			<p class="m-body">
				Drop the file at <code>static{src}</code> and it will play here — no code changes needed.
			</p>
		</div>
	{:else}
		<!-- Large play affordance before first play / while paused -->
		<button
			class="overlay"
			class:hidden={!paused}
			class:intro={!started}
			onclick={toggle}
			aria-label={paused ? `Play ${title}` : 'Pause'}
			tabindex={paused ? 0 : -1}
		>
			<span class="big">
				<Play size={compact ? 20 : 26} strokeWidth={0} fill="currentColor" />
			</span>
			{#if !started && !compact}
				<span class="intro-meta">
					<span class="t-label">Now playing</span>
					<span class="intro-title">{title}</span>
				</span>
			{/if}
		</button>

		{#if waiting && !paused}
			<div class="spinner" aria-hidden="true"></div>
		{/if}

		<div class="controls" class:show={started}>
			<div class="scrub">
				<div class="rail">
					<span class="buf" style="transform: scaleX({bufferedPct / 100})"></span>
					<span class="prog" style="transform: scaleX({pct / 100})"></span>
				</div>
				<input
					type="range"
					min="0"
					max={duration || 0}
					step="0.1"
					bind:value={currentTime}
					onpointerdown={() => (seeking = true)}
					onpointerup={() => (seeking = false)}
					aria-label="Seek"
					aria-valuetext="{formatClock(currentTime)} of {formatClock(duration)}"
					style="--p:{pct}%"
				/>
			</div>

			<div class="row">
				<button class="ctl" onclick={toggle} aria-label={paused ? 'Play' : 'Pause'}>
					{#if paused}<Play size={18} strokeWidth={0} fill="currentColor" />{:else}<Pause size={18} strokeWidth={0} fill="currentColor" />{/if}
				</button>
				{#if !compact}
					<button class="ctl" onclick={() => seekBy(-10)} aria-label="Back 10 seconds"><RotateCcw size={16} strokeWidth={1.6} /></button>
					<button class="ctl" onclick={() => seekBy(10)} aria-label="Forward 10 seconds"><RotateCw size={16} strokeWidth={1.6} /></button>
				{/if}

				<div class="vol">
					<button class="ctl" onclick={() => (muted = !muted)} aria-label={muted ? 'Unmute' : 'Mute'}>
						{#if muted || volume === 0}<VolumeX size={17} strokeWidth={1.6} />{:else if volume < 0.5}<Volume1 size={17} strokeWidth={1.6} />{:else}<Volume2 size={17} strokeWidth={1.6} />{/if}
					</button>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={muted ? 0 : volume}
						oninput={(e) => setVolume(Number(e.currentTarget.value))}
						aria-label="Volume"
						style="--p:{(muted ? 0 : volume) * 100}%"
					/>
				</div>

				<span class="time t-num" aria-live="off">
					{formatClock(currentTime)} <span class="sep">/</span> {formatClock(duration)}
				</span>

				<div class="speed">
					<button
						class="ctl txt"
						onclick={() => (speedOpen = !speedOpen)}
						aria-haspopup="menu"
						aria-expanded={speedOpen}
						aria-label="Playback speed {playbackRate}x"
					>
						{playbackRate}×
					</button>
					{#if speedOpen}
						<div class="menu" role="menu">
							{#each SPEEDS as s (s)}
								<button
									role="menuitemradio"
									aria-checked={playbackRate === s}
									class:on={playbackRate === s}
									onclick={() => {
										playbackRate = s;
										speedOpen = false;
									}}>{s}×</button
								>
							{/each}
						</div>
					{/if}
				</div>

				<button class="ctl" onclick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
					{#if fullscreen}<Minimize size={17} strokeWidth={1.6} />{:else}<Maximize size={17} strokeWidth={1.6} />{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.player {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: var(--ink);
		color: #fff;
		overflow: hidden;
		border-radius: inherit;
		outline: none;
		isolation: isolate;
	}
	.player:focus-visible {
		box-shadow: inset 0 0 0 2px var(--green-300);
	}
	.player.fullscreen {
		aspect-ratio: auto;
		border-radius: 0;
	}
	.player.idle {
		cursor: none;
	}
	video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		background: var(--ink);
	}

	/* Overlay play */
	.overlay {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: grid;
		place-items: center;
		border: 0;
		background: radial-gradient(ellipse at center, rgb(23 25 22 / 0.18), rgb(23 25 22 / 0.42));
		transition:
			opacity var(--duration-slow) var(--ease-out),
			visibility 0s;
	}
	.overlay.hidden {
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--duration-normal) var(--ease-out),
			visibility 0s linear var(--duration-normal);
	}
	.overlay:not(.intro) {
		background: rgb(23 25 22 / 0.18);
	}
	.big {
		display: grid;
		place-items: center;
		width: 4.75rem;
		height: 4.75rem;
		padding-left: 4px;
		border-radius: 50%;
		background: var(--paper);
		color: var(--ink);
		box-shadow: 0 0 0 0 rgb(252 252 250 / 0.4);
		transition:
			transform var(--duration-slow) var(--ease-out),
			background var(--duration-normal) var(--ease-out),
			color var(--duration-normal) var(--ease-out);
		animation: halo 2.6s var(--ease-out) infinite;
	}
	.overlay:hover .big {
		transform: scale(1.08);
		background: var(--brand-primary);
		color: #fff;
	}
	@keyframes halo {
		0% {
			box-shadow: 0 0 0 0 rgb(252 252 250 / 0.35);
		}
		70%,
		100% {
			box-shadow: 0 0 0 22px rgb(252 252 250 / 0);
		}
	}
	.intro-meta {
		position: absolute;
		left: clamp(1rem, 3vw, 2rem);
		bottom: clamp(1rem, 3vw, 1.75rem);
		display: grid;
		gap: 0.35rem;
		text-align: left;
	}
	.intro-meta .t-label {
		color: var(--green-300);
	}
	.intro-title {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 2.4vw, 2rem);
		line-height: 1.1;
	}
	.compact .big {
		width: 3.5rem;
		height: 3.5rem;
	}

	.spinner {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 2.5rem;
		height: 2.5rem;
		margin: -1.25rem;
		border-radius: 50%;
		border: 2px solid rgb(255 255 255 / 0.15);
		border-top-color: var(--green-300);
		animation: spin 0.9s linear infinite;
		z-index: 2;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Controls */
	.controls {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 3;
		padding: 2.5rem clamp(0.75rem, 2vw, 1.25rem) 0.6rem;
		background: linear-gradient(to top, rgb(23 25 22 / 0.78), rgb(23 25 22 / 0));
		opacity: 0;
		transform: translateY(6px);
		pointer-events: none;
		transition:
			opacity var(--duration-slow) var(--ease-out),
			transform var(--duration-slow) var(--ease-out);
	}
	.controls.show {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}
	.idle .controls {
		opacity: 0;
		transform: translateY(6px);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
	.ctl {
		display: inline-grid;
		place-items: center;
		min-width: 2.25rem;
		height: 2.25rem;
		border: 0;
		border-radius: var(--radius-md);
		background: none;
		color: #fff;
		transition: background var(--duration-fast) var(--ease-out);
	}
	.ctl:hover {
		background: rgb(255 255 255 / 0.12);
	}
	.ctl.txt {
		font-size: 0.8rem;
		font-weight: 500;
		padding: 0 0.5rem;
		font-variant-numeric: tabular-nums;
	}
	.time {
		margin: 0 auto 0 0.5rem;
		font-family: var(--font-body);
		font-size: 0.78rem;
		color: rgb(255 255 255 / 0.85);
		white-space: nowrap;
	}
	.sep {
		color: rgb(255 255 255 / 0.4);
		margin: 0 0.2rem;
	}

	.scrub {
		position: relative;
		height: 1rem;
		display: flex;
		align-items: center;
		margin-bottom: 0.25rem;
	}
	.rail {
		position: absolute;
		left: 0;
		right: 0;
		height: 3px;
		border-radius: 2px;
		background: rgb(255 255 255 / 0.18);
		overflow: hidden;
		transition: height var(--duration-fast) var(--ease-out);
	}
	.scrub:hover .rail {
		height: 5px;
	}
	.buf,
	.prog {
		position: absolute;
		inset: 0;
		transform-origin: left;
	}
	.buf {
		background: rgb(255 255 255 / 0.22);
		transition: transform var(--duration-normal) linear;
	}
	.prog {
		background: var(--green-300);
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		margin: 0;
		cursor: pointer;
	}
	.scrub input {
		position: relative;
		width: 100%;
		height: 1rem;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: #fff;
		border: 0;
		transform: scale(0);
		transition: transform var(--duration-fast) var(--ease-out);
	}
	input[type='range']::-moz-range-thumb {
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: #fff;
		border: 0;
		transform: scale(0);
		transition: transform var(--duration-fast) var(--ease-out);
	}
	.scrub:hover input::-webkit-slider-thumb,
	input:focus-visible::-webkit-slider-thumb {
		transform: scale(1);
	}
	.scrub:hover input::-moz-range-thumb,
	input:focus-visible::-moz-range-thumb {
		transform: scale(1);
	}
	input[type='range']:focus-visible {
		outline: none;
	}
	.scrub input:focus-visible + :global(*),
	.scrub:focus-within .rail {
		box-shadow: 0 0 0 2px rgb(184 206 169 / 0.5);
	}

	.vol {
		display: flex;
		align-items: center;
	}
	.vol input {
		width: 0;
		height: 2.25rem;
		opacity: 0;
		transition:
			width var(--duration-slow) var(--ease-out),
			opacity var(--duration-normal) var(--ease-out);
	}
	.vol:hover input,
	.vol:focus-within input {
		width: 5rem;
		opacity: 1;
		margin-right: 0.4rem;
	}
	.vol input::-webkit-slider-runnable-track {
		height: 3px;
		border-radius: 2px;
		background: linear-gradient(to right, #fff var(--p), rgb(255 255 255 / 0.25) var(--p));
	}
	.vol input::-moz-range-track {
		height: 3px;
		border-radius: 2px;
		background: linear-gradient(to right, #fff var(--p), rgb(255 255 255 / 0.25) var(--p));
	}
	.vol input::-webkit-slider-thumb {
		transform: scale(1);
		margin-top: -5px;
	}
	.vol input::-moz-range-thumb {
		transform: scale(1);
	}

	.speed {
		position: relative;
	}
	.menu {
		position: absolute;
		right: 0;
		bottom: calc(100% + 0.5rem);
		display: grid;
		min-width: 5rem;
		padding: 0.3rem;
		background: rgb(23 25 22 / 0.94);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border-inverse);
		border-radius: var(--radius-md);
		animation: pop var(--duration-normal) var(--ease-out);
	}
	.menu button {
		padding: 0.45rem 0.7rem;
		border: 0;
		border-radius: var(--radius-sm);
		background: none;
		color: rgb(255 255 255 / 0.75);
		font-size: 0.8rem;
		text-align: left;
		font-variant-numeric: tabular-nums;
	}
	.menu button:hover,
	.menu button.on {
		background: rgb(255 255 255 / 0.1);
		color: #fff;
	}
	.menu button.on {
		color: var(--green-300);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	/* Missing file */
	.missing {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: start;
		gap: 0.75rem;
		padding: clamp(1.5rem, 6vw, 4rem);
		background:
			radial-gradient(ellipse at 20% 0%, rgb(184 206 169 / 0.1), transparent 60%),
			var(--ink);
		color: var(--text-inverse-muted);
	}
	.missing :global(svg) {
		color: var(--green-300);
	}
	.m-title {
		font-family: var(--font-display);
		font-size: clamp(1.2rem, 2.2vw, 1.75rem);
		color: #fff;
		max-width: 28rem;
		line-height: 1.2;
	}
	.m-body {
		max-width: 30rem;
		font-size: 0.88rem;
	}
	code {
		font-size: 0.82em;
		padding: 0.1rem 0.4rem;
		border-radius: var(--radius-sm);
		background: rgb(255 255 255 / 0.08);
		color: var(--green-300);
		word-break: break-all;
	}

	.compact .time,
	.compact .vol input {
		display: none;
	}
	@media (max-width: 560px) {
		.vol input {
			display: none;
		}
		.big {
			width: 3.75rem;
			height: 3.75rem;
		}
		.intro-meta {
			display: none;
		}
	}
</style>
