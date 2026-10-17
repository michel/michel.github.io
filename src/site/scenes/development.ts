import { C, g, Iso, open, type Panel } from "./iso"

// The three buttons in a window's title bar: small open circles on the panel's face
const buttons = (s: Iso, panel: Panel, v: number) =>
	[5, 9, 13]
		.map((u) => {
			const [cx, cy] = s.on(panel, u, v)
			return `<circle cx="${cx}" cy="${cy}" r="1.3" fill="${C.face}" stroke="${C.seam}" stroke-width="1"/>`
		})
		.join("")

// A window: the panel, its title bar rule and buttons
const frame = (s: Iso, panel: Panel, bar: number) =>
	s.panel(panel) +
	s.route(open([s.on(panel, 0, bar), s.on(panel, panel.w, bar)]), { colour: C.guide }) +
	buttons(s, panel, bar / 2)

// The code editor the agent writes in: line numbers down the side, indented lines that type in
// one after another, and the cursor after the last one
const editor = (s: Iso) => {
	const panel: Panel = { x: 4, y: 0, z: 6, w: 50, h: 40, facing: "x", depth: 3, r: 4, tone: 1 }
	const code: [number, number][] = [
		[0, 24],
		[6, 20],
		[12, 16],
		[6, 10],
		[0, 6],
	]
	const top = 15
	const gap = 5
	const lines = code
		.map(([indent, length], k) =>
			s.text(panel, 13 + indent, top + k * gap, [length], { cls: "type", i: k }),
		)
		.join("")
	const last = top + (code.length - 1) * gap
	const cursor = s.route(open([s.on(panel, 21, last - 2), s.on(panel, 21, last + 2)]), {
		colour: C.route,
		cls: "blink",
	})
	return g(
		frame(s, panel, 9) +
			s.text(
				panel,
				5,
				top,
				code.map(() => 2),
				{ gap, colour: C.guide },
			) +
			lines +
			cursor,
		{ cls: "a-in", i: 1 },
	)
}

// The AI agent: a rounded cube with the dot grid on its top, in front of the editor. Both lanes run
// under it: the work leaves it and the review comes back to it
const agent = (s: Iso) => {
	const cube = { x: 34, y: 0, z: 38, w: 24, h: 24, d: 24 }
	return g(
		s.box(cube) +
			s.agent({ x: cube.x + 0.3 * cube.w, y: cube.y + cube.h, z: cube.z + 0.3 * cube.d }),
		{ cls: "a-in", i: 3 },
	)
}

// Build and tests: a short checklist whose ticks come in one after another, once the editor's last
// line has typed (pop runs on the same 11 s cycle as type)
const tests = (s: Iso) => {
	const board: Panel = { x: 104, y: 0, z: 24, w: 42, h: 38, facing: "z", depth: 3, r: 3 }
	const rows = [10, 20, 30]
		.map(
			(v, k) =>
				s.check(s.on(board, 9, v), { cls: "pop", i: 4 + k }) +
				s.text(board, 16, v, [k === 1 ? 14 : 20]),
		)
		.join("")
	return g(s.panel(board) + rows, { cls: "a-in", i: 4 })
}

// The running app in a browser: a header and two cards, each with a line of text
const browser = (s: Iso) => {
	const panel: Panel = { x: 168, y: 0, z: -14, w: 84, h: 60, facing: "z", depth: 3, r: 4, tone: 1 }
	const block = (u: number, v: number, w: number, h: number) =>
		s.rect(panel, u, v, w, h) + s.text(panel, u + 5, v + 6, [w * 0.45])
	return g(
		frame(s, panel, 9) + block(7, 15, 70, 13) + block(7, 33, 33, 19) + block(44, 33, 33, 19),
		{ cls: "a-in", i: 2 },
	)
}

// 03 Development: the software being built in short cycles. An AI agent (the dot-grid mark) writes
// the code in an editor; the change passes build and tests and is deployed to the running app in a
// browser, where a person reviews it; what they say goes back to the agent.
export const development = () => {
	const s = new Iso(640, 440, 192, 129, 1.45)
	const step = (x: number, i: number) =>
		s.plate({ x, z: 0, w: 66, d: 66, t: 4, r: 3, tone: 1, cls: "a-in", i })

	// Each change runs from the agent through the tests to the app; the review goes back, dashed,
	// just behind it
	const lane = 58
	const forward = s.wirePath([
		[58, 0, lane],
		[226, 0, lane],
		[226, 0, -13],
	])
	const back = s.wirePath([
		[204, 0, 48],
		[58, 0, 48],
	])
	const routes =
		s.route(forward, { cls: "a-in", i: 5 }) +
		s.route(back, { colour: C.guide, dash: "3 4", cls: "a-in", i: 6 })
	const reviewer = s.person(204, 0, 38, { cls: "a-in", i: 4 })

	return s.svg(
		browser(s) +
			step(0, 0) +
			step(92, 1) +
			step(184, 2) +
			routes +
			editor(s) +
			tests(s) +
			agent(s) +
			reviewer +
			s.travel(forward, 0) +
			s.travel(back, 1.4),
	)
}
