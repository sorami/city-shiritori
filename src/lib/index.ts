type City = {
	name: string;
	reading: string;
	country: string;
	population: number;
	coordinates: [number, number]; // [lon, lat]
	shiritori: {
		first: string;
		last: string;
	};
};

type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

// cf. https://observablehq.com/@d3/world-tour, https://github.com/d3/versor
class Versor {
	static fromAngles([l, p, g]: Vec3): Vec4 {
		l *= Math.PI / 360;
		p *= Math.PI / 360;
		g *= Math.PI / 360;
		const sl = Math.sin(l),
			cl = Math.cos(l);
		const sp = Math.sin(p),
			cp = Math.cos(p);
		const sg = Math.sin(g),
			cg = Math.cos(g);
		return [
			cl * cp * cg + sl * sp * sg,
			sl * cp * cg - cl * sp * sg,
			cl * sp * cg + sl * cp * sg,
			cl * cp * sg - sl * sp * cg
		];
	}

	static toAngles([a, b, c, d]: Vec4): Vec3 {
		return [
			(Math.atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * 180) / Math.PI,
			(Math.asin(Math.max(-1, Math.min(1, 2 * (a * c - d * b)))) * 180) / Math.PI,
			(Math.atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * 180) / Math.PI
		];
	}

	static interpolateAngles(a: Vec3, b: Vec3) {
		const i = Versor.interpolate(Versor.fromAngles(a), Versor.fromAngles(b));
		return (t: number) => Versor.toAngles(i(t));
	}

	static interpolateLinear([a1, b1, c1, d1]: Vec4, [a2, b2, c2, d2]: Vec4) {
		(a2 -= a1), (b2 -= b1), (c2 -= c1), (d2 -= d1);
		const x = new Array(4);
		return (t: number) => {
			const l = Math.hypot(
				(x[0] = a1 + a2 * t),
				(x[1] = b1 + b2 * t),
				(x[2] = c1 + c2 * t),
				(x[3] = d1 + d2 * t)
			);
			(x[0] /= l), (x[1] /= l), (x[2] /= l), (x[3] /= l);
			return x;
		};
	}

	static interpolate([a1, b1, c1, d1]: Vec4, [a2, b2, c2, d2]: Vec4) {
		let dot = a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
		if (dot < 0) (a2 = -a2), (b2 = -b2), (c2 = -c2), (d2 = -d2), (dot = -dot);
		if (dot > 0.9995) return Versor.interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]);
		const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
		const x = new Array(4);
		const l = Math.hypot((a2 -= a1 * dot), (b2 -= b1 * dot), (c2 -= c1 * dot), (d2 -= d1 * dot));
		(a2 /= l), (b2 /= l), (c2 /= l), (d2 /= l);
		return (t: number) => {
			const theta = theta0 * t;
			const s = Math.sin(theta);
			const c = Math.cos(theta);
			x[0] = a1 * c + a2 * s;
			x[1] = b1 * c + b2 * s;
			x[2] = c1 * c + c2 * s;
			x[3] = d1 * c + d2 * s;
			return x;
		};
	}
}

export { Versor };
export type { City };
