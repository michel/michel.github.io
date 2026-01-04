import { useEffect, useState } from "react"
import { getRandomTip, markTipSeen, type Tip } from "../data/tips"

export function useTip(cycleInterval = 10000) {
	const [tip, setTip] = useState<Tip | null>(null)

	useEffect(() => {
		const selectNewTip = () => {
			const randomTip = getRandomTip()
			setTip(randomTip)
			markTipSeen(randomTip.id)
		}

		selectNewTip()

		const interval = setInterval(selectNewTip, cycleInterval)
		return () => clearInterval(interval)
	}, [cycleInterval])

	return tip
}
