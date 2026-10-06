<!--
	Course page preview: the cover morphs in from the catalog (shared element),
	and if the course has a free preview lesson, it plays inline.
-->
<script lang="ts">
	import { Play } from '@lucide/svelte';
	import type { Course } from '$lib/types';
	import { allLessons } from '$lib/utils/course';
	import VideoPlayer from './VideoPlayer.svelte';

	interface Props {
		course: Course;
	}
	let { course }: Props = $props();

	const previewLesson = $derived(allLessons(course).find((l) => l.preview));
	let playing = $state(false);
</script>

<figure class="preview">
	<div class="frame">
		{#if playing && previewLesson}
			<VideoPlayer
				src={previewLesson.videoUrl}
				poster={previewLesson.poster}
				title={previewLesson.title}
				autoplay
			/>
		{:else}
			<img
				src={course.thumbnail}
				alt=""
				width="1600"
				height="1000"
				style:view-transition-name="cover-{course.id}"
			/>
			{#if previewLesson}
				<button class="play" onclick={() => (playing = true)}>
					<span class="disc"><Play size={20} strokeWidth={0} fill="currentColor" /></span>
					<span class="lbl">
						<span class="t-label">Free preview</span>
						<span>{previewLesson.number} — {previewLesson.title} · {previewLesson.duration}</span>
					</span>
				</button>
			{/if}
		{/if}
	</div>
	<figcaption class="t-label">
		{previewLesson ? 'Course preview' : 'Course cover'} · {course.title}
	</figcaption>
</figure>

<style>
	.preview {
		margin: 0;
	}
	.frame {
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--ink);
		box-shadow: var(--shadow-hero);
	}
	.frame :global(.player) {
		height: 100%;
		aspect-ratio: auto;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.play {
		position: absolute;
		left: 1rem;
		bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.5rem 1.1rem 0.5rem 0.5rem;
		border: 0;
		border-radius: var(--radius-pill);
		background: rgb(252 252 250 / 0.94);
		backdrop-filter: blur(10px);
		color: var(--ink);
		text-align: left;
		font-size: 0.85rem;
		box-shadow: var(--shadow-soft);
		transition: transform var(--duration-slow) var(--ease-out);
	}
	.play:hover {
		transform: translateY(-2px);
	}
	.disc {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		padding-left: 3px;
		border-radius: 50%;
		background: var(--ink);
		color: #fff;
		transition: background var(--duration-normal) var(--ease-out);
	}
	.play:hover .disc {
		background: var(--brand-primary);
	}
	.lbl {
		display: grid;
		gap: 0.1rem;
	}
	.lbl .t-label {
		font-size: 0.6rem;
		color: var(--brand-primary);
	}
	figcaption {
		margin-top: 0.9rem;
	}
</style>
