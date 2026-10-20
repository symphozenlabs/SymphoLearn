<!--
	Logo — the SymphoZen Academia lockup: the lotus-and-mortarboard mark,
	"SymphoZen" and the bold green "Academia". Files in /static/brand are derived
	from the master artwork (SymphoZen Academia Logo.png).
-->
<script lang="ts">
	import { BRAND } from '$lib/data/site';

	interface Props {
		/** ink: charcoal "SymphoZen" for light backgrounds · paper: white for dark ones */
		tone?: 'ink' | 'paper';
		/** the lotus mark only */
		compact?: boolean;
		/** include the "Beyond Classrooms. Into Possibilities" line (large sizes only) */
		tagline?: boolean;
		href?: string;
		/** rendered height in px (the lockup keeps its proportions) */
		height?: number;
	}
	let { tone = 'ink', compact = false, tagline = false, href = '/', height = 36 }: Props = $props();

	// intrinsic sizes of the artwork
	const ART = {
		mark: { w: 512, h: 512, src: () => '/brand/academia-mark.png' },
		word: { w: 1417, h: 160, src: (t: string) => `/brand/academia-wordmark${t === 'paper' ? '-on-dark' : ''}.png` },
		full: { w: 2126, h: 240, src: (t: string) => `/brand/academia-logo${t === 'paper' ? '-on-dark' : ''}.png` }
	};
	const art = $derived(compact ? ART.mark : tagline ? ART.full : ART.word);
</script>

<a {href} class="logo" aria-label="{BRAND} home">
	<img src={art.src(tone)} alt={BRAND} width={Math.round((height * art.w) / art.h)} {height} decoding="async" />
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
