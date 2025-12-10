import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { allFiles, useEditor } from "../context/EditorContext"

const commandList = [
	{ cmd: "w", description: "Save file" },
	{ cmd: "q", description: "Quit buffer" },
	{ cmd: "wq", description: "Save and quit" },
	{ cmd: "e", description: "Edit file" },
	{ cmd: "terminal", description: "Open terminal" },
	{ cmd: "term", description: "Open terminal" },
	{ cmd: "snake", description: "Play snake" },
	{ cmd: "adventure", description: "Text adventure" },
	{ cmd: "help", description: "Show commands" },
]

export default function CommandLine() {
	const [value, setValue] = useState("")
	const [selectedIndex, setSelectedIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const navigate = useNavigate()
	const {
		commandLineOpen,
		closeCommandLine,
		openBuffer,
		openTerminal,
		setActiveTmuxWindow,
		openSnakeGame,
		openAdventureGame,
		toggleHelpPopup,
	} = useEditor()

	useEffect(() => {
		if (commandLineOpen) {
			setValue("")
			setSelectedIndex(0)
			inputRef.current?.focus()
		}
	}, [commandLineOpen])

	const matches = useMemo(() => {
		const trimmed = value.trim().toLowerCase()
		if (!trimmed || trimmed.includes(" ")) return []
		return commandList.filter((c) => c.cmd.startsWith(trimmed) && c.cmd !== trimmed)
	}, [value])

	useEffect(() => {
		setSelectedIndex(0)
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.stopPropagation()
		if (e.key === "Escape") {
			closeCommandLine()
		} else if (e.key === "Enter") {
			executeCommand(value)
			closeCommandLine()
		} else if (e.key === "Tab") {
			e.preventDefault()
			if (matches.length > 0) {
				const match = matches[selectedIndex % matches.length]
				if (match) setValue(match.cmd)
			} else {
				const completed = autocomplete(value)
				if (completed) setValue(completed)
			}
		} else if (e.key === "ArrowDown" && matches.length > 0) {
			e.preventDefault()
			setSelectedIndex((i) => (i + 1) % matches.length)
		} else if (e.key === "ArrowUp" && matches.length > 0) {
			e.preventDefault()
			setSelectedIndex((i) => (i - 1 + matches.length) % matches.length)
		}
	}

	const autocomplete = (cmd: string): string | null => {
		const trimmed = cmd.trim()

		// Autocomplete filenames for :e command
		if (trimmed.startsWith("e ")) {
			const partial = trimmed.slice(2).trim().toLowerCase()
			const match = allFiles.find(
				(f) => f.name.toLowerCase().startsWith(partial) && f.name.toLowerCase() !== partial,
			)
			if (match) return `e ${match.name}`
		}

		return null
	}

	const executeCommand = (cmd: string) => {
		const trimmed = cmd.trim()

		if (trimmed === "w") return

		if (trimmed === "help") {
			toggleHelpPopup()
			return
		}

		if (["q", "q!", "wq", "wq!", "x", "xa", "qa", "qa!"].includes(trimmed)) {
			setActiveTmuxWindow(2)
			return
		}

		if (trimmed === "terminal" || trimmed === "term") {
			openTerminal()
			return
		}

		if (trimmed === "snake") {
			openSnakeGame()
			return
		}

		if (trimmed === "adventure") {
			openAdventureGame()
			return
		}

		if (trimmed.startsWith("e ")) {
			const filename = trimmed.slice(2).trim()
			const file = allFiles.find((f) => f.name.toLowerCase().includes(filename.toLowerCase()))
			if (file) {
				openBuffer(file.path)
				navigate(file.path)
			}
		}
	}

	if (!commandLineOpen) return null

	const showDropdown = matches.length > 0 || value.trim() === ""
	const displayItems = value.trim() === "" ? commandList : matches

	return (
		<div className="absolute bottom-12 left-0 z-50 w-full">
			{showDropdown && (
				<div className="border-x border-t border-border bg-bg-dark">
					{displayItems.map((item, i) => (
						<div
							key={item.cmd}
							className={`flex cursor-pointer items-center justify-between px-2 py-0.5 ${
								i === selectedIndex % displayItems.length ? "bg-[#4a4670]" : ""
							}`}
							onClick={() => {
								setValue(item.cmd)
								inputRef.current?.focus()
							}}
						>
							<span className="text-magenta">{item.cmd}</span>
							<span className="text-comment">{item.description}</span>
						</div>
					))}
				</div>
			)}
			<div className="flex w-full items-center border-t border-border bg-bg-dark p-1 text-fg">
				<span className="mr-1 text-fg">:</span>
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={handleKeyDown}
					className="m-0 h-4 flex-1 border-none bg-transparent p-0 text-fg outline-none"
				/>
			</div>
		</div>
	)
}
