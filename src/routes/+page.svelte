<script lang="ts">
	import 'virtual:uno.css';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';
	import type { Topology } from 'topojson-specification';
	import { Versor } from '$lib';
	import type { City } from '$lib';
	import Name from './Name.svelte';

	let currentCity: City;
	let transitionDuration = 1500;

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
		const tilt = 20;

		// cf. https://github.com/observablehq/stdlib/blob/main/src/dom/context2d.js
		const dpi = window.devicePixelRatio;
		const canvas = document.createElement('canvas');
		canvas.width = width * dpi;
		canvas.height = height * dpi;
		canvas.style.width = width + 'px';
		const context = canvas.getContext('2d');
		if (!context) return;
		context.scale(dpi, dpi);
		document.getElementById('wrapper')!.appendChild(canvas);

		const projection = d3.geoOrthographic().fitExtent(
			[
				[10, 10],
				[width - 10, height - 10]
			],
			sphere
		);
		const path = d3.geoPath(projection, context);

		const cities: City[] | undefined = await d3.json('./cities.json');
		if (!cities) return cities;

		function render(city: City, arcCoordinates?: [number, number][]) {
			if (!context) return;

			context.clearRect(0, 0, width, height);

			context.beginPath(), path(land), (context.fillStyle = '#aaa'), context.fill();
			context.beginPath(),
				path(borders),
				(context.strokeStyle = '#fff'),
				(context.lineWidth = 0.5),
				context.stroke();
			context.beginPath(),
				path(sphere),
				(context.strokeStyle = '#ccc'),
				(context.lineWidth = 1.5),
				context.stroke();

			context.beginPath(),
				path(d3.geoCircle().center(city.coordinates).radius(1.2)()),
				(context.fillStyle = 'tomato'),
				context.fill();

			if (arcCoordinates) {
				context.beginPath(),
					path({ type: 'LineString', coordinates: arcCoordinates }),
					(context.strokeStyle = '#333'),
					(context.lineWidth = 2),
					context.stroke();
			}

			return context.canvas;
		}

		let p1: [number, number];
		let p2: [number, number] = [0, 0];
		let r1: [number, number, number];
		let r2: [number, number, number] = [0, 0, 0];

		// currentCity = cities[Math.floor(Math.random() * cities.length)];
		currentCity = cities.find((city) => city.name === '菏沢')!;
		p1 = p2;
		p2 = currentCity.coordinates;
		r1 = r2;
		r2 = [-p2[0], tilt - p2[1], 0];
		const ip = d3.geoInterpolate(p1, p2);
		const iv = Versor.interpolateAngles(r1, r2);
		projection.rotate(iv(1));
		render(currentCity);
		await new Promise((resolve) => setTimeout(resolve, transitionDuration / 2));

		while (true) {
			const nextCities = cities.filter(
				(city) => currentCity.shiritori.last === city.shiritori.first
			);
			if (nextCities.length === 0) {
				console.log(currentCity);
			}
			currentCity = nextCities[Math.floor(Math.random() * nextCities.length)];
			p1 = p2;
			p2 = currentCity.coordinates;
			r1 = r2;
			r2 = [-p2[0], tilt - p2[1], 0];
			const ip = d3.geoInterpolate(p1, p2);
			const iv = Versor.interpolateAngles(r1, r2);
			await d3
				.transition()
				.duration(transitionDuration)
				.tween('render', () => (t) => {
					projection.rotate(iv(t));
					render(currentCity, [p1, ip(t)]);
				})
				.transition()
				.tween('render', () => (t) => {
					render(currentCity, [ip(t), p2]);
				})
				.end();
		}
	});
</script>

<svelte:head>
	<title>都市名しりとり</title>
</svelte:head>

<div class="grid h-screen place-items-center">
	<div class="font-bold text-neutral-600 text-xl">都市名しりとり</div>
	<Name city={currentCity} />
	<div id="wrapper" />
</div>
