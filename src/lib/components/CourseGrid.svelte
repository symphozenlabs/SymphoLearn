<script lang="ts">
	import type { Course } from '$lib/types';
	import CourseCard from './CourseCard.svelte';
	import { reveal } from '$lib/motion/actions';

	interface Props {
		courses: Course[];
		/**
		 * featured — one wide tile, then a pair
		 * catalog  — three columns; every fifth course is a wide tile, alternating sides
		 * list     — dense rows for scanning
		 */
		layout?: 'featured' | 'catalog' | 'list';
	}

	let { courses, layout = 'catalog' }: Props = $props();

	const isWide = (i: number) => layout !== 'list' && i % 5 === 0;
	const variantFor = (i: number) => (layout === 'list' ? 'row' : isWide(i) ? 'feature' : 'tile');
</script>

<div class="grid {layout}" use:reveal={{ stagger: 0.07 }}>
	{#each courses as course, i (course.id)}
		<div class="cell" class:wide={isWide(i)} class:flip={isWide(i) && (i / 5) % 2 === 1} data-reveal>
			<CourseCard {course} variant={variantFor(i)} />
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.featured {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.featured .wide {
		grid-column: 1 / -1;
	}

	.catalog {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-auto-flow: row dense;
	}
	.catalog .wide {
		grid-column: 1 / span 2;
	}
	.catalog .wide.flip {
		grid-column: 2 / span 2;
	}

	.list {
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 1024px) {
		.catalog {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.catalog .wide,
		.catalog .wide.flip {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 640px) {
		.featured,
		.catalog {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
