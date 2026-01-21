import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function usePostHogPageview() {
	const posthog = usePostHog()
	const location = useLocation()

	useEffect(() => {
		if (posthog) posthog.capture("$pageview", { $current_url: window.location.href })
	}, [location.pathname, posthog])
}
