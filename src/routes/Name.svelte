<script lang="ts">
	import { fly, blur, fade, slide } from 'svelte/transition';
	import type { City } from '$lib';
	import { onMount } from 'svelte';

	export let city: City;

	export let transitionDuration: number = 1500;
	let xShift = 300;

	onMount(() => {
		xShift = window.innerWidth / 2;
	});

	const inTransition = (node: any) =>
		screen.width < 640
			? fade(node, { delay: transitionDuration * 0.3, duration: transitionDuration * 0.7 })
			: fly(node, { x: xShift, duration: transitionDuration });
	const outTransition = (node: any) =>
		screen.width < 640
			? fade(node, { delay: 0, duration: transitionDuration * 0.3 })
			: fly(node, { x: -xShift, duration: transitionDuration });
</script>

{#if city}
	<!-- destroy and recreate their contents when the value of an expression changes, for in/out transitions -->
	<!-- cf. https://svelte.dev/tutorial/key-blocks -->
	{#key city}
		<div
			in:inTransition
			out:outTransition
			id="name-container"
			class="bg-neutral-9/75 sm:bg-neutral-9 rounded-lg text-white px-4 py-4 mx-2 text-center opacity-70"
		>
			<div class="flex justify-between items-center gap-x-7">
				<!-- 最初のかな -->
				<div class="hidden sm:block">
					<div
						class="text-lg font-bold bg-white/70 text-black p-3 w-4 h-4 flex justify-center items-center"
					>
						{city.shiritori.first}
					</div>
				</div>

				<!-- 矢印 -->
				<div class="hidden sm:block i-material-symbols-line-end-arrow-rounded text-lg opacity-75" />

				<div class="flex flex-col gap-y-0 sm:gap-y-2">
					{#if city.notKana}
						<div class="text-xs tracking-widest italic">
							{city.reading}
						</div>
					{/if}
					<div class="text-base sm:text-xl font-bold">{city.name}</div>
					<div class="text-xs">
						{city.country}
					</div>
					<div class="text-xs">
						{(city.population / 10000).toFixed(0)}万人
					</div>
				</div>

				<!-- 矢印 -->
				<div class="hidden sm:block i-material-symbols-line-end-arrow-rounded text-lg opacity-75" />

				<!-- 最後のかな -->
				<div class="hidden sm:block">
					<div
						class="text-lg font-bold bg-white/70 text-black p-3 w-4 h-4 flex justify-center items-center"
					>
						{city.shiritori.last}
					</div>
				</div>
			</div>
		</div>
	{/key}
{/if}

<style>
	#name-container {
		position: absolute;
		left: 50%;

		@apply top-2/3;
		@screen sm {
			top: 50%;
		}

		transform: translate(-50%, -50%);
		z-index: 1000;
	}
</style>
