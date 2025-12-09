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
	const { mode } = useEditor()
	const file = allFiles.find((f) => f.path === location.pathname)
	const filename = file?.name ?? location.pathname

	return (
		<div className="flex h-6 select-none items-center justify-between bg-[#1f1d2e] font-mono text-sm text-fg">
			<div className="flex">
				<span className={`px-2 font-bold uppercase ${modeColors[mode]}`}>{mode}</span>
				<span className="flex items-center gap-1 bg-border px-2 text-cyan">
					<GitBranch className="h-3 w-3" /> master
				</span>
				<span className="px-2 text-comment">{filename}</span>
				<span className="px-2 text-comment">[+]</span>
			</div>
			<div className="flex gap-4 px-2">
				<span className="text-comment">? for help</span>
				<span className="text-comment">utf-8</span>
				<span className="text-comment">unix</span>
				<span className="font-bold text-fg">100%</span>
				<span className="font-bold text-fg">LN 1:1</span>
			</div>
		</div>
	)
}
