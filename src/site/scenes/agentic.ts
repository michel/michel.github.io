import { C, g, Iso, open, type Panel } from "./iso"

type Field = { u: number; v: number; w: number; h: number; length: number }

// The invoice, the agent's console, the finance system and the result the person reviews
const page: Panel = { x: 4, y: 0, z: 30, w: 30, h: 42, facing: "z", tone: 1 }
const screen: Panel = { x: 56, y: 0, z: 18, w: 58, h: 46, facing: "z", depth: 4, r: 4 }
const block = { x: 134, y: 0, z: 6, w: 22, h: 20, d: 22 }
const result: Panel = { x: 100, y: 0, z: 82, w: 16, h: 19, facing: "z", depth: 2, r: 2 }
// The two fields the agent reads: the supplier at the head of the invoice, the amount at its foot
const FIELDS: Field[] = [
	{ u: 4, v: 9, w: 16, h: 6, length: 10 },
	{ u: 10, v: 29, w: 16, h: 6, length: 10 },
]
// The procedure, as the length of each step
const ROWS = [16, 12, 15, 10]

// Corner brackets around a field: the agent has found it
const brackets = (s: Iso, { u, v, w, h }: Field, i: number) => {
	const a = 2.5
	const corner = (cu: number, cv: number, du: number, dv: number) =>
		open([s.on(page, cu, cv + dv * a), s.on(page, cu, cv), s.on(page, cu + du * a, cv)])
	const d = [
		corner(u, v, 1, 1),
		corner(u + w, v, -1, 1),
		corner(u + w, v + h, -1, -1),
		corner(u, v + h, 1, -1),
	].join(" ")
	return s.route(d, { colour: C.activity, cls: "pop", i })
}

// Recognition: the invoice, a few lines of terms, its supplier and amount found and bracketed
const invoice = (s: Iso) =>
	g(
		s.doc(page, { lines: 0 }) +
			s.text(page, 4, 20, [20, 14], { gap: 4 }) +
			FIELDS.map(
				(f, k) =>
					s.text(page, f.u + 2.5, f.v + f.h / 2, [f.length], { colour: C.route }) +
					brackets(s, f, k),
			).join(""),
		{ cls: "a-in", i: 3 },
	)

// Extraction: the two fields lifted out of the page as cards of the same size, their values writing
const fields = (s: Iso) =>
	FIELDS.map(({ v, w, h, length }, k) => {
		const card: Panel = {
			x: page.x + page.w + 4,
			y: page.h - v - h + 9,
			z: page.z,
			w,
			h,
			facing: "z",
			depth: 1.5,
			r: 1.5,
		}
		const body =
			s.panel(card) + s.text(card, 2.5, h / 2, [length], { colour: C.route, cls: "type", i: 2 + k })
		return g(g(body, { cls: "lift", i: k }), { cls: "a-in", i: 4 + k * 0.5 })
	}).join("")

// The agent at work: its console with the dot grid, and the procedure, four steps that tick in turn
const agent = (s: Iso) => {
	const rows = ROWS.map((length, k) => {
		const v = 11 + k * 9
		return (
			s.rect(screen, 28, v - 3, 6, 6) +
			s.check(s.on(screen, 31, v), { cls: "pop", i: 2 + k }) +
			s.text(screen, 38, v, [length])
		)
	}).join("")
	return g(s.panel(screen) + s.agentOn(screen, 14, 24.5, { gap: 3, dot: 0.7 }) + rows, {
		cls: "a-in",
		i: 5,
	})
}

// The finance system the agent books into: a block, the euro sign in its top face
const finance = (s: Iso) => {
	const on = s.flat(block.x + block.w / 2, block.y + block.h, block.z + block.d / 2)
	const arc = Array.from({ length: 21 }, (_, k) => {
		const angle = ((50 + k * 13) * Math.PI) / 180
		return on(1 + 6.5 * Math.cos(angle), 6.5 * Math.sin(angle))
	})
	const bar = (b: number) => open([on(-7.5, b), on(0.5, b)])
	return g(s.box(block) + s.route(`${open(arc)} ${bar(-1.7)} ${bar(1.7)}`, { colour: C.outline }), {
		cls: "a-in",
		i: 6,
	})
}

// Review: the person beside the result, approved with the last tick
const review = (s: Iso) =>
	g(
		s.panel(result) +
			s.text(result, 3, 4.5, [8]) +
			s.check(s.on(result, 8, 12), { cls: "pop", i: 6 }) +
			s.person(88, 0, 96),
		{ cls: "a-in", i: 7 },
	)

// 01.4 Agentic workflows: an AI agent with one job in the process. An invoice comes in and its
// supplier and amount are recognised; the two fields lift out as cards; the agent, its console
// marked with the dot grid, works through the procedure step by step and hands the work on, the
// booking to the finance system and the result to a person, who reviews it and approves.
export const agentic = () => {
	const s = new Iso(480, 360, 146, 93, 1.9)
	const step = (x: number, z: number, w: number, d: number, i: number) =>
		s.plate({ x, z, w, d, t: 4, r: 3, tone: 1, cls: "a-in", i })

	// The invoice's way into the agent's console, and out of it the fork: on to the finance system
	// and forward to the person
	const read = s.wirePath([
		[16, 0, 31],
		[16, 0, 40],
		[62, 0, 40],
		[62, 0, 19],
	])
	const fork = (to: [number, number, number][]) => s.wirePath([[108, 0, 19], [108, 0, 36], ...to])
	const book = fork([
		[145, 0, 36],
		[145, 0, 29],
	])
	const ask = fork([[108, 0, 80]])
	return s.svg(
		step(0, 18, 46, 30, 0) +
			step(52, 0, 70, 46, 1) +
			step(128, 0, 34, 44, 2) +
			step(70, 54, 50, 52, 3) +
			s.route(`${read} ${book} ${ask}`, { cls: "a-in", i: 8 }) +
			invoice(s) +
			fields(s) +
			agent(s) +
			finance(s) +
			s.travel(read, 0) +
			s.travel(book, 1) +
			// The dot to the person ends behind the result card, so it goes under it
			s.travel(ask, 1.5) +
			review(s),
	)
}
