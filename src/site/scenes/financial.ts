import { C, g, Iso, open, type Panel, type Tone } from "./iso"

// 01.3 Financial systems: amounts that add up, decisions you can trace. A signed lease contract is
// booked as a new row in the ledger, whose rows add up to a checked total, and the portfolio it
// feeds grows. One dot follows the record from the contract, past the ledger, into the portfolio.

const deed: Panel = { x: 6, y: 0, z: 14, w: 24, h: 32, facing: "z", tone: 1 }
const book: Panel = { x: 36, y: 0, z: 12, w: 68, h: 52, facing: "z", depth: 3, r: 3 }
// The ledger's columns: labels from LEFT, a rule at COLUMN, amounts ending at RIGHT and ruled off
// from SUM
const [LEFT, COLUMN, SUM, RIGHT] = [7, 31, 44, 58]

// The contract: a page of terms, signed at the foot
const contract = (s: Iso) => {
	const at = (u: number, v: number) => s.on(deed, u, v).join(" ")
	const signature = `M${at(5, 27)} C${at(6, 22)} ${at(9, 21)} ${at(8.5, 25)} C${at(8, 28)} ${at(11, 28)} ${at(12, 24.5)} C${at(13, 23)} ${at(14, 25)} ${at(15, 26)} L${at(19, 25.5)}`
	return g(
		s.doc(deed, { lines: 2 }) +
			s.route(signature, { colour: C.route }) +
			s.route(open([s.on(deed, 4, 28.5), s.on(deed, 19, 28.5)])),
		{ cls: "a-in", i: 1 },
	)
}

// The ledger: booked rows, a label on the left and its amount on the right, ruled off to a total in
// euros that adds up, underlined twice and checked. The newest row, the lease, writes itself in
const ledger = (s: Iso) => {
	const rule = (v: number, colour: string) =>
		s.route(open([s.on(book, SUM, v), s.on(book, RIGHT, v)]), { colour })
	const amount = (v: number, length: number, anim = {}) =>
		s.text(book, RIGHT - length, v, [length], anim)
	const table = `${open([s.on(book, 5, 11.5), s.on(book, book.w - 5, 11.5)])} ${open([s.on(book, COLUMN, 11.5), s.on(book, COLUMN, 48)])}`
	const rows =
		s.route(table, { colour: C.guide }) +
		s.text(book, LEFT, 7.5, [20], { colour: C.route }) +
		s.text(book, LEFT, 17, [16, 12], { gap: 7 }) +
		amount(17, 10) +
		amount(24, 8)
	const booked =
		s.text(book, LEFT, 31, [14], { cls: "type", i: 1 }) + amount(31, 12, { cls: "type", i: 2 })
	const check = open([s.on(book, 60.5, 40), s.on(book, 62.5, 42.5), s.on(book, 66, 37.5)])
	const total =
		rule(35.5, C.route) +
		s.write(book, COLUMN + 4, 44, "€", { size: 10 }) +
		s.text(book, RIGHT - 13, 40.5, [13], { colour: C.outline }) +
		rule(44, C.outline) +
		rule(46, C.outline) +
		s.route(check, { colour: C.activity, cls: "pop", i: 4 })
	return g(s.panel(book) + rows + booked + total, { cls: "a-in", i: 2 })
}

// The portfolio: holdings as bars, growing towards the newest, which is brightest
const portfolio = (s: Iso) =>
	[16, 26, 38]
		.map((h, k) =>
			s.box({
				x: 124 + k * 12,
				y: 0,
				z: 9,
				w: 9,
				h,
				d: 9,
				tone: (k < 2 ? 1 : 0) as Tone,
				cls: "rise",
				i: 3 + k * 0.5,
			}),
		)
		.join("")

export const financial = () => {
	const s = new Iso(480, 360, 128, 106, 2.0)
	const step = (x: number, w: number, i: number) =>
		s.plate({ x, z: 0, w, d: 34, t: 4, r: 3, tone: 1, cls: "a-in", i })

	// The record's way: from the foot of the contract along the plates, in front of the ledger, to
	// the newest holding
	const lane = s.wirePath([
		[18, 0, 15],
		[18, 0, 25],
		[152.5, 0, 25],
		[152.5, 0, 19],
	])

	return s.svg(
		step(0, 110, 0) +
			step(118, 45, 1) +
			s.route(lane, { cls: "a-in", i: 3 }) +
			contract(s) +
			ledger(s) +
			portfolio(s) +
			s.travel(lane, 0),
	)
}
