import { C, g, Iso, open, type Panel, type Tone } from "./iso"

// The servers: three units stacked with small gaps, the top one a little apart on its guides,
// each with a drive slot and a status light on its front
const SERVER = { x: 84, z: 10, w: 34, d: 34, h: 9 }

const servers = (s: Iso) => {
	const { x, z, w, d, h } = SERVER
	const unit = (y: number, tone: Tone) => {
		const face: Panel = { x, y, z: z + d, w, h, facing: "z" }
		const [lx, ly] = s.on(face, w - 6, h / 2)
		return (
			s.box({ x, y, z, w, h, d, r: 3, tone }) +
			s.route(open([s.on(face, 5, h / 2), s.on(face, 15, h / 2)]), {
				colour: tone ? C.guide : C.seam,
			}) +
			`<circle cx="${lx}" cy="${ly}" r="1.1" fill="${tone ? C.seam : C.route}"/>`
		)
	}
	const [low, mid, top] = [0, 11.5, 25]
	const gap = mid + h
	const guides =
		s.guide(x, z + d, gap, top) + s.guide(x + w, z, gap, top) + s.guide(x + w, z + d, gap, top)
	return g(unit(low, 2) + unit(mid, 1) + guides + g(unit(top, 0), { cls: "lift" }), {
		cls: "a-in",
		i: 3,
	})
}

// Monitoring: a screen behind the system with a title, a check that all is well and a steady
// line of traffic that draws itself
const monitor = (s: Iso) => {
	const screen: Panel = { x: 88, y: 0, z: -18, w: 66, h: 54, facing: "z", depth: 3, r: 4, tone: 1 }
	const tick = open([s.on(screen, 50, 6.5), s.on(screen, 53, 9.5), s.on(screen, 59, 3)])
	const trace: [number, number][] = [
		[8, 27],
		[17, 26],
		[25, 28],
		[34, 25],
		[42, 27],
		[50, 25],
		[58, 26],
	]
	const line = trace.map(([u, v]) => s.on(screen, u, v))
	return g(
		s.panel(screen) +
			s.text(screen, 8, 7, [20]) +
			s.route(open([s.on(screen, 6, 14), s.on(screen, 60, 14)]), { colour: C.guide }) +
			s.route(tick, { colour: C.outline }) +
			s.route(open(line), { colour: C.route, cls: "draw", width: 0.55 }),
		{ cls: "a-in", i: 1 },
	)
}

// The handover: the code (indented lines), the infrastructure definitions (blocks) and the
// documentation (plain lines), filed upright, each further one a step dimmer
const documents = (s: Iso) => {
	const doc = (x: number, z: number, tone: Tone): Panel => ({
		x,
		y: 0,
		z,
		w: 22,
		h: 30,
		facing: "z",
		tone,
	})
	const [code, infra, docs] = [doc(198, 6, 2), doc(193, 18, 1), doc(188, 30, 0)]
	// The lines follow each document's tone, as the kit's own lines do
	const [faint, dim] = [
		{ gap: 5, colour: C.grid },
		{ gap: 5, colour: C.seam },
	]
	const lines =
		s.text(code, 5, 12, [10, 0, 0, 8], faint) +
		s.text(code, 9, 12, [0, 8, 5, 0], faint) +
		s.rect(infra, 5, 11, 12, 5, C.face, C.guide) +
		s.rect(infra, 5, 19, 12, 5, C.face, C.guide) +
		s.text(docs, 5, 12, [12, 12, 12, 7], dim)
	return g(
		s.doc(code, { lines: 0 }) + s.doc(infra, { lines: 0 }) + s.doc(docs, { lines: 0 }) + lines,
		{ cls: "a-in", i: 5 },
	)
}

// 05 Production: the system running and handed over. The people who use it send requests to the
// servers and their database, a screen behind them shows all is well, and the code, the
// infrastructure definitions and the documentation stand ready for your team.
export const production = () => {
	const s = new Iso(640, 440, 193, 108, 1.45)
	const plate = (x: number, w: number, i: number) =>
		s.plate({ x, z: 0, w, d: 66, t: 4, r: 3, tone: 1, cls: "a-in", i })

	const users = g(s.person(36, 0, 18, { tone: 1 }) + s.person(19, 0, 44), { cls: "a-in", i: 2 })
	const team = g(s.person(256, 0, 16, { tone: 1 }) + s.person(258, 0, 54), { cls: "a-in", i: 6 })
	const database = s.cylinder({ x: 144, y: 0, z: 20, r: 11, h: 22, cls: "a-in", i: 4 })

	// A request travels from the people to the servers; from the database the lane runs on to the
	// team that takes the system over
	const lane = 56
	const request = s.wirePath([
		[26, 0, lane],
		[101, 0, lane],
		[101, 0, SERVER.z + SERVER.d],
	])
	const handover = s.wirePath([
		[144, 0, 31],
		[144, 0, lane],
		[252, 0, lane],
	])
	const routes = s.route(request, { cls: "a-in", i: 7 }) + s.route(handover, { cls: "a-in", i: 7 })

	return s.svg(
		monitor(s) +
			plate(0, 56, 0) +
			plate(74, 88, 1) +
			plate(180, 88, 2) +
			routes +
			users +
			servers(s) +
			database +
			documents(s) +
			team +
			s.travel(request, 0),
	)
}
