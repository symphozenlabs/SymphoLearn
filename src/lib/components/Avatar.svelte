<script lang="ts">
	import type { Instructor } from '$lib/types';

	interface Props {
		person: Pick<Instructor, 'name' | 'avatar'>;
		size?: number;
	}
	let { person, size = 40 }: Props = $props();

	const initials = $derived(
		person.name
			.split(' ')
			.map((p) => p[0])
			.slice(0, 2)
			.join('')
	);
</script>

{#if person.avatar}
	<img class="avatar" src={person.avatar} alt="" width={size} height={size} style="--s:{size}px" />
{:else}
	<span class="avatar mono" style="--s:{size}px" aria-hidden="true">{initials}</span>
{/if}

<style>
	.avatar {
		width: var(--s);
		height: var(--s);
		border-radius: 50%;
		flex: none;
		object-fit: cover;
	}
	.mono {
		display: inline-grid;
		place-items: center;
		background: var(--green-100);
		color: var(--green-700);
		font-family: var(--font-display);
		font-size: calc(var(--s) * 0.38);
		font-weight: 500;
		letter-spacing: 0.02em;
		box-shadow: inset 0 0 0 1px rgb(90 138 69 / 0.18);
	}
</style>
