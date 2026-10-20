import { C, open, type Pt } from "./iso"

// Hero: the loop symbol as a technical drawing, in the lockup's own coordinates (the viewBox of
// public/brand/logo-black.svg), so it lies exactly over the lockup at any size. The symbol is cut
// from a triangle on a lattice of 60° lines whose unit is the width of its bars: a pen traces the
// loop and the lattice spreads out from it, finest around the symbol and coarser further right.
// Phones also get the symbol drawn three times larger above the lockup, centred over it on the
// same lattice.
// site.css times the pen in the symbol's units, so it keeps one speed throughout and both
// drawings close together.

const U = 33.874
const H = (U * Math.sqrt(3)) / 2
// The bottom left corner of the triangle the symbol is cut from, seven units a side
const X0 = 41.563
const Y0 = 268.381

const round = (n: number) => Math.round(n * 10) / 10
// A lattice point: j units along the base, k rows up
const node = (j: number, k: number): Pt => [round(X0 + (j + k / 2) * U), round(Y0 - k * H)]

// Strokes are lattice points as j, k pairs, drawn at a scale from a corner
type Placing = { j: number; k: number; s: number }
const SMALL: Placing = { j: 0, k: 0, s: 1 }
const LARGE: Placing = { j: 6, k: 10, s: 3 }
const path = (stroke: number[], { j, k, s }: Placing = SMALL) =>
	open(
		Array.from({ length: stroke.length / 2 }, (_, n) =>
			node(j + s * (stroke[2 * n] ?? 0), k + s * (stroke[2 * n + 1] ?? 0)),
		),
	)

// The symbol: its outline from the top left corner clockwise, and three bends that each leave
// the outline as the pen passes, six units long, so all four strokes end together
const OUTLINE = [0, 6, 1, 6, 6, 1, 6, 0, 1, 0, 0, 1, 0, 6]
const BENDS = [
	{ at: 0, stroke: [0, 6, 4, 2, 2, 2] },
	{ at: 6, stroke: [6, 1, 2, 1, 2, 3] },
	{ at: 12, stroke: [1, 0, 1, 4, 3, 2] },
]

// The lattice has rising and falling lines only, ruled at four spacings, coarsest first: every
// ninth unit, every third, every unit and every half unit. Each spacing draws only the lines the
// coarser ones lack. The falling lines are offset so the coarse lines cross at the symbol's apex
// (j 0, k 7)
type Family = 0 | 1
const SLOPES: Pt[] = [
	[0.5, -Math.sqrt(3) / 2],
	[-0.5, -Math.sqrt(3) / 2],
]
const SPACINGS = [
	{ step: 9, fall: 7 },
	{ step: 3, fall: 1 },
	{ step: 1, fall: 0 },
	{ step: 0.5, fall: 0 },
]
const ruled = (n: number, step: number, phase: number) => {
	const at = (n - phase) / step
	return Math.abs(at - Math.round(at)) < 1e-6
}

// One line of the lattice through the base point n, clipped to the circle (empty if it misses it)
const ruling = ([cx, cy]: Pt, radius: number, family: Family, n: number) => {
	const [dx, dy] = SLOPES[family] as Pt
	const [px, py] = node(n, 0)
	const b = (px - cx) * dx + (py - cy) * dy
	const reach = b * b - ((px - cx) ** 2 + (py - cy) ** 2 - radius ** 2)
	if (reach <= 0) return ""
	const end = (s: number) => `${round(px + (s - b) * dx)} ${round(py + (s - b) * dy)}`
	return `M${end(-Math.sqrt(reach))} L${end(Math.sqrt(reach))}`
}

const lattice = (center: Pt, radius: number, spacing: number) => {
	const { step, fall } = SPACINGS[spacing] as (typeof SPACINGS)[number]
	const coarser = SPACINGS[spacing - 1]
	const d: string[] = []
	for (const family of [0, 1] as const) {
		const phase = family ? fall : 0
		for (let n = phase - 90; n <= 90; n += step)
			if (!coarser || !ruled(n, coarser.step, family ? coarser.fall : 0))
				d.push(ruling(center, radius, family, n))
	}
	return d.join("")
}

// Lines along which a pulse of light travels now and then, a short stretch of brighter line: lines
// every third unit, the symbol's right side among them
const PULSES: [Family, number][] = [
	[0, 3],
	[1, 13],
	[0, 21],
	[1, 7],
	[0, 12],
	[1, 22],
	[0, 30],
	[1, 31],
]

const everywhere = `maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000"`
const pen = (d: string, at: number, length: number) =>
	`<path d="${d}" class="loop__pen" style="--at: ${at}; --for: ${length}" pathLength="1" stroke="#fff" stroke-width="10"/>`

// One drawing of the symbol; the pens that reveal it go in the mask
const drawing = (placing: Placing, cls = "") => {
	const strokes = [
		{ at: 0, stroke: OUTLINE, length: 18 },
		...BENDS.map((b) => ({ ...b, length: 6 })),
	]
	const art = `<path${cls ? ` class="${cls}"` : ""} d="${strokes.map(({ stroke }) => path(stroke, placing)).join("")}" stroke="${C.outline}"/>`
	const pens = strokes
		.map(({ at, stroke, length }) => pen(path(stroke, placing), at, length))
		.join("")
	return { art, pens }
}

// Each spacing shows through a soft-edged mask that spreads from the symbol, the finer ones
// staying closer to it, so the lattice loses detail towards the right; on phones the two
// coarse ones spread around the large drawing instead
const sheet = (id: string, shapes: string) => `<mask id="${id}" ${everywhere}>${shapes}</mask>`
const spread = ([cx, cy]: Pt, rx: number, ry: number, cls = "") =>
	`<ellipse class="loop__spread${cls && ` ${cls}`}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#loop-fade)"/>`

export const loop = () => {
	const small = node(7 / 3, 7 / 3)
	const large = node(13, 17)
	const right = (dx: number, dy = 0): Pt => [small[0] + dx, small[1] + dy]
	const one = drawing(SMALL, "loop__symbol")
	const three = drawing(LARGE, "loop__large")
	const tiers = [
		{ at: right(1100, 80), rx: 1900, ry: 620, phone: 1500, tone: C.guide },
		{ at: right(600, 40), rx: 1300, ry: 520, phone: 1000, tone: C.guide },
		{ at: right(250), rx: 760, ry: 400, phone: 0, tone: C.guide },
		{ at: small, rx: 320, ry: 260, phone: 0, tone: C.grid },
	]
	const masks = tiers
		.map(({ at, rx, ry, phone }, i) =>
			sheet(
				`loop-tier-${i}`,
				phone
					? spread(at, rx, ry, "loop__small") + spread(large, phone, phone, "loop__large")
					: spread(at, rx, ry),
			),
		)
		.join("")
	// A band of light crosses the lines every third unit now and then, at the angle of the rising
	// lines: those lines again, brighter, seen only through the band. It waits off the sheet, so
	// without motion the lattice is still
	const thirds = tiers[1] as (typeof tiers)[number]
	const shine = `<linearGradient id="loop-band"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="loop-shine" ${everywhere}><g transform="rotate(30 ${thirds.at[0]} ${thirds.at[1]})"><rect class="loop__shine" x="-3000" y="-4000" width="500" height="8000" fill="url(#loop-band)"/></g></mask>`
	const pulses = PULSES.map(
		([family, n], i) =>
			`<path d="${ruling(thirds.at, 1000, family, n)}" class="loop__pulse" style="--i: ${i}" pathLength="1" stroke="${C.route}"/>`,
	).join("")
	const grid = tiers
		.map(({ at, rx, tone }, i) => {
			const d = lattice(at, rx, i)
			const extra =
				i === 1 ? `<path d="${d}" mask="url(#loop-shine)" stroke="${C.seam}"/>${pulses}` : ""
			return `<g mask="url(#loop-tier-${i})"${i > 1 ? ` class="loop__fine"` : ""}><path d="${d}" class="loop__rule${i > 2 ? " loop__rule--fine" : ""}" stroke="${tone}"/>${extra}</g>`
		})
		.join("")
	const defs = `<defs><radialGradient id="loop-fade"><stop offset="0" stop-color="#fff"/><stop offset="0.4" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>${masks}<mask id="loop-pen" ${everywhere}>${one.pens}${three.pens}</mask>${shine}</defs>`
	return `<svg viewBox="53.4 87.9 1443.2 185" fill="none" xmlns="http://www.w3.org/2000/svg">${defs}${grid}<g mask="url(#loop-pen)">${one.art}${three.art}</g></svg>`
}
