// Drawing kit for the illustrations: isometric hairline drawings in one quiet monochrome. Faces take
// the colour of the background behind the scene, so volumes are solid and hide what is behind
// them, and depth reads from line brightness alone: the silhouettes in front are brightest, inner
// edges and anything further back or lower are dimmer. Colours are the light theme's values;
// site.css maps each one to a theme token and keeps every line at one screen pixel.

export const C = {
	// Every face is the background (paper, light, side and block are the older names for it)
	face: "#FFFFFF",
	paper: "#FFFFFF",
	light: "#FFFFFF",
	side: "#FFFFFF",
	block: "#FFFFFF",
	// Lines, brightest to faintest
	activity: "#2B3036",
	outline: "#565D65",
	route: "#7A8188",
	seam: "#AAB0B6",
	guide: "#D5DADE",
	grid: "#E8EBEE",
	label: "#6B727A",
}

// How far back an object sits: 0 in front, 1 to 3 further back or lower, each a step dimmer
export type Tone = 0 | 1 | 2 | 3
const LADDER = [C.outline, C.route, C.seam, C.guide, C.grid]
const edgeOf = (tone: Tone = 0) => LADDER[tone] as string
const innerOf = (tone: Tone = 0) => LADDER[Math.min(tone + 2, 4)] as string

export type Pt = [number, number]
type Plane = [number, number][]

const COS = Math.sqrt(3) / 2
const round = (n: number) => Math.round(n * 10) / 10
const line = (points: Pt[]) => points.map(([x, y]) => `${x} ${y}`).join(" L")
export const closed = (points: Pt[]) => `M${line(points)}Z`
export const open = (points: Pt[]) => `M${line(points)}`
const ring = ([cx, cy]: Pt, r: number) =>
	`M${round(cx - r)} ${cy} A${r} ${r} 0 1 0 ${round(cx + r)} ${cy} A${r} ${r} 0 1 0 ${round(cx - r)} ${cy}Z`

// Animation hooks: a class for site.css and an index that staggers it
export type Anim = { cls?: string; i?: number }
const hook = ({ cls, i }: Anim = {}) =>
	`${cls ? ` class="${cls}"` : ""}${i === undefined ? "" : ` style="--i: ${i}"`}`
export const g = (body: string, anim?: Anim) => `<g${hook(anim)}>${body}</g>`

// Hairlines are 1 wide; site.css keeps them at one screen pixel whatever the drawing's scale
const stroke = (colour: string, width = 1, dash?: string) =>
	`stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ""}`

// A solid: the silhouette filled with the face colour, its inner edges dim, the silhouette bright
const solid = (outline: string, inner: string, tone: Tone = 0, fill = C.face) =>
	`<path d="${outline}" fill="${fill}"/>${inner ? `<path d="${inner}" ${stroke(innerOf(tone))}/>` : ""}<path d="${outline}" ${stroke(edgeOf(tone))}/>`

// Convex hull (monotone chain): the silhouette of a shape and its extruded copy
const hull = (points: Pt[]) => {
	const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
	const cross = (o: Pt, a: Pt, b: Pt) =>
		(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
	const half = (list: Pt[]) => {
		const out: Pt[] = []
		for (const p of list) {
			while (out.length >= 2 && cross(out[out.length - 2] as Pt, out[out.length - 1] as Pt, p) <= 0)
				out.pop()
			out.push(p)
		}
		return out.slice(0, -1)
	}
	return [...half(sorted), ...half([...sorted].reverse())]
}

// The part of a closed outline that faces the viewer: leftmost to rightmost point, through the lowest
const front = (points: Pt[]) => {
	const pick = (better: (a: Pt, b: Pt) => boolean) =>
		points.reduce((best, p, k) => (better(p, points[best] as Pt) ? k : best), 0)
	const left = pick((a, b) => a[0] < b[0])
	const right = pick((a, b) => a[0] > b[0])
	const lowest = points[pick((a, b) => a[1] > b[1])] as Pt
	const walk = (from: number, to: number) => {
		const out: Pt[] = [points[from] as Pt]
		for (let k = from; k !== to; ) {
			k = (k + 1) % points.length
			out.push(points[k] as Pt)
		}
		return out
	}
	const one = walk(left, right)
	return one.includes(lowest) ? one : walk(right, left)
}

// The edges of a face that are not on the silhouette, as one path
const innerEdges = (face: Pt[], outline: Pt[]) => {
	const key = (a: Pt, b: Pt) => `${a}|${b}`
	const rim = new Set(
		outline.flatMap((a, k) => {
			const b = outline[(k + 1) % outline.length] as Pt
			return [key(a, b), key(b, a)]
		}),
	)
	let d = ""
	let last: Pt | undefined
	face.forEach((a, k) => {
		const b = face[(k + 1) % face.length] as Pt
		if (rim.has(key(a, b))) return
		d += `${last === a ? "" : ` M${a.join(" ")}`} L${b.join(" ")}`
		last = b
	})
	return d.trim()
}

// A rounded rectangle in the ground plane (x along one axis, z along the other)
const rounded = (x: number, z: number, w: number, d: number, r: number): Plane => {
	if (r <= 0)
		return [
			[x + w, z],
			[x + w, z + d],
			[x, z + d],
			[x, z],
		]
	const corners: [number, number, number][] = [
		[x + w - r, z + r, -90],
		[x + w - r, z + d - r, 0],
		[x + r, z + d - r, 90],
		[x + r, z + r, 180],
	]
	return corners.flatMap(([cx, cz, start]) =>
		[0, 1, 2, 3, 4, 5, 6].map((k) => {
			const a = ((start + k * 15) * Math.PI) / 180
			return [cx + r * Math.cos(a), cz + r * Math.sin(a)] as [number, number]
		}),
	)
}

export class Iso {
	constructor(
		readonly width: number,
		readonly height: number,
		private ox: number,
		private oy: number,
		private k = 1,
	) {}

	// Grid units to the screen; k scales the drawing, never the line weights
	p = (x: number, y: number, z: number): Pt => [
		round(this.ox + (x - z) * COS * this.k),
		round(this.oy + ((x + z) / 2 - y) * this.k),
	]

	svg = (body: string) =>
		`<svg viewBox="0 0 ${this.width} ${this.height}" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`

	// A rounded volume standing on its base at height y: the silhouette, and the front edge of its
	// top face set in by the bevel, the way a softened edge catches the light
	private volume(
		x: number,
		z: number,
		w: number,
		d: number,
		y: number,
		h: number,
		r: number,
		bevel: number,
		tone: Tone,
		fill: string,
	) {
		const shape = rounded(x, z, w, d, r)
		const top = shape.map(([px, pz]) => this.p(px, y + h, pz))
		const base = shape.map(([px, pz]) => this.p(px, y, pz))
		const b = Math.min(bevel, w / 3, d / 3)
		const rim = rounded(x + b, z + b, w - 2 * b, d - 2 * b, Math.max(r - b, 0)).map(([px, pz]) =>
			this.p(px, y + h - b * 0.3, pz),
		)
		// A sharp volume also shows its front vertical edge
		const corner = r > 0 ? "" : ` ${open([this.p(x + w, y + h, z + d), this.p(x + w, y, z + d)])}`
		return solid(closed(hull([...top, ...base])), `${open(front(rim))}${corner}`, tone, fill)
	}

	// A thin plate lying on the grid, its top face at y: a slab, a step, a tray
	plate({
		x,
		z,
		w,
		d,
		y = 0,
		t = 5,
		r = 3,
		fill = C.face,
		tone = 0,
		bevel,
		...anim
	}: {
		x: number
		z: number
		w: number
		d: number
		y?: number
		t?: number
		r?: number
		fill?: string
		tone?: Tone
		bevel?: number
	} & Anim) {
		const rr = Math.min(r, w / 2, d / 2)
		return g(this.volume(x, z, w, d, y - t, t, rr, bevel ?? 2.5, tone, fill), anim)
	}

	// Any flat shape in the ground plane, given as [x, z] corners, extruded like a plate
	slab(
		shape: Plane,
		{
			y = 0,
			t = 4,
			fill = C.face,
			tone = 0,
			...anim
		}: { y?: number; t?: number; fill?: string; tone?: Tone } & Anim = {},
	) {
		const top = shape.map(([px, pz]) => this.p(px, y, pz))
		const bottom = shape.map(([px, pz]) => this.p(px, y - t, pz))
		return g(solid(closed(hull([...top, ...bottom])), open(front(top)), tone, fill), anim)
	}

	// Grid lines on a plate's top face. The look has no floor grids: kept for older scenes
	grid({
		x,
		z,
		w,
		d,
		y = 0,
		step = 20,
		inset = 8,
	}: {
		x: number
		z: number
		w: number
		d: number
		y?: number
		step?: number
		inset?: number
	}) {
		const lines: string[] = []
		for (let u = x + inset + step; u < x + w - inset; u += step)
			lines.push(open([this.p(u, y, z + inset), this.p(u, y, z + d - inset)]))
		for (let v = z + inset + step; v < z + d - inset; v += step)
			lines.push(open([this.p(x + inset, y, v), this.p(x + w - inset, y, v)]))
		return `<path d="${lines.join(" ")}" ${stroke(C.grid, 0.6)}/>`
	}

	// A block standing at height y with softened edges (r rounds its corners, 0 keeps them sharp).
	// reflect mirrors that fraction of its height below it, very faintly, as on a polished floor.
	// top, left and right are the older per-face fills: every face is the background now
	box({
		x,
		y,
		z,
		w,
		h,
		d,
		r,
		bevel,
		tone = 0,
		reflect = 0,
		top: _top,
		left: _left,
		right: _right,
		...anim
	}: {
		x: number
		y: number
		z: number
		w: number
		h: number
		d: number
		r?: number
		bevel?: number
		tone?: Tone
		reflect?: number
		top?: string
		left?: string
		right?: string
	} & Anim) {
		const rr = Math.min(r ?? Math.min(w, d) * 0.05, w / 2, d / 2)
		const ghost = reflect
			? `<path d="${closed(hull(rounded(x, z, w, d, rr).flatMap(([px, pz]) => [this.p(px, y, pz), this.p(px, y - h * reflect, pz)])))}" ${stroke(C.grid)}/>`
			: ""
		return g(
			ghost + this.volume(x, z, w, d, y, h, rr, bevel ?? Math.min(w, d, h) * 0.1, tone, C.face),
			anim,
		)
	}

	// A small connector node, like the masters' ports
	node = (x: number, y: number, z: number, anim?: Anim) =>
		this.box({ x: x - 5, y, z: z - 5, w: 10, h: 3, d: 10, ...anim })

	// A cylinder standing on the grid (a database)
	cylinder({
		x,
		y,
		z,
		r,
		h,
		rings = 2,
		tone = 0,
		...anim
	}: {
		x: number
		y: number
		z: number
		r: number
		h: number
		rings?: number
		tone?: Tone
	} & Anim) {
		const [cx, by] = this.p(x, y, z)
		const ty = this.p(x, y + h, z)[1]
		const rx = round(r * Math.sqrt(1.5) * this.k)
		const ry = round(r * Math.SQRT1_2 * this.k)
		const [l, rr] = [round(cx - rx), round(cx + rx)]
		const arc = (yy: number) => `M${l} ${yy} A${rx} ${ry} 0 0 0 ${rr} ${yy}`
		const body = `M${l} ${ty} A${rx} ${ry} 0 0 1 ${rr} ${ty} L${rr} ${by} A${rx} ${ry} 0 0 1 ${l} ${by} Z`
		const bands = Array.from({ length: rings }, (_, k) =>
			arc(round(ty + ((k + 1) * (by - ty)) / (rings + 1))),
		).join(" ")
		return g(
			solid(body, arc(ty), tone) +
				(rings ? `<path d="${bands}" ${stroke(innerOf(Math.min(tone + 1, 3) as Tone))}/>` : ""),
			anim,
		)
	}

	// A sheet of paper lying flat, with lines of text
	sheet({
		x,
		y,
		z,
		w = 34,
		d = 44,
		lines = 4,
		tone = 0,
		...anim
	}: {
		x: number
		y: number
		z: number
		w?: number
		d?: number
		lines?: number
		tone?: Tone
	} & Anim) {
		const text = Array.from({ length: lines }, (_, k) => {
			const v = z + 9 + k * 7
			return open([this.p(x + 6, y, v), this.p(x + w - 6 - (k % 2) * 8, y, v)])
		}).join(" ")
		return g(
			`${this.plate({ x, z, w, d, y, t: 1.5, r: 2, tone })}<path d="${text}" ${stroke(C.guide)}/>`,
			anim,
		)
	}

	// Maps a point on an upright panel (u from its left edge, v down from its top) into the scene.
	// facing "z" panels lie along x and face left-front; "x" panels lie along z and face right-front.
	on = (panel: Panel, u: number, v: number): Pt =>
		panel.facing === "z"
			? this.p(panel.x + u, panel.y + panel.h - v, panel.z)
			: this.p(panel.x, panel.y + panel.h - v, panel.z + panel.w - u)

	// Maps a glyph engraved in a top face into the scene: a runs left to right on screen, b from
	// back to front, in grid units around (x, z) at height y. A circle drawn so lies flat on the face
	flat =
		(x: number, y: number, z: number) =>
		(a: number, b: number): Pt =>
			this.p(x + (a + b) / Math.SQRT2, y, z + (b - a) / Math.SQRT2)

	// Words printed on a panel's face, in its plane (a file name, a heading, a figure on a screen).
	// u, v is the baseline start; size is in grid units, so it scales with the drawing. Keep them to
	// one or two short words a scene, only where the object cannot be named without them
	write(
		panel: Panel,
		u: number,
		v: number,
		words: string,
		{ size = 9, colour = C.route, ...anim }: { size?: number; colour?: string } & Anim = {},
	) {
		const [e, f] = this.on(panel, u, v)
		const k = this.k
		const skew = panel.facing === "z" ? 0.5 : -0.5
		return `<text transform="matrix(${round(COS * k * 1000) / 1000} ${round(skew * k * 1000) / 1000} 0 ${k} ${e} ${f})" font-family="IBM Plex Mono, monospace" font-size="${size}" letter-spacing="${round(size * 0.08)}" fill="${colour}" class="scene-print"${hook(anim)}>${words}</text>`
	}

	// An upright shape given as [u, v] corners on a panel, with the panel's depth behind it
	private extrude(panel: Panel, shape: [number, number][]) {
		const { depth = 4 } = panel
		const back =
			panel.facing === "z" ? { ...panel, z: panel.z - depth } : { ...panel, x: panel.x - depth }
		const face = shape.map(([u, v]) => this.on(panel, u, v))
		const rear = shape.map(([u, v]) => this.on(back, u, v))
		const outline = hull([...face, ...rear])
		return solid(closed(outline), innerEdges(face, outline), panel.tone, panel.fill ?? C.face)
	}

	// An upright panel (a screen, a page, a board) with depth behind its face and rounded corners
	panel(panel: Panel, anim?: Anim) {
		const { w, h, r = 3 } = panel
		return g(this.extrude(panel, rounded(0, 0, w, h, Math.min(r, w / 4, h / 4))), anim)
	}

	// Any upright shape, given as [u, v] corners on a panel, with the panel's depth behind it
	cutout = (panel: Panel, shape: [number, number][], anim?: Anim) =>
		g(this.extrude(panel, shape), anim)

	// A document standing upright: a thin slab with a folded corner and a few faint lines of text
	doc(panel: Panel, { lines = 3, fold, ...anim }: { lines?: number; fold?: number } & Anim = {}) {
		const { w, h } = panel
		const f = fold ?? Math.min(w, h) * 0.24
		const corner = [this.on(panel, w - f, 0), this.on(panel, w - f, f), this.on(panel, w, f)]
		const gap = Math.min(7, (h - f - 8) / Math.max(lines, 1))
		const lengths = Array.from({ length: lines }, (_, k) =>
			round((w - 12) * (k === lines - 1 && lines > 1 ? 0.55 : 1)),
		)
		return g(
			this.extrude({ depth: 1.5, ...panel }, [
				[0, 0],
				[w - f, 0],
				[w, f],
				[w, h],
				[0, h],
			]) +
				`<path d="${open(corner)}" ${stroke(innerOf(panel.tone))}/>` +
				this.text(panel, 6, f + 6, lengths, { gap, colour: innerOf(panel.tone) }),
			anim,
		)
	}

	// A rectangle drawn on a panel's face
	rect(
		panel: Panel,
		u: number,
		v: number,
		w: number,
		h: number,
		fill = C.face,
		outline = C.guide,
		anim?: Anim,
	) {
		const points = [
			this.on(panel, u, v),
			this.on(panel, u + w, v),
			this.on(panel, u + w, v + h),
			this.on(panel, u, v + h),
		]
		return `<path d="${closed(points)}" fill="${fill}" ${stroke(outline)}${hook(anim)}/>`
	}

	// Lines of text on a panel's face: each one its own path, so they can type in. Only animated lines
	// are measured (pathLength), the rest stay hairlines like every other edge. Measured lines cannot
	// be non-scaling (that breaks the pathLength dash), so they default to a width that comes to
	// about one device pixel at 2x on both canvas sizes
	text(
		panel: Panel,
		u: number,
		v: number,
		lengths: number[],
		{
			gap = 9,
			colour = C.seam,
			width,
			...anim
		}: { gap?: number; colour?: string; width?: number } & Anim = {},
	) {
		const measured = anim.cls ? ' pathLength="1"' : ""
		const weight = width ?? (anim.cls && this.width === 640 ? 0.55 : 1)
		return lengths
			.map((length, k) =>
				length
					? `<path d="${open([this.on(panel, u, v + k * gap), this.on(panel, u + length, v + k * gap)])}"${measured} ${stroke(colour, weight)}${hook({ cls: anim.cls, i: (anim.i ?? 0) + k })}/>`
					: "",
			)
			.join("")
	}

	// Path data for a straight run through grid points, with rounded corners
	wirePath(points: [number, number, number][], radius = 8) {
		const screen = points.map(([x, y, z]) => this.p(x, y, z))
		let d = `M${(screen[0] as Pt).join(" ")}`
		for (let k = 1; k < screen.length - 1; k++) {
			const [a, b, c] = [screen[k - 1] as Pt, screen[k] as Pt, screen[k + 1] as Pt]
			const ab = Math.hypot(b[0] - a[0], b[1] - a[1])
			const bc = Math.hypot(c[0] - b[0], c[1] - b[1])
			const r = Math.min(radius, ab / 2, bc / 2)
			const inPt = [b[0] - ((b[0] - a[0]) / ab) * r, b[1] - ((b[1] - a[1]) / ab) * r].map(round)
			const outPt = [b[0] + ((c[0] - b[0]) / bc) * r, b[1] + ((c[1] - b[1]) / bc) * r].map(round)
			d += ` L${inPt.join(" ")} Q${b.join(" ")} ${outPt.join(" ")}`
		}
		return `${d} L${(screen[screen.length - 1] as Pt).join(" ")}`
	}

	// Path data for a smooth curve through grid points (Catmull-Rom)
	curvePath(points: [number, number, number][]) {
		const s = points.map(([x, y, z]) => this.p(x, y, z))
		let d = `M${(s[0] as Pt).join(" ")}`
		for (let k = 0; k < s.length - 1; k++) {
			const p0 = (s[k - 1] ?? s[k]) as Pt
			const p1 = s[k] as Pt
			const p2 = s[k + 1] as Pt
			const p3 = (s[k + 2] ?? s[k + 1]) as Pt
			const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6].map(round)
			const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6].map(round)
			d += ` C${c1.join(" ")} ${c2.join(" ")} ${p2.join(" ")}`
		}
		return d
	}

	// A route drawn along path data: a thin, faint line
	route = (
		d: string,
		{
			colour = C.seam,
			width = 1,
			dash,
			...anim
		}: { colour?: string; width?: number; dash?: string } & Anim = {},
	) =>
		// draw animates stroke-dasharray as a fraction of the path, so it needs pathLength
		`<path d="${d}"${anim.cls === "draw" ? ' pathLength="1"' : ""} ${stroke(colour, width, dash)}${hook(anim)}/>`

	// A small bright dot that travels along path data, above whatever it passes (site.css moves it)
	travel = (d: string, i = 0, cls = "flow") =>
		`<path d="${d}" pathLength="100" class="${cls}" style="--i: ${i}" ${stroke(C.activity, this.width === 640 ? 3.5 : 6)} stroke-dasharray="0.1 99.9" stroke-dashoffset="100"/>`

	// A faint dashed vertical guide between two heights, joining layers that have come apart
	guide = (x: number, z: number, from: number, to: number) =>
		`<path d="${open([this.p(x, from, z), this.p(x, to, z)])}" ${stroke(C.guide, 1, "2 3")}/>`

	// The agent mark: a small square grid of dots, the sign of an AI agent wherever one works. It lies
	// on a top face, centred on (x, z) at height y; a few dots are brighter, and with motion they shimmer
	agent = ({
		x,
		y,
		z,
		n = 5,
		gap = 2.4,
		dot,
		...anim
	}: Mark & { x: number; y: number; z: number }) =>
		this.dots((a, b) => this.p(x + a, y, z + b), n, gap, dot, anim)

	// The agent mark on an upright panel's face (a console, a screen), centred on u, v
	agentOn = (panel: Panel, u: number, v: number, { n = 5, gap = 2.4, dot, ...anim }: Mark = {}) =>
		this.dots((a, b) => this.on(panel, u + a, v + b), n, gap, dot, anim)

	private dots(at: (a: number, b: number) => Pt, n: number, gap: number, dot = 0.55, anim: Anim) {
		const half = ((n - 1) * gap) / 2
		const r = round(Math.max(dot * this.k, 0.4))
		const cells = Array.from({ length: n * n }, (_, k) => {
			const [a, b] = [k % n, Math.floor(k / n)]
			const [cx, cy] = at(a * gap - half, b * gap - half)
			// A few bright dots, scattered rather than in a row
			const lit = ((a + 1) * (b + 2) * 7) % 11 < 3
			return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${lit ? C.activity : C.seam}" class="shimmer" style="--i: ${(a * 5 + b * 3) % 9}"/>`
		})
		return g(cells.join(""), anim)
	}

	// A person: head and shoulders standing on the grid
	person(x: number, y: number, z: number, { tone = 0, ...anim }: Anim & { tone?: Tone } = {}) {
		const [bx, by] = this.p(x, y, z)
		const k = this.k
		const at = (dx: number, dy: number) => `${round(bx + dx * k)} ${round(by + dy * k)}`
		const body = `M${at(-9, 0)} L${at(-9, -13)} Q${at(-9, -21)} ${at(0, -21)} Q${at(9, -21)} ${at(9, -13)} L${at(9, 0)} A${round(9 * k)} ${round(5.2 * k)} 0 0 1 ${at(-9, 0)} Z`
		return g(
			solid(body, "", tone) + solid(ring([bx, round(by - 30 * k)], round(7 * k)), "", tone),
			anim,
		)
	}

	// A check mark centred on a screen point
	check = ([x, y]: Pt, anim?: Anim) =>
		`<path d="M${round(x - 4)} ${y} L${round(x - 1.2)} ${round(y + 3)} L${round(x + 4.5)} ${round(y - 3.5)}" ${stroke(C.activity, 1.2)}${hook(anim)}/>`

	// A callout: a dot on the object, a hairline to the label, the label in mono capitals. The look
	// has no callouts (the copy beside a scene explains it): kept so older scenes still build
	label(
		text: string,
		at: Pt,
		to: Pt,
		{
			anchor = "start",
			size = 18,
			...anim
		}: { anchor?: "start" | "end" | "middle"; size?: number } & Anim = {},
	) {
		const dx = anchor === "end" ? -6 : anchor === "start" ? 6 : 0
		return g(
			`<path d="${open([at, to])}" ${stroke(C.guide)}/><circle cx="${at[0]}" cy="${at[1]}" r="2" fill="${C.seam}"/><text x="${round(to[0] + dx)}" y="${round(to[1] + size * 0.28)}" text-anchor="${anchor}" class="scene-label" fill="${C.label}" font-family="IBM Plex Mono, monospace" font-size="${size}" letter-spacing="${round(size * 0.14)}">${text}</text>`,
			{ cls: anim.cls ?? "a-in", i: anim.i },
		)
	}
}

// The agent mark's size: n dots a side, gap between them and the dot radius in grid units
type Mark = { n?: number; gap?: number; dot?: number } & Anim

export type Panel = {
	x: number
	y: number
	z: number
	w: number
	h: number
	facing: "x" | "z"
	depth?: number
	fill?: string
	// Corner radius of a panel (not of a cutout or doc), in grid units
	r?: number
	tone?: Tone
}
