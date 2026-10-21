import { C, closed, g, Iso, open, type Panel } from "./iso"

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

// The editor the agent works in: its own pane on the left with the dot grid, the code on the
// right, indented lines that type in one after another, and the cursor after the last one. It
// reaches the front of the plate, so it takes the brightest tone
const EDITOR: Panel = { x: 4, y: 0, z: 6, w: 58, h: 44, facing: "x", depth: 3, r: 4 }
const PANE = 24
const editor = (s: Iso) => {
	const panel = EDITOR
	const code: [number, number][] = [
		[0, 22],
		[6, 18],
		[12, 12],
		[6, 14],
		[0, 6],
	]
	const top = 16
	const gap = 5.5
	const start = PANE + 5
	const lines = code
		.map(([indent, length], k) =>
			s.text(panel, start + indent, top + k * gap, [length], { cls: "type", i: k }),
		)
		.join("")
	const last = top + (code.length - 1) * gap
	const end = start + 9
	const cursor = s.route(open([s.on(panel, end, last - 2), s.on(panel, end, last + 2)]), {
		colour: C.route,
		cls: "blink",
	})
	const divider = s.route(open([s.on(panel, PANE, 9), s.on(panel, PANE, panel.h)]), {
		colour: C.guide,
	})
	return g(
		frame(s, panel, 9) +
			divider +
			s.agentOn(panel, PANE / 2, 26.5, { gap: 3.2, dot: 0.75 }) +
			lines +
			cursor,
		{ cls: "a-in", i: 1 },
	)
}

// A second agent at the back of the plate, a smaller console working alongside: its dot grid
// and a few short lines of its own
const helper = (s: Iso) => {
	const screen: Panel = { x: 18, y: 0, z: 4, w: 28, h: 22, facing: "z", depth: 3, r: 3, tone: 2 }
	return g(
		s.panel(screen) +
			s.agentOn(screen, 9, 11, { gap: 2.2 }) +
			s.text(screen, 16, 8, [8, 5, 7], { gap: 3.5, colour: C.guide, cls: "type", i: 1 }),
		{ cls: "a-in", i: 3 },
	)
}

// Build and tests, at the back of the plate: a short checklist whose ticks come in one after another, once the editor's last
// line has typed (pop runs on the same 11 s cycle as type)
const tests = (s: Iso) => {
	const board: Panel = { x: 104, y: 0, z: 4, w: 42, h: 38, facing: "z", depth: 3, r: 3, tone: 1 }
	const rows = [10, 20, 30]
		.map(
			(v, k) =>
				s.check(s.on(board, 9, v), { cls: "pop", i: 4 + k }) +
				s.text(board, 16, v, [k === 1 ? 14 : 20]),
		)
		.join("")
	return g(s.panel(board) + rows, { cls: "a-in", i: 4 })
}

// The running app in a browser: a header and the cards built so far. The newest card, dashed, is
// this cycle's change: it comes in once the tests have passed
const browser = (s: Iso) => {
	const panel: Panel = { x: 168, y: 0, z: -14, w: 84, h: 60, facing: "z", depth: 3, r: 4, tone: 1 }
	const corners = (u: number, v: number, w: number, h: number) =>
		closed([
			s.on(panel, u, v),
			s.on(panel, u + w, v),
			s.on(panel, u + w, v + h),
			s.on(panel, u, v + h),
		])
	const block = (u: number, v: number, w: number, h: number) =>
		s.rect(panel, u, v, w, h) + s.text(panel, u + 5, v + 6, [w * 0.45])
	const change = g(
		s.route(corners(44, 33, 33, 19), { colour: C.route, dash: "2 2" }) +
			s.text(panel, 49, 39, [15], { colour: C.route }),
		{ cls: "pop", i: 7 },
	)
	return g(frame(s, panel, 9) + block(7, 15, 70, 13) + block(7, 33, 33, 19) + change, {
		cls: "a-in",
		i: 2,
	})
}

// 03 Development: the software built in short cycles. AI agents (the dot-grid mark) write the
// code; the change leaves the editor, passes the tests and is deployed to the running app; the
// person there reviews it and sends the next direction back, dashed, straight into the agent's pane.
export const development = () => {
	const s = new Iso(640, 440, 192, 129, 1.45)
	const step = (x: number, i: number) =>
		s.plate({ x, z: 0, w: 66, d: 66, t: 4, r: 3, tone: 1, cls: "a-in", i })

	// One loop with the editor as its left end: the work leaves the code along the back, past the
	// tests, and comes round to the person, with a short stub where it is deployed to the app; from
	// the person the review runs back, dashed, along the front into the agent's pane
	const [back, front, right, ship, stand] = [16, 56, 240, 204, 226]
	const work = s.wirePath(
		[
			[EDITOR.x, 0, back],
			[right, 0, back],
			[right, 0, front],
			[stand, 0, front],
		],
		40,
	)
	const deploy = open([s.p(ship, 0, back), s.p(ship, 0, -13)])
	const review = s.wirePath([
		[stand, 0, front],
		[EDITOR.x, 0, front],
	])
	const routes =
		s.route(work, { cls: "a-in", i: 5 }) +
		s.route(deploy, { cls: "a-in", i: 5 }) +
		s.route(review, { colour: C.route, dash: "3 4", cls: "a-in", i: 6 })
	const reviewer = s.person(stand, 0, front + 3, { cls: "a-in", i: 4 })
	// The review dot sets off as the work dot reaches the person: flow lasts 8 s, staggered 2.8 s by i
	const handoff = 8 / 2.8

	return s.svg(
		browser(s) +
			step(0, 0) +
			step(92, 1) +
			step(184, 2) +
			routes +
			helper(s) +
			editor(s) +
			tests(s) +
			s.travel(work, 0) +
			s.travel(review, handoff) +
			reviewer,
	)
}
