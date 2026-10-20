<!--
	Curriculum — the syllabus as modules (native <details>), each listing its
	topics and how long they take. Read-only: this is a brochure, not a player.
-->
<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import type { Course } from '$lib/types';
	import { formatSpan, sectionDuration } from '$lib/utils/course';

	interface Props {
		course: Course;
	}
	let { course }: Props = $props();
</script>

<div class="cur">
	{#each course.sections as section, si (section.id)}
		<details class="mod" open={si === 0}>
			<summary>
				<span class="n t-label">Module {String(si + 1).padStart(2, '0')}</span>
				<span class="ttl">{section.title}</span>
				<span class="meta">{section.lessons.length} topics · {formatSpan(sectionDuration(section))}</span>
				<ChevronDown size={16} strokeWidth={1.5} class="chev" />
			</summary>
			<ol>
				{#each section.lessons as lesson (lesson.id)}
					<li>
						<span class="num t-num">{lesson.number}</span>
						<span class="t">
							{lesson.title}
							{#if lesson.keyPoints.length}
								<span class="kp">{lesson.keyPoints.join(' · ')}</span>
							{/if}
						</span>
						<span class="dur">
							{#if lesson.preview}<span class="pv">Free sample</span>{/if}
							{lesson.duration}
						</span>
					</li>
				{/each}
			</ol>
		</details>
	{/each}
</div>

<style>
	.cur {
		display: grid;
		gap: 0.6rem;
	}
	.mod {
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: 0 0 0 1px rgb(23 25 22 / 0.07);
		overflow: hidden;
	}
	summary {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 0.25rem 1rem;
		padding: 1.1rem 1.25rem;
		cursor: pointer;
		list-style: none;
		transition: background var(--duration-fast);
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary:hover {
		background: var(--surface-soft);
	}
	.n {
		color: var(--brand-primary);
	}
	.ttl {
		font-weight: 560;
		color: var(--ink);
	}
	.meta {
		font-size: 0.8rem;
		color: var(--text-muted);
		white-space: nowrap;
	}
	summary :global(.chev) {
		color: var(--text-muted);
		transition: transform var(--duration-normal) var(--ease-out);
	}
	.mod[open] summary :global(.chev) {
		transform: rotate(180deg);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0.25rem 1.25rem 0.9rem;
		border-top: 1px solid var(--border);
	}
	li {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.75rem 0;
		font-size: 0.92rem;
	}
	li + li {
		border-top: 1px dashed var(--border);
	}
	.num {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
	.t {
		display: grid;
		gap: 0.2rem;
		color: var(--ink);
	}
	.kp {
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.dur {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.pv {
		padding: 0.1rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--green-100);
		color: var(--green-700);
		font-size: 0.7rem;
		font-weight: 600;
	}
	@media (max-width: 560px) {
		summary {
			grid-template-columns: minmax(0, 1fr) auto;
		}
		.n,
		.ttl,
		.meta {
			grid-column: 1;
		}
		summary :global(.chev) {
			grid-row: 1 / span 3;
			grid-column: 2;
		}
	}
</style>
