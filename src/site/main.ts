import "../banner"
import { capturePageview } from "../posthog"
import { clamp, smoothstep } from "./ease"

const root = document.documentElement
const motion = root.classList.contains("motion")

const onView = (element: Element, run: () => void, rootMargin = "0px 0px -15% 0px") => {
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return
			observer.disconnect()
			run()
		},
		{ rootMargin },
	)
	observer.observe(element)
}

const onScrollFrame = (run: () => void) => {
	let queued = false
	addEventListener(
		"scroll",
		() => {
			if (queued) return
			queued = true
			requestAnimationFrame(() => {
				queued = false
				run()
			})
		},
		{ passive: true },
	)
}

// Header: the hero carries the full lockup. As the page scrolls it shrinks into the header;
// with reduced motion the header lockup simply appears once the hero lockup has scrolled away.
const header = document.querySelector<HTMLElement>("[data-header]")
const heroLogo = document.querySelector<HTMLImageElement>("[data-hero-logo] img")
const slot = document.querySelector<HTMLImageElement>("[data-header-logo] img")
if (header && heroLogo && slot) {
	const stick = () => header.classList.toggle("is-stuck", scrollY > 4)
	if (motion) {
		const ghost = slot.cloneNode() as HTMLImageElement
		ghost.className = "logo-morph"
		ghost.alt = ""
		ghost.setAttribute("aria-hidden", "true")
		header.append(ghost)
		root.classList.add("has-morph")
		let from = { x: 0, y: 0, w: 1, h: 1 }
		let to = { x: 0, y: 0, w: 1 }
		const measure = () => {
			const hero = heroLogo.getBoundingClientRect()
			const dock = slot.getBoundingClientRect()
			from = { x: hero.left, y: hero.top + scrollY, w: hero.width, h: hero.height }
			to = { x: dock.left, y: dock.top, w: dock.width }
			ghost.style.width = `${from.w}px`
		}
		// Docked once most of the hero lockup has passed under the header. It shrinks three times
		// as fast as it travels, so it is already small when it reaches the nav's row.
		const place = () => {
			const travel = clamp(scrollY / Math.max(1, from.y + from.h * 0.6 - to.y))
			const t = smoothstep(travel)
			const s = smoothstep(clamp(travel * 3))
			const top = from.y - scrollY
			const x = from.x + (to.x - from.x) * t
			const y = top + (to.y - top) * t
			ghost.style.transform = `translate(${x}px, ${y}px) scale(${1 + (to.w / from.w - 1) * s})`
			stick()
		}
		measure()
		place()
		onScrollFrame(place)
		addEventListener("resize", () => {
			measure()
			place()
		})
	} else {
		new IntersectionObserver(
			([entry]) => header.classList.toggle("has-logo", !entry?.isIntersecting),
			{ rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
		).observe(heroLogo)
		stick()
		onScrollFrame(stick)
	}
}

// Navigation: a small triangle marks the section crossing the middle of the viewport
const nav = document.querySelector<HTMLElement>("[data-nav]")
const links = nav ? [...nav.querySelectorAll<HTMLAnchorElement>(".site-nav__list a")] : []
const marker = nav?.querySelector<HTMLElement>(".site-nav__marker")
if (nav && marker) {
	const sections = links.map((link) => document.querySelector(link.hash))
	const visible = new Set<Element>()
	let current = -1
	const show = (index: number) => {
		current = index
		links.forEach((link, i) => {
			if (i === index) link.setAttribute("aria-current", "true")
			else link.removeAttribute("aria-current")
		})
		nav.classList.toggle("has-active", index >= 0)
		const link = links[index]
		if (!link) return
		const box = link.getBoundingClientRect()
		marker.style.setProperty(
			"--marker-x",
			`${box.left - nav.getBoundingClientRect().left + box.width / 2 - 5}px`,
		)
	}
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) visible.add(entry.target)
				else visible.delete(entry.target)
			}
			show(sections.findIndex((section) => section !== null && visible.has(section)))
		},
		{ rootMargin: "-50% 0px -50% 0px" },
	)
	for (const section of sections) if (section) observer.observe(section)
	addEventListener("resize", () => show(current))
	// The marker is placed by the links' widths, which change once Geist has loaded
	document.fonts.ready.then(() => show(current))
}

// Narrower windows get a full-screen menu behind a Menu button (the breakpoint in site.css).
// While it is open the page behind it is inert, so focus stays in the menu.
const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-button]")
if (menuButton && nav) {
	const label = menuButton.querySelector(".site-header__menu-label")
	const behind = document.querySelectorAll<HTMLElement>(".skip, main, footer")
	const setMenu = (open: boolean, restoreFocus = true) => {
		menuButton.setAttribute("aria-expanded", String(open))
		if (label) label.textContent = open ? "Close" : "Menu"
		root.classList.toggle("menu-open", open)
		for (const element of behind) element.inert = open
		if (open) links[0]?.focus()
		else if (restoreFocus) menuButton.focus()
	}
	menuButton.addEventListener("click", () =>
		setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
	)
	nav.addEventListener("click", (event) => {
		if (event.target instanceof Element && event.target.closest("a")) setMenu(false, false)
	})
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && root.classList.contains("menu-open")) setMenu(false)
	})
	matchMedia("(min-width: 56.3125em)").addEventListener("change", (event) => {
		if (event.matches && root.classList.contains("menu-open")) setMenu(false, false)
	})
}

// The client banner can be paused; under reduced motion it never moves, so it needs no control
const clients = document.querySelector<HTMLElement>(".clients")
const pause = clients?.querySelector<HTMLButtonElement>("[data-marquee-toggle]")
if (clients && pause && motion) {
	pause.hidden = false
	pause.addEventListener("click", () => {
		pause.setAttribute("aria-pressed", String(clients.classList.toggle("is-paused")))
	})
}

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
	if (!navigator.clipboard) continue
	button.hidden = false
	button.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(button.dataset.copy ?? "")
			button.textContent = "Copied"
		} catch {
			button.textContent = "Copy failed"
		}
		setTimeout(() => {
			button.textContent = "Copy"
		}, 2000)
	})
}

// Hairlines draw in from the left as they enter, like a construction line
if (motion)
	for (const rule of document.querySelectorAll(".rule")) {
		rule.setAttribute("data-draw", "")
		onView(rule, () => rule.classList.add("is-drawn"), "0px")
	}

// Each illustration (capability tiles and approach steps) assembles once as it comes into view,
// and its loop runs only while it is on screen
if (motion)
	for (const scene of document.querySelectorAll(".scene")) {
		scene.setAttribute("data-reveal", "")
		new IntersectionObserver(
			([entry]) => {
				if (!entry) return
				scene.classList.toggle("is-playing", entry.isIntersecting)
				if (entry.isIntersecting) scene.classList.add("is-shown")
			},
			{ rootMargin: "0px 0px -15% 0px" },
		).observe(scene)
	}

// Theme: follows the system until the visitor picks one; the choice is remembered, and the
// browser's theme colour follows it
const themeToggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]")
if (themeToggle) {
	const system = matchMedia("(prefers-color-scheme: dark)")
	const label = themeToggle.querySelector(".theme-toggle__label")
	const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : system.matches)
	const sync = () => {
		if (label) label.textContent = isDark() ? "Switch to light mode" : "Switch to dark mode"
		if (!root.dataset.theme) return
		const color = getComputedStyle(document.body).backgroundColor
		for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
			meta.content = color
	}
	sync()
	system.addEventListener("change", sync)
	themeToggle.addEventListener("click", () => {
		const theme = isDark() ? "light" : "dark"
		root.dataset.theme = theme
		try {
			localStorage.setItem("site-theme", theme)
		} catch {
			// private mode: the choice holds for this page view only
		}
		sync()
	})
}

capturePageview()
