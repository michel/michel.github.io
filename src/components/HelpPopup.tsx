import { useEffect, useRef } from "react"
import { useEditor } from "../context/EditorContext"

const keybindings = [
	{ key: "Ctrl+`", description: "Toggle terminal" },
	{ key: "Ctrl+p", description: "Find files" },
	{ key: "Ctrl+w", description: "Cycle focus" },
	{ key: "Ctrl+j", description: "Focus terminal" },
	{ key: "gT", description: "Previous buffer" },
	{ key: "j", description: "Scroll down" },
	{ key: "k", description: "Scroll up" },
	{ key: "gt", description: "Next buffer" },
	{ key: "v", description: "Visual mode" },
	{ key: ":", description: "Command line" },
	{ key: "Esc", description: "Normal mode" },
	{ key: "?", description: "Toggle help" },
]

export default function HelpPopup() {
	const { closeHelpPopup } = useEditor()
	const panelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement | null
		panelRef.current?.focus()
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape" && e.key !== "?") return
			e.preventDefault()
			e.stopImmediatePropagation()
			closeHelpPopup()
		}
		window.addEventListener("keydown", handleKeyDown, true)
		return () => {
			window.removeEventListener("keydown", handleKeyDown, true)
			previouslyFocused?.focus()
		}
	}, [closeHelpPopup])

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Keybindings"
			className="fixed inset-0 z-40 flex items-center justify-center bg-bg-dark/80"
			onClick={closeHelpPopup}
		>
			<div
				ref={panelRef}
				tabIndex={-1}
				onClick={(e) => e.stopPropagation()}
				className="relative w-80 border border-border bg-bg-dark pt-2"
			>
				<span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bg-dark px-2 text-comment">
					Keybindings
				</span>
				<div className="max-h-[70vh] overflow-y-auto overscroll-contain p-3">
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
