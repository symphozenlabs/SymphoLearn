<script lang="ts">
	import { ArrowLeft, Clock, BarChart3, Award, Layers, MonitorPlay } from '@lucide/svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import EnquiryForm from '$lib/components/EnquiryForm.svelte';
	import { site } from '$lib/data/catalog';
	import { BRAND } from '$lib/data/site';
	import { getCategory } from '$lib/services/courseService';

	let { data } = $props();
	const course = $derived(data.course);
</script>

<svelte:head>
	<title>Enquire · {course.title} — {BRAND}</title>
</svelte:head>

<div class="enq container-x">
	<a class="back" href="/courses/{course.id}"><ArrowLeft size={15} strokeWidth={1.6} /> <span>{course.title}</span></a>

	<div class="layout">
		<div class="main">
			<header class="head">
				<p class="eyebrow">Enquire · {getCategory(course.category).name}</p>
				<h1 class="t-h1">Join <em class="italic-accent">{course.title}.</em></h1>
				<p class="lede">
					Leave your details and a counsellor will call you with batch dates, fees and EMI options — and book you
					a free demo class if you’d like one.
				</p>
			</header>
			<EnquiryForm kind="course" courseId={course.id} lockCourse size="full" submitLabel="Request a callback" uid="page" />
		</div>

		<aside class="summary">
			<div class="sum-card">
				<img src={course.thumbnail} alt="" width="1600" height="1000" />
				<div class="sum-body">
					<p class="t-label">{getCategory(course.category).name}</p>
					<p class="sum-title">{course.title}</p>
					<p class="sum-ins"><Avatar person={course.instructor} size={28} /><span>Mentor · {course.instructor.name}</span></p>
					<div class="sum-price">
						<p class="t-label offer-k">{site.offerNote}</p>
						<PriceTag price={course.price} size="md" note />
					</div>
					<ul class="sum-list">
						<li><Clock size={15} strokeWidth={1.5} /> {course.duration} of live instruction</li>
						<li><Layers size={15} strokeWidth={1.5} /> {course.sections.length} modules + capstone</li>
						<li><BarChart3 size={15} strokeWidth={1.5} /> {course.level}</li>
						<li><MonitorPlay size={15} strokeWidth={1.5} /> Online · Classroom · Hybrid</li>
						<li><Award size={15} strokeWidth={1.5} /> Certificate of completion</li>
					</ul>
				</div>
			</div>
		</aside>
	</div>
</div>

<style>
	.enq {
		padding-top: calc(var(--nav-height) + clamp(1.5rem, 4vw, 3rem));
		padding-bottom: var(--section-space);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		max-width: 100%;
		font-size: 0.86rem;
		color: var(--text-secondary);
		transition: color var(--duration-normal);
	}
	.back span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.back:hover {
		color: var(--ink);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 23rem);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: start;
		margin-top: clamp(1.75rem, 4vw, 3rem);
	}
	.main {
		min-width: 0;
	}
	.head {
		display: grid;
		gap: 1rem;
		margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
	}
	.head .t-h1 {
		font-size: clamp(2.3rem, 5vw, 4rem);
		overflow-wrap: anywhere;
	}
	.lede {
		color: var(--text-secondary);
		font-size: var(--fs-body-lg);
		max-width: 36rem;
	}

	.summary {
		position: sticky;
		top: calc(var(--bar-height) + 1.5rem);
		min-width: 0;
	}
	.sum-card {
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
	}
	.sum-card img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
	.sum-body {
		padding: 1.4rem;
		display: grid;
		gap: 0.6rem;
	}
	.sum-title {
		font-family: var(--font-display);
		font-size: 1.45rem;
		line-height: 1.15;
		color: var(--ink);
	}
	.sum-ins {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}
	.sum-price {
		margin-top: 0.4rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.offer-k {
		margin-bottom: 0.5rem;
	}
	.sum-list {
		list-style: none;
		margin: 0.4rem 0 0;
		padding: 1rem 0 0;
		border-top: 1px solid var(--border);
		display: grid;
		gap: 0.55rem;
		font-size: 0.84rem;
		color: var(--text-secondary);
	}
	.sum-list li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	@media (max-width: 960px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.summary {
			position: static;
			order: -1;
		}
		.sum-card {
			display: grid;
			grid-template-columns: 9rem minmax(0, 1fr);
		}
		.sum-card img {
			height: 100%;
			aspect-ratio: auto;
		}
		.sum-list {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.sum-card {
			grid-template-columns: minmax(0, 1fr);
		}
		.sum-card img {
			aspect-ratio: 16 / 7;
		}
		.sum-body {
			padding: 1.1rem;
		}
		.sum-title {
			font-size: 1.2rem;
		}
	}
</style>
