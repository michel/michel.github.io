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

// Each spacing shows through a soft-edged mask that spreads from where the lattice starts, the
// finer ones staying closer to it, so it loses detail further away. Ids carry the scene's name, as
// the hero and the footer share a page
type Tier = { at: Pt; rx: number; ry: number; spacing: number; tone: string; phone?: [Pt, number] }
const sheet = (id: string, shapes: string) => `<mask id="${id}" ${everywhere}>${shapes}</mask>`
const spread = (name: string, [cx, cy]: Pt, rx: number, ry: number, cls = "") =>
	`<ellipse class="loop__spread${cls && ` ${cls}`}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${name}-fade)"/>`
const fade = (name: string) =>
	`<radialGradient id="${name}-fade"><stop offset="0" stop-color="#fff"/><stop offset="0.4" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`

// The tiers of lattice; extra adds to the lines every third unit (pulses, the shine)
const sheets = (name: string, tiers: Tier[], extra: (rules: string) => string) => {
	const masks = tiers
		.map(({ at, rx, ry, phone }, i) =>
			sheet(
				`${name}-tier-${i}`,
				phone
					? spread(name, at, rx, ry, "loop__small") +
							spread(name, phone[0], phone[1], phone[1], "loop__large")
					: spread(name, at, rx, ry),
			),
		)
		.join("")
	const grid = tiers
		.map(({ at, rx, spacing, tone }, i) => {
			const d = lattice(at, rx, spacing)
			return `<g mask="url(#${name}-tier-${i})"${spacing > 1 ? ` class="loop__fine"` : ""}><path d="${d}" class="loop__rule${spacing > 2 ? " loop__rule--fine" : ""}" stroke="${tone}"/>${spacing === 1 ? extra(d) : ""}</g>`
		})
		.join("")
	return { defs: fade(name) + masks, grid }
}

const pulse = (d: string, i: number) =>
	`<path d="${d}" class="loop__pulse" style="--i: ${i}" pathLength="1" stroke="${C.route}"/>`

// For the quieter echoes: a few lines every third unit that pass close to where the lattice
// starts, spread evenly over the ones that do
const pulsesNear = (center: Pt, radius: number, count: number) => {
	const lines: string[] = []
	for (let n = -90; n <= 90; n++)
		for (const family of [0, 1] as const) {
			if (!ruled(n, 3, family ? 1 : 0)) continue
			const [px, py] = node(n, 0)
			const [dx, dy] = SLOPES[family] as Pt
			if (Math.abs((center[0] - px) * dy - (center[1] - py) * dx) > radius / 2) continue
			lines.push(ruling(center, radius, family, n))
		}
	const every = lines.length / count
	return Array.from({ length: count }, (_, i) =>
		pulse(lines[Math.floor((i + 0.5) * every)] ?? "", i),
	).join("")
}

const LOCKUP = `viewBox="53.4 87.9 1443.2 185" fill="none" xmlns="http://www.w3.org/2000/svg"`
const SYMBOL = node(7 / 3, 7 / 3)
const right = (dx: number, dy = 0): Pt => [SYMBOL[0] + dx, SYMBOL[1] + dy]
const lockupTiers = (phone?: Pt): Tier[] => [
	{
		at: right(1100, 80),
		rx: 1900,
		ry: 620,
		spacing: 0,
		tone: C.guide,
		...(phone && { phone: [phone, 1500] }),
	},
	{
		at: right(600, 40),
		rx: 1300,
		ry: 520,
		spacing: 1,
		tone: C.guide,
		...(phone && { phone: [phone, 1000] }),
	},
	{ at: right(250), rx: 760, ry: 400, spacing: 2, tone: C.guide },
	{ at: SYMBOL, rx: 320, ry: 260, spacing: 3, tone: C.grid },
]

export const loop = () => {
	const large = node(13, 17)
	const one = drawing(SMALL, "loop__symbol")
	const three = drawing(LARGE, "loop__large")
	// A band of light crosses the lines every third unit now and then, at the angle of the rising
	// lines: those lines again, brighter, seen only through the band. It waits off the sheet, so
	// without motion the lattice is still
	const thirds = right(600, 40)
	const shine = `<linearGradient id="loop-band"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="loop-shine" ${everywhere}><g transform="rotate(30 ${thirds[0]} ${thirds[1]})"><rect class="loop__shine" x="-3000" y="-4000" width="500" height="8000" fill="url(#loop-band)"/></g></mask>`
	const pulses = PULSES.map(([family, n], i) => pulse(ruling(thirds, 1000, family, n), i)).join("")
	const { defs, grid } = sheets(
		"loop",
		lockupTiers(large),
		(d) => `<path d="${d}" mask="url(#loop-shine)" stroke="${C.seam}"/>${pulses}`,
	)
	// On phones pulses also run along the large drawing: a lap of its outline and each bend, a
	// little heavier than its lines so they show on them, under a wide faint halo that reads as a
	// glow on a dark ground (site.css). They get an svg of their own, a layer apart, so moving them
	// repaints only them and not the masked lattice beneath
	const tracers = [OUTLINE, ...BENDS.map((b) => b.stroke)]
		.map((stroke, i) => {
			const d = path(stroke, LARGE)
			const at = `pathLength="1" style="--i: ${i}" stroke="${C.activity}" stroke-linecap="round"`
			return `<path d="${d}" class="loop__pulse loop__pulse--symbol loop__halo" ${at} stroke-width="24"/><path d="${d}" class="loop__pulse loop__pulse--symbol" ${at} stroke-width="6"/>`
		})
		.join("")
	return `<svg ${LOCKUP}><defs>${defs}<mask id="loop-pen" ${everywhere}>${one.pens}${three.pens}</mask>${shine}</defs>${grid}<g mask="url(#loop-pen)">${one.art}${three.art}</g></svg><svg class="figure scene scene--loop loop__tracers" aria-hidden="true" focusable="false" ${LOCKUP.replace(/ xmlns="[^"]*"/, "")}><g opacity="0.8">${tracers}</g></svg>`
}

// The footer's lockup and the 404 page: the hero's lattice again, without the drawing or the
// shine, a few pulses only
export const echo = () => {
	const { defs, grid } = sheets("echo", lockupTiers(), () => pulsesNear(right(600, 40), 1000, 4))
	return `<svg ${LOCKUP}><defs>${defs}</defs>${grid}</svg>`
}

// Contact: a patch of lattice spreading from the top right corner, two spacings and three pulses
export const patch = () => {
	const corner: Pt = [866, 0]
	const { defs, grid } = sheets(
		"patch",
		[
			{ at: corner, rx: 560, ry: 360, spacing: 1, tone: C.guide },
			{ at: corner, rx: 280, ry: 190, spacing: 2, tone: C.guide },
		],
		() => pulsesNear(corner, 520, 3),
	)
	return `<svg viewBox="0 0 866 433" fill="none" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${grid}</svg>`
}
