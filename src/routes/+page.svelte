<script lang="ts">
	import 'virtual:uno.css';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';
	import type { Topology } from 'topojson-specification';
	import { Versor } from '$lib';
	import type { City, Vec3, Vec4 } from '$lib';
	import Name from './Name.svelte';

	let prevCity: City;
	let nextCity: City;
	let transitionDuration = 1500;
	const tilt = 20;

	onMount(async () => {
		const width = window.innerWidth * 0.9;
		const height = window.innerHeight * 0.9;

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
		document.getElementById('wrapper')!.appendChild(canvas);

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
				ctx.strokeStyle = '#333';
				ctx.lineWidth = 2;
				ctx.setLineDash([]);
				ctx.stroke();
			}
		}

		const cities: City[] | undefined = await d3.json('./cities.json');
		if (!cities) return;

		// nextCity = cities[Math.floor(Math.random() * cities.length)];
		// nextCity = cities.find((city) => city.name === '札幌')!;
		nextCity = cities.find((city) => city.name === 'ナコーンシータンマラート')!; // 最長の都市名
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
	<title>都市名しりとり</title>
</svelte:head>

<div class="grid h-screen place-items-center font-custom">
	<div class="font-bold text-neutral-600 text-xl">都市名しりとり</div>
	<div>
		🚀 <input
			type="range"
			name="speed"
			id="speed"
			bind:value={transitionDuration}
			min="100"
			max="3000"
			step="100"
			class="w-52"
		/> 🐢
	</div>
	<Name city={nextCity} {transitionDuration} />
	<div id="wrapper" />
</div>
