<script lang="ts">
	import 'virtual:uno.css';
	import '@unocss/reset/tailwind-compat.css';

	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';
	import type { Topology } from 'topojson-specification';
	import { MAX_DURATION, Versor } from '$lib';
	import type { City, Vec3 } from '$lib';
	import Name from './Name.svelte';
	import SpeedSlider from './SpeedSlider.svelte';

	import Modal from './Modal.svelte';
	let showModal = false;

	let prevCity: City;
	let nextCity: City;

	let speedSliderValue = 1500;
	$: transitionDuration = MAX_DURATION - speedSliderValue;

	const tilt = 20;

	onMount(async () => {
		const width = window.innerWidth;
		const height = window.innerHeight * 0.92;

		const world: Topology | undefined = await d3.json(
			'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
		);
		if (!world) return;
		const land = topojson.feature(world, world.objects.land);
		// @ts-ignore
		const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
		const sphere = { type: 'Sphere', geometries: {} as d3.GeoGeometryObjects[] };

		// cf. https://github.com/observablehq/stdlib/blob/main/src/dom/context2d.js
		const dpi = window.devicePixelRatio;
		const canvas = document.createElement('canvas');
		canvas.width = width * dpi;
		canvas.height = height * dpi;
		canvas.style.width = width + 'px';
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.scale(dpi, dpi);
		document.getElementById('globe-wrapper')!.appendChild(canvas);

		const projection = d3.geoOrthographic().fitExtent(
			[
				[10, 10],
				[width - 10, height - 10]
			],
			sphere
		);
		const path = d3.geoPath(projection, ctx);

		function render(nextCity: City, prevCity?: City, arcCoordinates?: [number, number][]) {
			if (!ctx) return;

			ctx.clearRect(0, 0, width, height);

			// land
			ctx.beginPath();
			path(land);
			ctx.fillStyle = '#aaa';
			ctx.fill();

			// borders
			ctx.beginPath();
			path(borders);
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 0.5;
			ctx.setLineDash([]);
			ctx.stroke();

			// sphere outline
			ctx.beginPath();
			path(sphere);
			ctx.strokeStyle = '#ccc';
			ctx.lineWidth = 1.5;
			ctx.stroke();

			// next city, circle
			ctx.beginPath();
			path(d3.geoCircle().center(nextCity.coordinates).radius(1.2)());
			ctx.fillStyle = 'tomato';
			ctx.fill();

			if (prevCity) {
				// prev city, circle
				ctx.beginPath();
				path(d3.geoCircle().center(prevCity.coordinates).radius(1.2)());
				ctx.fillStyle = 'tomato';
				ctx.fill();
			}

			if (arcCoordinates) {
				ctx.beginPath();
				path({ type: 'LineString', coordinates: arcCoordinates });
				ctx.strokeStyle = '#444';
				ctx.lineWidth = 2;
				ctx.setLineDash([]);
				ctx.stroke();
			}
		}

		const cities: City[] | undefined = await d3.json('./cities.json');
		if (!cities) return;

		nextCity = cities[Math.floor(Math.random() * cities.length)];
		// nextCity = cities.find((city) => city.name === '札幌')!;
		// nextCity = cities.find((city) => city.name === 'ナコーンシータンマラート')!; // 最長の都市名
		let p1: [number, number] = [0, 0];
		let p2 = nextCity.coordinates;
		let r1: Vec3 = [0, 0, 0];
		let r2: Vec3 = [-p2[0], tilt - p2[1], 0];

		const iv = Versor.interpolateAngles(r1, r2);
		projection.rotate(iv(1));
		render(nextCity);
		await new Promise((resolve) => setTimeout(resolve, transitionDuration / 2));

		while (true) {
			prevCity = nextCity;

			const nextCities = cities.filter((city) => prevCity.shiritori.last === city.shiritori.first);
			if (nextCities.length === 0) {
				console.warn('no next cities', prevCity);
				break;
			}
			nextCity = nextCities[Math.floor(Math.random() * nextCities.length)];

			p1 = p2;
			p2 = nextCity.coordinates;
			r1 = r2;
			r2 = [-p2[0], tilt - p2[1], 0];
			const ip = d3.geoInterpolate(p1, p2);
			const iv = Versor.interpolateAngles(r1, r2);

			await d3
				.transition()
				.duration(transitionDuration)
				.tween('render', () => (t) => {
					projection.rotate(iv(t));
					render(nextCity, prevCity, [p1, ip(t)]);
				})
				.transition()
				.tween('render', () => (t) => {
					render(nextCity, prevCity, [ip(t), p2]);
				})
				.end();
		}
	});
</script>

<svelte:head>
	<title>都市名しりとり - sorami.dev</title>
</svelte:head>

<div class="font-custom">
	<div class="flex flex-wrap justify-around items-center gap-3 mt-8">
		<div class="flex items-center gap-x-2">
			<h1 class="text-2xl text-neutral-700 tracking-wide">都市名しりとり</h1>
			<button
				on:click={() => (showModal = true)}
				class="i-material-symbols-help text-3xl text-neutral-600 hover:opacity-70 hover:cursor-pointer"
			/>
		</div>
		<SpeedSlider bind:speedSliderValue />
	</div>

	<div id="globe-wrapper" />

	<Name city={nextCity} {transitionDuration} />

	<Modal bind:showModal />
</div>
