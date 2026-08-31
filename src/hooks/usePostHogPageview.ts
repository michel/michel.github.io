import type { PostHog } from "posthog-js"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// PostHog is loaded off the critical path: the first pageview waits for idle,
// later ones reuse the same init promise.
let posthogPromise: Promise<PostHog> | null = null

const loadPostHog = () => {
	posthogPromise ??= import("posthog-js").then(({ default: posthog }) => {
		posthog.init("phc_Xiya7U8hHyMIzYg6YCQ8ZJEN3dnfCNTyIRJWr1mdO1J", {
			api_host: "https://eu.i.posthog.com",
			ui_host: "https://eu.posthog.com",
			defaults: "2025-05-24",
			capture_pageview: false, // Manual pageview tracking below
			capture_pageleave: true,
			capture_exceptions: true,
			session_recording: {
				maskAllInputs: false,
				maskInputFn: (text, element) => {
					const input = element as HTMLInputElement | null
					return input?.type === "password" || input?.autocomplete === "cc-number"
						? "*".repeat(text.length)
						: text
				},
			},
			debug: import.meta.env.MODE === "development",
		})
		return posthog
	})
	return posthogPromise
}

export function usePostHogPageview() {
	const location = useLocation()

	useEffect(() => {
		// Snapshot now: a capture resolving after a navigation must bill the page it was for
		const url = window.location.href
		const capture = () =>
			loadPostHog().then((posthog) => posthog.capture("$pageview", { $current_url: url }))
		if (posthogPromise) {
			capture()
			return
		}
		// PostHog costs ~165kB over 7 requests and more main-thread time than the app
		// itself, so it waits for load and then idle — otherwise it lands inside the
		// LCP window on a real connection. Never cancelled: quick navigations away from
		// the landing page would otherwise lose the first pageview entirely.
		const onIdle = () => {
			if ("requestIdleCallback" in window) requestIdleCallback(capture, { timeout: 5000 })
			else setTimeout(capture, 2000)
		}
		if (document.readyState === "complete") onIdle()
		else window.addEventListener("load", onIdle, { once: true })
	}, [location.pathname])
}
