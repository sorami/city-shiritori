<script lang="ts">
	import 'virtual:uno.css';
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';
	import type { Topology } from 'topojson-specification';
	import { Versor } from '$lib';

	onMount(async () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		const world: Topology | undefined = await d3.json(
			'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
		);
		if (!world) return;
		const land = topojson.feature(world, world.objects.land);
		// @ts-ignore
		const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
		// @ts-ignore
		const countries = topojson.feature(world, world.objects.countries).features;
		// const sphere = { type: 'Sphere' };
		const sphere = { type: 'Sphere' };
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

		function render(country, arc) {
			if (!context) return;
			context.clearRect(0, 0, width, height);
			context.beginPath(), path(land), (context.fillStyle = '#ccc'), context.fill();
			context.beginPath(), path(country), (context.fillStyle = '#f00'), context.fill();
			context.beginPath(),
				path(borders),
				(context.strokeStyle = '#fff'),
				(context.lineWidth = 0.5),
				context.stroke();

			context.beginPath(),
				path(sphere),
				(context.strokeStyle = '#000'),
				(context.lineWidth = 1.5),
				context.stroke();

			context.beginPath(),
				path(arc),
				(context.strokeStyle = '#333'),
				(context.lineWidth = 3),
				context.stroke();

			return context.canvas;
		}

		let p1: [number, number];
		let p2: [number, number] = [0, 0];
		let r1: [number, number, number];
		let r2: [number, number, number] = [0, 0, 0];
		for (const country of countries) {
			const name = country.properties.name;

			p1 = p2;
			p2 = d3.geoCentroid(country);
			console.log({ p2 });
			r1 = r2;
			r2 = [-p2[0], tilt - p2[1], 0];
			const ip = d3.geoInterpolate(p1, p2);
			const iv = Versor.interpolateAngles(r1, r2);

			await d3
				.transition()
				.duration(1500)
				.tween('render', () => (t) => {
					projection.rotate(iv(t));
					render(country, { type: 'LineString', coordinates: [p1, ip(t)] });
				})
				.transition()
				.tween('render', () => (t) => {
					render(country, { type: 'LineString', coordinates: [ip(t), p2] });
				})
				.end();
		}
	});
</script>

<svelte:head>
	<title>都市名しりとり</title>
</svelte:head>

<div class="grid h-screen place-items-center">
	<div id="wrapper" />
</div>
