import { useEffect, useState } from "react"
import { type TmuxWindow, useEditor } from "../context/EditorContext"

interface WindowDef {
	id: TmuxWindow
	name: string
}

const windows: WindowDef[] = [
	{ id: 0, name: "neo" },
	{ id: 1, name: "nvim" },
	{ id: 2, name: "fish" },
	{ id: 3, name: "fish:id4" },
	{ id: 4, name: "sh:jp-unix" },
	{ id: 5, name: "ssh:colossus" },
	{ id: 6, name: "ssh:glados" },
]

const timeFormat = new Intl.DateTimeFormat(undefined, {
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
})
const dateFormat = new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" })

const segment = "min-h-7 md:min-h-0 items-center px-1 py-1.5 md:px-2 md:py-0"
const statusSegment = `${segment} font-bold text-bg`

export default function TmuxLine() {
	const { activeTmuxWindow, setActiveTmuxWindow } = useEditor()
	// null until mounted so the prerendered HTML hydrates without a clock mismatch
	const [now, setNow] = useState<Date | null>(null)
	const [cpu, setCpu] = useState(12)

	useEffect(() => {
		setNow(new Date())
		const timeInterval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(timeInterval)
	}, [])

	useEffect(() => {
		const cpuInterval = setInterval(() => {
			setCpu((prev) => Math.max(5, Math.min(35, prev + (Math.random() > 0.5 ? 1 : -1))))
		}, 2000)
		return () => clearInterval(cpuInterval)
	}, [])

	return (
		<div className="flex md:h-6 select-none items-stretch justify-between overflow-hidden bg-bg-dark pb-[env(safe-area-inset-bottom)] font-mono text-[10px] md:text-sm text-nowrap">
			{/* Left: Session + Windows */}
			<div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
				<span className={`flex bg-magenta ${statusSegment}`}>michel</span>

				{windows.map((win) => {
					const isActive = activeTmuxWindow === win.id

					return (
						<button
							key={win.id}
							type="button"
							onClick={() => setActiveTmuxWindow(win.id)}
							className={`flex ${segment} transition-colors duration-100 ${
								isActive
									? "bg-cyan font-bold text-bg hover:bg-fg hover:text-bg"
									: "bg-bg-panel text-comment hover:bg-black hover:text-fg"
							}`}
						>
							{win.id}:{win.name}
							{isActive ? "*" : ""}
						</button>
					)
				})}
			</div>

			{/* Right: Status segments */}
			<div className="flex shrink-0 items-stretch">
				<span className={`hidden md:flex bg-green ${statusSegment}`}>master</span>
				<span className={`hidden md:flex bg-yellow ${statusSegment}`}>
					cpu <span className="w-[3ch] text-right">{String(cpu).padStart(2, "0")}%</span>
				</span>
				<span className={`hidden md:flex bg-blue ${statusSegment}`}>net</span>
				<span className={`flex bg-magenta ${statusSegment}`}>
					{now ? timeFormat.format(now) : "--:--"}
				</span>
				<span className={`hidden md:flex bg-cyan ${statusSegment}`}>
					{now ? dateFormat.format(now) : "-- ---"}
				</span>
				<span className={`hidden md:flex bg-green ${statusSegment}`}>michel</span>
			</div>
		</div>
	)
}
