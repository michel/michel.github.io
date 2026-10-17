import { C, closed, g, Iso, open, type Panel } from "./iso"

type UV = [number, number]

const board: Panel = { x: 0, y: 12, z: 0, w: 80, h: 38, facing: "z", depth: 3, r: 3, tone: 1 }
const top = { x: 18, y: 14, z: 16, w: 44, d: 84 }

// The architecture on the whiteboard, in marker: an app, a service and a database, joined by one
// line that a dot of data travels along
const sketch = (s: Iso) => {
	const at = (points: UV[]) => points.map(([u, v]) => s.on(board, u, v))
	const node = (u: number, v: number, w: number, h: number) =>
		closed(
			at([
				[u, v],
				[u + w, v],
				[u + w, v + h],
				[u, v + h],
			]),
		)
	const ellipse = (u: number, v: number, from: number, to: number): UV[] =>
		Array.from({ length: 13 }, (_, k) => {
			const t = from + ((to - from) * k) / 12
			return [u + 7 * Math.cos(t), v + 2.4 * Math.sin(t)]
		})
	const database = [
		closed(at(ellipse(64, 14, 0, 2 * Math.PI))),
		open(at([[57, 14], ...ellipse(64, 26, Math.PI, 0), [71, 14]])),
	].join(" ")
	// A level line across the board at v 20, where the nodes join
	const across = (from: number, to: number) => open(at([from, to].map((u): UV => [u, 20])))
	return {
		drawing:
			s.route(`${node(6, 13, 16, 14)} ${node(31, 13, 16, 14)} ${database}`, { colour: C.route }) +
			s.route(`${across(22, 31)} ${across(47, 57)}`) +
			s.text(board, 6, 6, [22]),
		lane: across(14, 64),
	}
}

// The whiteboard on its two posts, a marker tray along its foot, the presenter beside it
const whiteboard = (s: Iso) => {
	const post = (x: number) => s.box({ x, y: 0, z: -2.5, w: 3, h: board.y, d: 3, tone: 1 })
	const { drawing, lane } = sketch(s)
	return {
		group: g(
			post(7) +
				post(70) +
				s.panel(board) +
				drawing +
				s.box({ x: 6, y: board.y - 2, z: 0, w: 68, h: 2, d: 4, tone: 1 }) +
				s.person(94, 0, 12),
			{ cls: "a-in", i: 0 },
		),
		lane,
	}
}

// The table, the requirements on it ticked off one by one
const table = (s: Iso) => {
	const leg = (x: number, z: number) => s.box({ x, y: 0, z, w: 3, h: top.y - 3, d: 3, tone: 2 })
	const [x1, x2, z1, z2] = [top.x + 5, top.x + top.w - 8, top.z + 5, top.z + top.d - 8]
	const sheet = { x: top.x + 11, z: top.z + 8, w: 28, d: 30 }
	const rows = [0, 1, 2].map((k) => sheet.z + 7 + k * 7)
	const lines = rows
		.map((z, k) => open([s.p(sheet.x + 10, top.y + 1, z), s.p(sheet.x + 24 - k * 3, top.y + 1, z)]))
		.join(" ")
	const ticks = rows
		.map((z, k) => s.check(s.p(sheet.x + 5.5, top.y + 1, z), { cls: "pop", i: k }))
		.join("")
	return g(
		leg(x1, z1) +
			leg(x2, z1) +
			leg(x1, z2) +
			leg(x2, z2) +
			s.plate({ ...top, t: 3, r: 3, tone: 1 }) +
			s.plate({ ...sheet, y: top.y + 1, t: 1, r: 1.5 }) +
			s.route(lines) +
			ticks,
		{ cls: "a-in", i: 1 },
	)
}

// Two options for the technology, standing on the table: A, and B, the one chosen
const options = (s: Iso) => {
	const card = (x: number, z: number, tone: 0 | 1): Panel => ({
		x,
		y: top.y,
		z,
		w: 17,
		h: 21,
		facing: "z",
		depth: 2,
		r: 2,
		tone,
	})
	const option = (panel: Panel, letter: string) =>
		s.panel(panel) + s.write(panel, 3.5, 10, letter, { size: 9 }) + s.text(panel, 3.5, 15.5, [10])
	const a = card(top.x + 3, top.z + 58, 1)
	const b = card(top.x + 24, top.z + 58, 0)
	return g(option(a, "A") + option(b, "B") + s.check(s.on(b, 13, 6.5)), { cls: "a-in", i: 2 })
}

// 01.1 Technical consulting: a working session. The architecture sketched on a whiteboard (an app,
// a service, a database) with the presenter beside it; on the table the requirements, ticked off
// one by one, and the two options for the technology, of which B is chosen.
export const consulting = () => {
	const s = new Iso(480, 360, 229, 150, 2.2)
	const { group, lane } = whiteboard(s)
	return s.svg(group + table(s) + options(s) + s.travel(lane, 0))
}
