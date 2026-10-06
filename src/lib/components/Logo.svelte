<!--
	Logo — the SymphoLearn lockup, derived from the official SymphoZen Labs logo:
	the same lotus and "Sympho" outlines, "Learn" in the wordmark's bold green,
	and the "Learn with SymphoZen" tagline. Files live in /static/brand.
-->
<script lang="ts">
	interface Props {
		/** ink: charcoal wordmark for light backgrounds · paper: white wordmark for dark ones */
		tone?: 'ink' | 'paper';
		/** the lotus mark only */
		compact?: boolean;
		href?: string;
		/** rendered height in px (the lockup keeps its proportions) */
		height?: number;
	}
	let { tone = 'ink', compact = false, href = '/', height = 38 }: Props = $props();

	// intrinsic sizes of the artwork
	const LOCKUP = { w: 1140, h: 216 };
	const MARK = { w: 239, h: 216 };
	const art = $derived(compact ? MARK : LOCKUP);
	const src = $derived(
		compact
			? '/brand/sympholearn-mark.svg'
			: tone === 'paper'
				? '/brand/sympholearn-logo-on-dark.svg'
				: '/brand/sympholearn-logo.svg'
	);
</script>

<a {href} class="logo" aria-label="SymphoLearn home">
	<img {src} alt="SymphoLearn" width={Math.round((height * art.w) / art.h)} {height} decoding="async" />
</a>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		flex: none;
		line-height: 0;
		transition: opacity var(--duration-normal) var(--ease-out);
	}
	.logo:hover {
		opacity: 0.85;
	}
	img {
		display: block;
		height: auto;
		max-width: 100%;
	}
</style>
