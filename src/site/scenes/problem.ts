import { C, closed, g, Iso, open, type Panel } from "./iso"

// The corners of an empty cell, from its top left
const GAP: [number, number][] = [
	[3, 2.5],
	[19.7, 2.5],
	[19.7, 8.5],
	[3, 8.5],
]

// The spreadsheet the decision depends on: a title, a grid of three by three cells, two of them
// left empty
const spreadsheet = (s: Iso) => {
	const sheet: Panel = { x: 162, y: 0, z: -12, w: 84, h: 70, facing: "z", depth: 3, r: 4, tone: 1 }
	const [left, right, head, foot] = [8, 76, 20, 53]
	const col = (c: number) => left + c * 22.7
	const row = (r: number) => head + r * 11
	const rules = [0, 1, 2, 3]
		.flatMap((k) => [
			open([s.on(sheet, left, row(k)), s.on(sheet, right, row(k))]),
			open([s.on(sheet, col(k), head), s.on(sheet, col(k), foot)]),
		])
		.join(" ")
	const empty = new Set([4, 8])
	const cells = Array.from({ length: 9 }, (_, k) => {
		const [u, v] = [col(k % 3), row(Math.floor(k / 3))]
		if (!empty.has(k)) return s.text(sheet, u + 4, v + 5.5, [12])
		// A missing value: the cell's outline, dashed
		const gap = GAP.map(([a, b]) => s.on(sheet, u + a, v + b))
		return s.route(closed(gap), { colour: C.route, dash: "2 2", cls: "blink" })
	}).join("")
	return g(
		s.panel(sheet) +
			s.text(sheet, left, 10, [28], { colour: C.route }) +
			s.route(rules, { colour: C.guide }) +
			cells,
		{ cls: "a-in", i: 1 },
	)
}

// The decision: a block with a question mark engraved in its top face
const decision = (s: Iso) => {
	const block = { x: 198, y: 0, z: 18, w: 36, h: 30, d: 36 }
	const on = s.flat(block.x + block.w / 2, block.y + block.h, block.z + block.d / 2)
	const curl = Array.from({ length: 13 }, (_, k) => {
		const angle = Math.PI + (k / 12) * Math.PI * 1.5
		return on(7 * Math.cos(angle), -5 + 7 * Math.sin(angle))
	})
	const question = `${open([...curl, on(0, 5)])} ${open([on(0, 9.8), on(0, 11)])}`
	return g(s.box({ ...block, r: 2 }) + s.route(question, { colour: C.outline }), {
		cls: "a-in",
		i: 4,
	})
}

// 01 Problem: the business as it runs today. Three steps of a process: the paperwork that comes
// in, the people who handle it, and a decision with a question mark on it, because the
// spreadsheet that should inform it has gaps. A request moves along the steps and, when the
// answer is no, goes back.
export const problem = () => {
	const s = new Iso(640, 440, 195, 113, 1.45)
	const step = (x: number, i: number) =>
		s.plate({ x, z: 0, w: 66, d: 66, t: 4, r: 3, tone: 1, cls: "a-in", i })

	// The paperwork: documents filed upright, each further one a step dimmer
	const doc = (x: number, z: number, tone: 0 | 1 | 2): Panel => ({
		x,
		y: 0,
		z,
		w: 26,
		h: 34,
		facing: "z",
		tone,
	})
	const papers = g(
		s.doc(doc(26, 20, 2)) + s.doc(doc(20, 32, 1)) + s.doc(doc(14, 44, 0), { lines: 4 }),
		{ cls: "a-in", i: 2 },
	)

	// The people who handle it
	const people = g(s.person(134, 0, 14, { tone: 1 }) + s.person(114, 0, 44), {
		cls: "a-in",
		i: 3,
	})

	// The request travels the steps; the way back, when the answer is no, is dashed: it leaves the
	// decision block and runs across the plates just behind the forward lane, back to the people
	const lane = 58
	const forward = s.wirePath([
		[28, 0, lane],
		[215, 0, lane],
	])
	const back = s.wirePath([
		[198, 0, 48],
		[132, 0, 48],
		[132, 0, lane],
	])
	const routes =
		s.route(forward, { cls: "a-in", i: 5 }) +
		s.route(back, { colour: C.guide, dash: "3 4", cls: "a-in", i: 6 })

	return s.svg(
		spreadsheet(s) +
			step(0, 0) +
			step(92, 1) +
			step(184, 2) +
			routes +
			papers +
			people +
			decision(s) +
			s.travel(forward, 0),
	)
}
