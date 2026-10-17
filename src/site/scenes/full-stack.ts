import { C, closed, g, Iso, open, type Panel } from "./iso"

type P3 = [number, number, number]
type Block = { x: number; y: number; z: number; w: number; h: number; d: number }

// The stack's layers share one square footprint, pulled apart: the cloud at the bottom, the API in
// the middle, the apps on top. Everything lines up on each layer's diagonal from the left corner to
// the right corner, which runs level across the screen
const SIZE = 56
const MID = 52
const TOP = 118

// The face of a block toward the viewer's left, as a panel to print on
const face = ({ x, y, z, w, h, d }: Block): Panel => ({ x, y, z: z + d, w, h, facing: "z" })

// A point on a layer's diagonal: t from its left corner
const across = (y: number, t: number): P3 => [t, y, SIZE - t]

const layer = (s: Iso, y: number) =>
	s.plate({ x: 0, z: 0, w: SIZE, d: SIZE, y, t: 4, r: 3, tone: 1 })

// Dashed guides at the left and right corners, from a layer down to the one below it
const guides = (s: Iso, from: number, to: number, i: number) =>
	g(s.guide(0, SIZE, from - 4, to) + s.guide(SIZE, 0, from - 4, to), { cls: "a-in", i })

// A faint route along a layer's diagonal, from t to u
const lane = (s: Iso, y: number, t: number, u: number) =>
	s.route(open([s.p(...across(y, t)), s.p(...across(y, u))]))

// Front end: the app in a browser window at the left and on a phone at the right, on the top layer
const frontEnd = (s: Iso) => {
	const browser: Panel = { x: 4, y: TOP, z: 40, w: 36, h: 26, facing: "z", depth: 3, r: 3 }
	const phone: Panel = { x: 44, y: TOP, z: 5, w: 13, h: 22, facing: "x", depth: 2, r: 2.5 }
	return g(
		layer(s, TOP) +
			lane(s, TOP, 0, 16) +
			lane(s, TOP, 44, SIZE) +
			s.panel(browser) +
			s.route(open([s.on(browser, 0, 6), s.on(browser, 36, 6)])) +
			s.rect(browser, 5, 10, 26, 7) +
			s.text(browser, 5, 21, [20, 12], { gap: 3 }) +
			s.panel(phone) +
			s.rect(phone, 2, 4, 9, 14) +
			s.text(phone, 4.5, 2, [4]),
		{ cls: "a-in", i: 2 },
	)
}

// The API on the middle layer, with its name printed on its face, and the CRM plugged in beside
const api = (s: Iso) => {
	const block = { x: 14, y: MID, z: 14, w: 28, h: 14, d: 28 }
	const crm = { x: 76, y: MID, z: -46, w: 26, h: 14, d: 26 }
	const link = open([s.p(...across(MID, SIZE)), s.p(...across(MID, 92))])
	return (
		g(
			layer(s, MID) +
				lane(s, MID, 0, 14) +
				lane(s, MID, 42, SIZE) +
				s.box(block) +
				s.write(face(block), 2.5, 11, "API", { size: 11 }),
			{ cls: "a-in", i: 1 },
		) +
		g(
			s.route(link, { dash: "2 3" }) +
				s.box({ ...crm, tone: 1 }) +
				s.write(face(crm), 2.5, 10, "CRM", { size: 10 }),
			{ cls: "a-in", i: 3 },
		)
	)
}

// A cloud engraved in the bottom layer's top face: three bumps on a flat base, as (a, b, radius)
// in the face, a left to right and b back to front
type Bump = [number, number, number]
const BUMPS: Bump[] = [
	[-5, 0.1, 3.5],
	[0, -1.4, 5],
	[5.5, 0.6, 3],
]
const arc = ([a, b, r]: Bump, from: number, to: number) =>
	Array.from({ length: 7 }, (_, k): [number, number] => {
		const t = ((from + (k / 6) * (to - from)) * Math.PI) / 180
		return [a + r * Math.cos(t), b + r * Math.sin(t)]
	})
// The bumps' upper edge, left to right
const crest = Array.from({ length: 35 }, (_, k): [number, number] => {
	const u = -8.5 + k * 0.5
	const over = BUMPS.filter(([a, , r]) => Math.abs(u - a) <= r)
	return [u, Math.min(...over.map(([a, b, r]) => b - Math.sqrt(r * r - (u - a) ** 2)))]
})
const CLOUD = [...arc(BUMPS[0] as Bump, 90, 180), ...crest, ...arc(BUMPS[2] as Bump, 0, 90)]

// Lines of code in the file, each from its indent u and this long
const CODE: [number, number][] = [
	[4, 10],
	[7, 8],
	[7, 9],
	[4, 3],
]

// The cloud at the bottom: the servers and the database, and the file that defines them as code
// standing beside it
const cloud = (s: Iso) => {
	const slab = (k: number) => s.box({ x: 8, y: k * 7, z: 32, w: 16, h: 6, d: 16 })
	const file: Panel = { x: -38, y: 0, z: 84, w: 22, h: 28, facing: "z" }
	const link = open([s.p(...across(0, -28)), s.p(...across(0, 0))])
	const on = s.flat(42, 0, 42)
	return g(
		layer(s, 0) +
			s.route(closed(CLOUD.map(([a, b]) => on(a, b))), { colour: C.seam }) +
			lane(s, 0, 0, 8) +
			lane(s, 0, 44, SIZE) +
			[0, 1, 2].map(slab).join("") +
			s.cylinder({ x: 44, y: 0, z: 12, r: 8, h: 15 }) +
			s.route(link, { colour: C.guide, dash: "2 3" }) +
			s.doc(file, { lines: 0 }) +
			CODE.map(([u, length], k) => s.text(file, u, 10 + k * 3.5, [length])).join(""),
		{ cls: "a-in", i: 0 },
	)
}

// The request runs down the left from the browser to the API and on to the servers; the answer
// comes back up the right from the database through the API to the phone
const travel = (s: Iso) => {
	const down = [
		across(TOP, 16),
		across(TOP, 0),
		across(MID, 0),
		across(MID, 14),
		across(MID, 0),
		across(0, 0),
		across(0, 8),
	]
	const up = [
		across(0, 50),
		across(0, SIZE),
		across(MID, SIZE),
		across(MID, 42),
		across(MID, SIZE),
		across(TOP, SIZE),
		across(TOP, 44),
	]
	return s.travel(s.wirePath(down, 2), 0) + s.travel(s.wirePath(up, 2), 1.43)
}

// 01.2 Full-stack development: the whole system pulled apart into its layers. The app in a browser
// and on a phone on top, the API that serves them in the middle with a third-party system, a CRM,
// plugged in beside it, and the servers and the database in the cloud at the bottom, defined as
// code in a file. A request runs down from the browser to the servers and the answer comes back up
// to the phone.
export const fullStack = () => {
	const s = new Iso(480, 360, 224, 226, 1.45)
	return s.svg(
		cloud(s) + guides(s, MID, 0, 1) + api(s) + guides(s, TOP, MID, 2) + frontEnd(s) + travel(s),
	)
}
