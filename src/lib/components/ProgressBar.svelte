<script lang="ts">
	interface Props {
		/** 0–100 */
		value: number;
		/** Draw one segment per lesson instead of a continuous bar. */
		segments?: number;
		/** Indices of completed segments (when segmented). Defaults to the first N. */
		completed?: boolean[];
		tone?: 'light' | 'dark';
		size?: 'xs' | 'sm' | 'md';
		label?: string;
	}

	let { value, segments, completed, tone = 'light', size = 'sm', label = 'Course progress' }: Props = $props();

	const clamped = $derived(Math.max(0, Math.min(100, value)));
	const filled = $derived(
		completed ?? Array.from({ length: segments ?? 0 }, (_, i) => i < Math.round(((segments ?? 0) * clamped) / 100))
	);
</script>

<div
	class="progress {tone} {size}"
	role="progressbar"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(clamped)}
>
	{#if segments}
		<div class="segments" style="--n:{segments}">
			{#each filled as done, i (i)}
				<span class="seg" class:done style="--i:{i}"></span>
			{/each}
		</div>
	{:else}
		<div class="track">
			<div class="fill" style="transform: scaleX({clamped / 100})"></div>
		</div>
	{/if}
</div>

<style>
	.progress {
		--track: var(--border);
		--fill: var(--brand-primary);
		--h: 3px;
		width: 100%;
	}
	.dark {
		--track: rgb(255 255 255 / 0.12);
		--fill: var(--green-300);
	}
	.xs {
		--h: 2px;
	}
	.md {
		--h: 5px;
	}
	.track {
		position: relative;
		height: var(--h);
		background: var(--track);
		border-radius: var(--radius-pill);
		overflow: hidden;
	}
	.fill {
		position: absolute;
		inset: 0;
		background: var(--fill);
		transform-origin: left;
		border-radius: inherit;
		transition: transform 1.1s var(--ease-out);
	}
	.segments {
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		gap: 3px;
	}
	.seg {
		height: calc(var(--h) + 1px);
		background: var(--track);
		border-radius: 1px;
		position: relative;
		overflow: hidden;
	}
	.seg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--fill);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.7s var(--ease-out);
		transition-delay: calc(var(--i) * 35ms);
	}
	.seg.done::after {
		transform: scaleX(1);
	}
</style>
