import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { capturePageview } from "../posthog"

export function usePostHogPageview() {
	const location = useLocation()

	useEffect(() => capturePageview(), [location.pathname])
}
