import { useEffect, useState } from "react"
import { useEditor, type TmuxWindow } from "../context/EditorContext"

const ARROW_RIGHT = ""
const ARROW_LEFT = ""

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
		<div className="flex h-6 select-none items-center justify-between bg-bg-dark font-mono text-sm">
			{/* Left: Session + Windows */}
			<div className="flex items-center">
				{/* Session segment */}
				<span className="bg-magenta px-2 py-0.5 font-bold text-bg">≋ michel</span>
				<span className="bg-bg-panel text-magenta">{ARROW_RIGHT}</span>

				{/* Window segments */}
				{windows.map((win, idx) => {
					const isActive = activeTmuxWindow === win.id
					const isLast = idx === windows.length - 1

					if (isActive) {
						return (
							<span key={win.id} className="flex items-center">
								<span className="bg-cyan text-bg-panel">{ARROW_RIGHT}</span>
								<span
									className="cursor-pointer bg-cyan px-2 py-0.5 font-bold text-bg hover:brightness-110"
									onClick={() => setActiveTmuxWindow(win.id)}
								>
									{win.id}:{win.name}*
								</span>
								{isLast ? (
									<span className="bg-bg-dark text-cyan">{ARROW_RIGHT}</span>
								) : (
									<span className="bg-bg-panel text-cyan">{ARROW_RIGHT}</span>
								)}
							</span>
						)
					}

					return (
						<span key={win.id} className="flex items-center">
							<span
								className="cursor-pointer bg-bg-panel px-2 py-0.5 text-comment hover:text-fg"
								onClick={() => setActiveTmuxWindow(win.id)}
							>
								{win.id}:{win.name}
							</span>
							{isLast && <span className="bg-bg-dark text-bg-panel">{ARROW_RIGHT}</span>}
						</span>
					)
				})}
			</div>

			{/* Right: Status segments */}
			<div className="flex items-center">
				{/* Git branch */}
				<span className="bg-bg-dark text-green">{ARROW_LEFT}</span>
				<span className="bg-green px-2 py-0.5 font-bold text-bg">⎇ main</span>

				{/* CPU */}
				<span className="bg-green text-yellow">{ARROW_LEFT}</span>
				<span className="bg-yellow px-2 py-0.5 font-bold text-bg">◉ {cpu}%</span>

				{/* Network */}
				<span className="bg-yellow text-blue">{ARROW_LEFT}</span>
				<span className="bg-blue px-2 py-0.5 font-bold text-bg">◆</span>

				{/* Time */}
				<span className="bg-blue text-magenta">{ARROW_LEFT}</span>
				<span className="bg-magenta px-2 py-0.5 font-bold text-bg">◷ {time}</span>

				{/* Date */}
				<span className="bg-magenta text-cyan">{ARROW_LEFT}</span>
				<span className="bg-cyan px-2 py-0.5 font-bold text-bg">◫ {date}</span>

				{/* User */}
				<span className="bg-cyan text-green">{ARROW_LEFT}</span>
				<span className="bg-green px-2 py-0.5 font-bold text-bg">◈ michel</span>
			</div>
		</div>
	)
}
