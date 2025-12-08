import { useEffect, useState } from "react"

export default function TmuxLine() {
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(interval)
	}, [])

	const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
	const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })

	return (
		<div className="flex select-none items-center justify-between bg-green p-0.5 font-bold text-bg">
			<div className="flex gap-2">
				<span className="bg-bg px-2 text-green">0:sh</span>
				<span>1:nvim*</span>
				<span className="opacity-50">2:zsh</span>
			</div>
			<div className="flex gap-4 px-2">
				<span>
					"michel" {time} {date}
				</span>
			</div>
		</div>
	)
}
