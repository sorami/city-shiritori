<script lang="ts">
	import type { City } from '$lib';

	export let city: City;
</script>

{#if city}
	<div class="z-10 absolute bg-black rounded-xl text-white w-xs px-1 py-5 text-center opacity-70">
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
{/if}
