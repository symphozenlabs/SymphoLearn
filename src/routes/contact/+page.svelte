<script lang="ts">
	import ContactSection from '$lib/components/home/ContactSection.svelte';
	import { BRAND } from '$lib/data/site';
</script>

<svelte:head>
	<title>Contact — {BRAND}</title>
	<meta name="description" content="Talk to a {BRAND} counsellor about programs, batches, fees and free demo classes." />
</svelte:head>

<ContactSection asPage />
