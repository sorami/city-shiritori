<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { City } from '$lib';
	import { onMount } from 'svelte';

	export let city: City;

	export let transitionDuration;
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
			class="z-10 absolute bg-neutral-9 rounded text-white w-sm px-3 py-4 text-center opacity-70"
		>
			<div class="flex justify-between items-center">
				<div
					class="text-lg font-bold bg-white/70 text-black p-2 w-4 h-4 flex justify-center items-center"
				>
					{city.shiritori.first}
				</div>
				<div class="font-bold">→</div>
				<div class="flex flex-col gap-y-2">
					<div class="text-xs tracking-widest italic">
						{city.reading}
					</div>
					<div class="text-xl font-bold">{city.name}</div>

					<div class="text-xs">
						{city.country}
					</div>
					<div class="text-xs">
						{(city.population / 10000).toFixed(0)}万人
					</div>
				</div>
				<div>→</div>
				<div
					class="text-lg font-bold bg-white/70 text-black p-2 w-4 h-4 flex justify-center items-center"
				>
					{city.shiritori.last}
				</div>
			</div>
		</div>
	{/key}
{/if}
