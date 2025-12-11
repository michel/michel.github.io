import { useEffect, useState } from "react"
import { type TmuxWindow, useEditor } from "../context/EditorContext"

interface WindowDef {
	id: TmuxWindow
	name: string
}

const windows: WindowDef[] = [
	{ id: 0, name: "neo" },
	{ id: 1, name: "nvim" },
	{ id: 2, name: "zsh" },
	{ id: 3, name: "fish:id4" },
	{ id: 4, name: "sh:jp-unix" },
	{ id: 5, name: "ssh:colossus" },
	{ id: 6, name: "ssh:glados" },
]

export default function TmuxLine() {
	const { activeTmuxWindow, setActiveTmuxWindow } = useEditor()
	const [now, setNow] = useState(new Date())
	const [cpu, setCpu] = useState(12)

	useEffect(() => {
		const timeInterval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(timeInterval)
	}, [])

	useEffect(() => {
		const cpuInterval = setInterval(() => {
			setCpu((prev) => Math.max(5, Math.min(35, prev + (Math.random() > 0.5 ? 1 : -1))))
		}, 2000)
		return () => clearInterval(cpuInterval)
	}, [])

	const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
	const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

	return (
		<div className="flex h-5 md:h-6 select-none items-center justify-between overflow-hidden bg-bg-dark font-mono text-[10px] md:text-sm text-nowrap">
			{/* Left: Session + Windows */}
			<div className="flex">
				{/* Session segment */}
				<span className="bg-magenta px-1 md:px-2 font-bold text-bg">≋ michel</span>

				{/* Window segments */}
				{windows.map((win, _idx) => {
					const isActive = activeTmuxWindow === win.id

					if (isActive) {
						return (
							<span key={win.id} className="flex">
								<span
									className="cursor-pointer bg-cyan px-1 md:px-2 font-bold text-bg hover:brightness-110"
									onClick={() => setActiveTmuxWindow(win.id)}
								>
									{win.id}:{win.name}*
								</span>
							</span>
						)
					}

					return (
						<span key={win.id} className="flex">
							<span
								className="cursor-pointer bg-bg-panel px-1 md:px-2 text-comment hover:text-fg"
								onClick={() => setActiveTmuxWindow(win.id)}
							>
								{win.id}:{win.name}
							</span>
						</span>
					)
				})}
			</div>

			{/* Right: Status segments */}
			<div className="flex">
				{/* Git branch */}
				<span className="bg-green px-1 md:px-2 font-bold text-bg">⎇ main</span>

				{/* CPU */}
				<span className="bg-yellow px-1 md:px-2 font-bold text-bg">◉ {cpu}%</span>

				{/* Network */}
				<span className="bg-blue px-1 md:px-2 font-bold text-bg">◆</span>

				{/* Time */}
				<span className="bg-magenta px-1 md:px-2 font-bold text-bg">◷ {time}</span>

				{/* Date */}
				<span className="bg-cyan px-1 md:px-2 font-bold text-bg">◫ {date}</span>

				{/* User */}
				<span className="bg-green px-1 md:px-2 font-bold text-bg">◈ michel</span>
			</div>
		</div>
	)
}
