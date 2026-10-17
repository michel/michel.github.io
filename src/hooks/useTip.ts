import { useEffect, useState } from "react"
import { nextTip, type Tip } from "../data/tips"

export function useTip(cycleInterval = 10000) {
	const [tip, setTip] = useState<Tip | null>(null)

	useEffect(() => {
		const selectNewTip = () => setTip(nextTip())

		selectNewTip()

		const interval = setInterval(selectNewTip, cycleInterval)
		return () => clearInterval(interval)
	}, [cycleInterval])

	return tip
}
