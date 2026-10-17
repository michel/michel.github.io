import { C, g, Iso, open, type Panel } from "./iso"

// 01.4 Agentic workflows: an AI agent running a standard procedure. An invoice comes in; the
// agent's console, marked with the dot grid, works through the procedure, a short checklist that
// ticks row by row; the amount it read lands in the finance system, and a person approves it.

// The agent's console: the dot grid, then the procedure, four rows that tick one after another.
// The last row is the review, the person's
const screen: Panel = { x: 6, y: 0, z: 26, w: 84, h: 58, facing: "z", depth: 4, r: 4 }
const ROWS = [30, 22, 26, 18]
const block = { x: 114, y: 0, z: 6, w: 28, h: 24, d: 28 }

const tick = (s: Iso, u: number, v: number, i: number) =>
	s.route(
		open([s.on(screen, u, v), s.on(screen, u + 2.2, v + 2.4), s.on(screen, u + 6, v - 2.6)]),
		{
			colour: C.activity,
			cls: "pop",
			i,
		},
	)

const agent = (s: Iso) => {
	const rows = ROWS.map((length, k) => {
		const v = 14 + k * 11
		return s.rect(screen, 34, v - 3, 6, 6) + tick(s, 34.5, v, k) + s.text(screen, 46, v, [length])
	}).join("")
	return g(s.panel(screen) + s.agentOn(screen, 16, 18, { gap: 3, dot: 0.7 }) + rows, {
		cls: "a-in",
		i: 4,
	})
}

// The finance system: a block with the euro sign engraved in its top face, steady
const finance = (s: Iso) => {
	const on = s.flat(block.x + block.w / 2, block.y + block.h, block.z + block.d / 2)
	const arc = Array.from({ length: 11 }, (_, k) => {
		const angle = ((50 + k * 26) * Math.PI) / 180
		return on(1 + 6.5 * Math.cos(angle), 6.5 * Math.sin(angle))
	})
	const bar = (b: number) => open([on(-7.5, b), on(0.5, b)])
	const euro = `${open(arc)} ${bar(-1.7)} ${bar(1.7)}`
	return g(s.box(block) + s.route(euro, { colour: C.outline }), { cls: "a-in", i: 5 })
}

export const agentic = () => {
	const s = new Iso(480, 360, 188, 129, 1.5)
	const plates =
		s.plate({ x: 0, z: 0, w: 92, d: 36, t: 4, r: 3, tone: 1, cls: "a-in", i: 1 }) +
		s.plate({ x: 0, z: 50, w: 44, d: 44, t: 4, r: 3, tone: 1, cls: "a-in", i: 0 }) +
		s.plate({ x: 106, z: 0, w: 68, d: 40, t: 4, r: 3, tone: 1, cls: "a-in", i: 2 })

	// The invoice goes into the agent, behind its console, and comes out to the finance system
	const lane = s.wirePath([
		[40, 0, 80],
		[40, 0, 14],
		[88, 0, 14],
		[88, 0, 30],
		[block.x, 0, 30],
	])
	const invoice = s.doc({ x: 8, y: 0, z: 78, w: 28, h: 38, facing: "z" }, { cls: "a-in", i: 3 })
	return s.svg(
		plates +
			s.route(lane, { cls: "a-in", i: 6 }) +
			s.travel(lane, 0) +
			agent(s) +
			invoice +
			finance(s) +
			s.person(166, 0, 10, { cls: "a-in", i: 6 }),
	)
}
