import { GitBranch } from "lucide-react"
import { useLocation } from "react-router-dom"
import { allFiles, useEditor } from "../context/EditorContext"

const modeColors: Record<string, string> = {
	NORMAL: "bg-magenta text-black",
	INSERT: "bg-green text-black",
	VISUAL: "bg-orange text-black",
	COMMAND: "bg-blue text-black",
}

export default function StatusLine() {
	const location = useLocation()
	const { mode, cursorLine, lineCount } = useEditor()
	const file = allFiles.find((f) => f.path === location.pathname)
	const filename = file?.name ?? location.pathname
	const percent = lineCount ? Math.round(((cursorLine + 1) / lineCount) * 100) : 100

	return (
		<div className="flex h-4 md:h-6 select-none items-center justify-between bg-bg-dark font-mono text-[10px] md:text-sm text-fg">
			<div className="flex">
				<span className={`w-[9ch] text-center font-bold uppercase ${modeColors[mode]}`}>
					{mode}
				</span>
				<span className="flex items-center gap-1 bg-border px-2 text-cyan">
					<GitBranch aria-hidden="true" className="h-3 w-3" /> master
				</span>
				<span className="px-2 text-comment">{filename}</span>
				<span className="px-2 text-comment">[+]</span>
			</div>
			<div className="flex gap-4 px-2">
				<span className="hidden md:inline text-comment">? for help</span>
				<span className="hidden md:inline text-comment">utf-8</span>
				<span className="hidden md:inline text-comment">unix</span>
				{lineCount > 0 && (
					<>
						<span className="font-bold text-fg">{percent}%</span>
						<span className="font-bold text-fg">LN {cursorLine + 1}:1</span>
					</>
				)}
			</div>
		</div>
	)
}
