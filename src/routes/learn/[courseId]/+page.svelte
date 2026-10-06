<script lang="ts">
	import { onMount } from 'svelte';
	import CoursePlayer from '$lib/components/CoursePlayer.svelte';

	let { data } = $props();

	// ?lesson= is read on the client only, so the page can be prerendered
	let requested = $state<string | null>(null);
	let ready = $state(false);
	onMount(() => {
		requested = new URLSearchParams(location.search).get('lesson');
		ready = true;
	});
</script>

<svelte:head>
	<title>Learning · {data.course.title} — SymphoLearn</title>
</svelte:head>

{#if ready}
	{#key data.course.id}
		<CoursePlayer course={data.course} requestedLessonId={requested} />
	{/key}
{:else}
	<div class="boot" aria-hidden="true"></div>
{/if}

<style>
	.boot {
		min-height: 100vh;
		background: var(--background);
	}
</style>
