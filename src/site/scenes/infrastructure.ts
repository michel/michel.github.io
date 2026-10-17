import { C, g, Iso, open, type Panel, type Tone } from "./iso"

// A server slab's side and thickness, the gap between slabs in a rack, and how far the top one lifts
const SLAB = 44
const THICK = 10
const GAP = 4
const LIFT = 6

// The code lines of main.tf, as [indent, down from the top, length]: two resource blocks, each a
// keyword and a name, an indented setting and a closing brace (the second name types in)
const CODE: [number, number, number][] = [
	[6, 27, 9],
	[18, 27, 14],
	[12, 33, 20],
	[6, 39, 3],
	[6, 47, 9],
	[12, 53, 16],
	[6, 59, 3],
]

// The code: one file, main.tf, that defines the whole cloud. The name of its second resource
// types in: the file changes like any other code
const codeFile = (s: Iso) => {
	const file: Panel = { x: -24, y: 0, z: -4, w: 48, h: 66, facing: "z" }
	const lines = CODE.map(([u, v, length], k) =>
		s.text(file, u, v, [length], { colour: k % 4 === 0 ? C.route : C.seam }),
	).join("")
	return g(
		s.doc(file, { lines: 0 }) +
			s.write(file, 6, 19, "main.tf", { size: 5.5 }) +
			lines +
			s.text(file, 18, 47, [16], { cls: "type", i: 2 }),
		{ cls: "a-in", i: 1 },
	)
}

// A server: a thin rounded slab standing at height y, with a drive slot and a status light on its
// left front face (the same server as in 05 Production)
const server = (s: Iso, x: number, z: number, y: number, tone: Tone) => {
	const face: Panel = { x, y, z: z + SLAB, w: SLAB, h: THICK, facing: "z" }
	const [lx, ly] = s.on(face, SLAB - 7, THICK / 2)
	const slot = open([s.on(face, 6, THICK / 2), s.on(face, 19, THICK / 2)])
	return (
		s.box({ x, y, z, w: SLAB, h: THICK, d: SLAB, r: 3, tone }) +
		s.route(slot, { colour: tone ? C.guide : C.seam }) +
		`<circle cx="${lx}" cy="${ly}" r="1.3" fill="${tone ? C.seam : C.route}"/>`
	)
}

// An environment: a rack of three servers built bottom up, each lower one a step dimmer, the top one
// lifted on its guides as if it were just being rebuilt. Test and production are the same rack,
// built in the same order
const rack = (s: Iso, cx: number, cz: number) => {
	const [x, z] = [cx - SLAB / 2, cz - SLAB / 2]
	const base = (k: number) => k * (THICK + GAP) + (k === 2 ? LIFT : 0)
	const inset = 0.9
	const corners: [number, number][] = [
		[x + inset, z + SLAB - inset],
		[x + SLAB - inset, z + SLAB - inset],
		[x + SLAB - inset, z + inset],
	]
	const guides = corners.map(([gx, gz]) => s.guide(gx, gz, base(1) + THICK, base(2))).join("")
	return (
		g(server(s, x, z, base(0), 2), { cls: "rise", i: 4 }) +
		g(server(s, x, z, base(1), 1), { cls: "rise", i: 5 }) +
		g(guides + server(s, x, z, base(2), 0), { cls: "rise", i: 6 })
	)
}

// 04 Infrastructure: one file of code, main.tf, builds the cloud. It stands on its own plate at the
// back; two identical environments, test on the left and production on the right, each a rack of
// server slabs, are built from it. A change travels from the file to both at once.
export const infrastructure = () => {
	const s = new Iso(640, 440, 320, 218, 1.5)
	const span = 92
	const plate = (cx: number, cz: number, i: number) =>
		s.plate({ x: cx - 33, z: cz - 33, w: 66, d: 66, t: 4, r: 3, tone: 1, cls: "a-in", i })

	// The routes leave the foot of the file and run over the plates into the back of each rack; the
	// dots stop where the rack's far corner starts to hide the route
	const fork = 8
	const run = (end: number) => [
		s.wirePath([
			[fork, 0, fork],
			[fork, 0, end],
		]),
		s.wirePath([
			[fork, 0, fork],
			[end, 0, fork],
		]),
	]
	const routes = run(span - SLAB / 2)
	const dots = run(fork + span - SLAB)

	return s.svg(
		plate(0, 0, 0) +
			plate(0, span, 1) +
			plate(span, 0, 1) +
			g(routes.map((d) => s.route(d)).join(""), { cls: "a-in", i: 3 }) +
			codeFile(s) +
			rack(s, 0, span) +
			rack(s, span, 0) +
			dots.map((d) => s.travel(d, 0)).join(""),
	)
}
