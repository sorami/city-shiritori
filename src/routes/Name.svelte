<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { City } from '$lib';
	import { onMount } from 'svelte';

	export let city: City;

	const transitionDuration = 1000;
	let xShift = 300;

	onMount(() => {
		xShift = window.innerWidth / 2;
	});
</script>

{#if city}
	<!-- destroy and recreate their contents when the value of an expression changes, for in/out transitions -->
	<!-- cf. https://svelte.dev/tutorial/key-blocks -->
	{#key city}
		<div
			in:fly={{ x: xShift, duration: transitionDuration }}
			out:fly={{ x: -xShift, duration: transitionDuration }}
			class="z-10 absolute bg-black rounded-xl text-white w-xs px-1 py-5 text-center opacity-70"
		>
			<div class="flex flex-col gap-y-2">
				<div class="text-xs tracking-widest italic">
					<span class="font-bold">{city.shiritori.first}</span> → 「{city.reading}」 →
					<span class="font-bold">{city.shiritori.last}</span>
				</div>
				<div class="text-xl font-bold">{city.name}</div>

				<div class="text-xs">
					{city.country}
				</div>
				<div class="text-xs">
					{(city.population / 10000).toFixed(0)}万人
				</div>
			</div>
		</div>
	{/key}
{/if}
