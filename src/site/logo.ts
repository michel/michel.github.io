// The lockup comes alive now and then: a random, quiet variation every so often, and the
// letter roll on hover. Only runs where motion is welcome, on the inline copy of the lockup

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
// The symbol has threefold symmetry about this point (in user space, which transform-origin
// measures from), so a third of a turn lands exactly where it began
const PIVOT = "160.12px 199.93px"

const root = document.documentElement

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms))

type Parts = {
	ghost: HTMLElement
	symbol: SVGGElement
	strokes: SVGPathElement[]
	letters: SVGPathElement[]
}

// The pulses that run along the symbol turn with it
const turn = ({ ghost, symbol }: Parts) =>
	Promise.all(
		[symbol, ...ghost.querySelectorAll<SVGElement>(".loop__small")].map((part) => {
			part.style.transformOrigin = PIVOT
			return part.animate([{ rotate: "0deg" }, { rotate: "120deg" }], {
				duration: 900,
				easing: EASE,
			}).finished
		}),
	)

const draw = ({ strokes }: Parts) =>
	Promise.all(
		strokes.map(
			(path, i) =>
				path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
					duration: 700,
					delay: i * 120,
					easing: EASE,
					fill: "backwards",
				}).finished,
		),
	)

const wave = ({ letters }: Parts) =>
	Promise.all(
		letters.map(
			(path, i) =>
				path.animate([{ translate: "0 0" }, { translate: "0 -10px" }, { translate: "0 0" }], {
					duration: 600,
					delay: i * 40,
					easing: "ease-in-out",
				}).finished,
		),
	)

// Factory's roll: each letter drops away as a copy drops in from above, right to left
const roll = (parts: Parts) => {
	const motion = [...parts.letters].reverse().flatMap((path, i) => {
		const copy = path.cloneNode() as SVGPathElement
		path.after(copy)
		const timing = { duration: 500, delay: i * 35, easing: EASE, fill: "backwards" as const }
		const out = path.animate([{ translate: "0 0" }, { translate: "0 60px", opacity: 0 }], timing)
		const into = copy.animate([{ translate: "0 -60px", opacity: 0 }, { translate: "0 0" }], timing)
		into.finished.finally(() => copy.remove())
		return [out.finished, into.finished]
	})
	return Promise.all([...motion, turn(parts)])
}

const variants = [roll, turn, draw, wave]

export const animateLogo = async (ghost: HTMLElement, hover: Element) => {
	const img = ghost.querySelector("img")
	const response = img && (await fetch(img.src).catch(() => undefined))
	if (!img || !response?.ok) return
	img.outerHTML = await response.text()
	const svg = ghost.querySelector<SVGSVGElement>(":scope > svg:first-child")
	const symbol = svg?.querySelector<SVGGElement>('[id="Approved-loop-symbol"]')
	if (!svg || !symbol) return
	svg.setAttribute("aria-hidden", "true")
	svg.classList.add("logo-morph__lockup")
	const strokes = [...symbol.querySelectorAll("path")]
	for (const path of strokes) {
		path.setAttribute("pathLength", "1")
		path.style.strokeDasharray = "1"
	}
	const letters = [...svg.querySelectorAll<SVGPathElement>('[id^="RE-INVENTION"] path')]
	const parts = { ghost, symbol, strokes, letters }

	let busy = false
	const play = async (variant: (parts: Parts) => Promise<unknown>) => {
		// Only the docked lockup plays: in the hero (and under the open menu) it would be masked,
		// hidden or out of place
		const docked = Number(ghost.style.getPropertyValue("--docked")) > 0.99
		if (busy || document.hidden || !docked || root.classList.contains("menu-open")) return
		busy = true
		await variant(parts).catch(() => undefined)
		busy = false
	}
	hover.addEventListener("pointerenter", () => play(roll))
	// ponytail: Math.random picks the variant and the wait, a shuffle if repeats ever bother
	for (;;) {
		await pause(8000 + Math.random() * 8000)
		await play(variants[Math.floor(Math.random() * variants.length)] ?? turn)
	}
}
