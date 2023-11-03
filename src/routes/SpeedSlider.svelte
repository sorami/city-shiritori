<script lang="ts">
	export let speedSliderValue: number;
	import { MAX_DURATION } from '$lib';
</script>

<div class="flex gap-x-3 items-center text-neutral-600 text-xl">
	<div class="i-mdi-snail" />
	<input
		type="range"
		name="speed"
		id="speed"
		bind:value={speedSliderValue}
		min="0"
		max={MAX_DURATION - 100}
		step="100"
		class="w-52 accent-neutral-5 focus:accent-neutral-8"
	/>
	<div class="i-material-symbols-rocket-launch" />
</div>
