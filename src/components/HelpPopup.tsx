import { useEffect, useRef } from "react"
import { useEditor } from "../context/EditorContext"

const keybindings = [
	{ key: "Ctrl+`", description: "Toggle terminal" },
	{ key: "Ctrl+p", description: "Find files" },
	{ key: "Ctrl+w", description: "Cycle focus" },
	{ key: "Ctrl+j", description: "Focus terminal" },
	{ key: "h", description: "Previous buffer" },
	{ key: "j", description: "Scroll down" },
	{ key: "k", description: "Scroll up" },
	{ key: "l", description: "Next buffer" },
	{ key: "i", description: "Insert mode" },
	{ key: "v", description: "Visual mode" },
	{ key: ":", description: "Command line" },
	{ key: "Esc", description: "Normal mode" },
	{ key: "?", description: "Toggle help" },
]

export default function HelpPopup() {
	const { closeHelpPopup } = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		containerRef.current?.focus()
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape" || e.key === "?") {
			e.preventDefault()
			closeHelpPopup()
		}
	}

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center">
			<div
				ref={containerRef}
				tabIndex={-1}
				onKeyDown={handleKeyDown}
				className="relative w-80 rounded-lg border border-[#4a4670] bg-bg-dark pt-2 outline-none"
			>
				<span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bg-dark px-2 text-comment">
					Keybindings
				</span>
				<div className="p-3">
					{keybindings.map(({ key, description }) => (
						<div key={key} className="flex items-center justify-between py-1">
							<span className="font-bold text-magenta">{key}</span>
							<span className="text-fg">{description}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
