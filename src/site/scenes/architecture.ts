import { C, closed, g, Iso, open, type Panel, type Tone } from "./iso"

type P3 = [number, number, number]

// Every layer of the stack shares one footprint, a slab T thick. The servers at the bottom are the
// footprint themselves; the layers above stand apart far enough to show what stands on them
const W = 88
const D = 52
const T = 4
const LEVEL = { data: 43, agents: 91, ui: 143 }
// The servers: three units, each U thick, their tops at these heights, the rack's top at RACK
const RACK = 23
const UNITS = [RACK - 17, RACK - 8.5, RACK]
const U = 6
// The external systems' wire comes into the agents' layer along this line, to the agent's back
const LANE = 72

const layer = (s: Iso, y: number, tone: Tone) =>
	s.plate({ x: 0, z: 0, w: W, d: D, y, t: T, r: 3, tone })

// Dashed guides at the outer corners join each layer to the one below it: one footprint, set apart
const guides = (s: Iso) => {
	const gaps: [number, number][] = [
		[RACK, LEVEL.data - T],
		[LEVEL.data, LEVEL.agents - T],
		[LEVEL.agents, LEVEL.ui - T],
	]
	return gaps
		.map(([from, to]) => s.guide(0.9, D - 0.9, from, to) + s.guide(W - 0.9, 0.9, from, to))
		.join("")
}

// Cloud infrastructure: a rack of three server units, each with a drive slot and a status light on
// its front; the middle light blinks
const infrastructure = (s: Iso) => {
	const units = UNITS.map((top, k) => {
		const v = top - U / 2
		const [cx, cy] = s.p(W - 12, v, D)
		const light = `<circle cx="${cx}" cy="${cy}" r="1.1" fill="${C.route}"${k === 1 ? ' class="blink"' : ""}/>`
		const slot = s.route(open([s.p(10, v, D), s.p(34, v, D)]), { colour: C.seam })
		return (
			s.plate({ x: 0, z: 0, w: W, d: D, y: top, t: U, r: 3, tone: k === 2 ? 1 : 2 }) + slot + light
		)
	})
	return g(units.join(""), { cls: "a-in", i: 0 })
}

// The data model: a database, and beside it two tables joined by a relation, set into the layer
const table = (s: Iso, x: number, z: number) => {
	const y = LEVEL.data
	const corners: P3[] = [
		[x, y, z],
		[x + 14, y, z],
		[x + 14, y, z + 12],
		[x, y, z + 12],
	]
	return (
		s.route(closed(corners.map(([a, b, c]) => s.p(a, b, c))), { colour: C.seam }) +
		s.route(open([s.p(x + 4, y, z), s.p(x + 4, y, z + 12)]), { colour: C.guide })
	)
}
const data = (s: Iso) => {
	const y = LEVEL.data
	const relation = s.wirePath(
		[
			[58, y, 33],
			[63, y, 33],
			[63, y, 26],
			[68, y, 26],
		],
		3,
	)
	return g(
		layer(s, y, 1) +
			table(s, 44, 27) +
			table(s, 68, 20) +
			s.route(relation, { colour: C.guide }) +
			s.cylinder({ x: 22, y, z: 39, r: 11, h: 16, tone: 1 }),
		{ cls: "a-in", i: 1 },
	)
}

// External systems beside the stack, level with the agents: a CRM and an ERP on their own plate,
// each named on its face
const system = (s: Iso, x: number, name: string) => {
	const box = { x, y: LEVEL.agents, z: -74, w: 22, h: 22, d: 22, tone: 1 as Tone }
	const face: Panel = { x, y: box.y, z: box.z + box.d, w: box.w, h: box.h, facing: "z" }
	return s.box(box) + s.write(face, 4, 14, name, { size: 7 })
}
const integrations = (s: Iso) =>
	g(
		s.plate({ x: LANE - 15, z: -82, w: 62, d: 46, y: LEVEL.agents, t: T, r: 3, tone: 1 }) +
			system(s, LANE - 11, "CRM") +
			system(s, LANE + 17, "ERP"),
		{ cls: "a-in", i: 3 },
	)

// The AI agents' layer: an agent, a rounded block with the dot grid on its top. The wire from the
// external systems runs into its back, so the travelling dot is drawn before the block
const agents = (s: Iso) => {
	const y = LEVEL.agents
	const block = { x: LANE - 11, y, z: 26, w: 22, h: 18, d: 22 }
	const wire = open([s.p(LANE, y, -52), s.p(LANE, y, block.z)])
	return g(
		layer(s, y, 1) +
			s.route(wire) +
			s.travel(wire, 0) +
			s.box(block) +
			s.agent({ x: block.x + 0.3 * block.w, y: y + block.h, z: block.z + 0.3 * block.d }),
		{ cls: "a-in", i: 2 },
	)
}

// The interfaces people use, on the top layer: a browser window and a phone
const interfaces = (s: Iso) => {
	const screen: Panel = { x: 6, y: LEVEL.ui, z: 20, w: 52, h: 36, facing: "z", depth: 3, r: 4 }
	const phone: Panel = { x: 64, y: LEVEL.ui, z: 38, w: 15, h: 26, facing: "z", depth: 3, r: 3 }
	const bar = (p: Panel, v: number) =>
		s.route(open([s.on(p, 0, v), s.on(p, p.w, v)]), { colour: C.seam })
	const browser =
		s.panel(screen) +
		bar(screen, 7) +
		s.rect(screen, 5, 12, 11, 19) +
		s.rect(screen, 20, 12, 27, 8) +
		s.text(screen, 20, 26, [24, 16], { gap: 5 })
	const mobile =
		s.panel(phone) +
		bar(phone, 5) +
		s.rect(phone, 3.5, 9, 8, 6) +
		s.text(phone, 3.5, 19, [8, 5], { gap: 4 })
	return g(g(layer(s, LEVEL.ui, 1) + browser + mobile, { cls: "lift" }), { cls: "a-in", i: 4 })
}

// 02 Architecture: the system to be built, drawn as an exploded blueprint. A stack of separated
// layers joined by dashed guides: the cloud infrastructure (a rack of servers) at the bottom, the
// data model (a database and its tables), the AI agents (a block with the agent mark) and the
// interfaces people use (a browser window and a phone) on top. Beside the stack, the external
// systems it integrates with, a CRM and an ERP, wired into the agent. Data travels from the CRM to
// the agent, and the top layer drifts a little apart along its guides
export const architecture = () => {
	const s = new Iso(640, 440, 226, 291, 1.46)
	return s.svg(
		guides(s) + infrastructure(s) + data(s) + integrations(s) + agents(s) + interfaces(s),
	)
}
