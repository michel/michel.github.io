import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { allFiles, useEditor } from "../context/EditorContext"

export default function CommandLine() {
	const [value, setValue] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const navigate = useNavigate()
	const { commandLineOpen, closeCommandLine, openBuffer, openTerminal, setActiveTmuxWindow, openSnakeGame, openAdventureGame } = useEditor()

	useEffect(() => {
		if (commandLineOpen) {
			setValue("")
			inputRef.current?.focus()
		}
	}, [commandLineOpen])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.stopPropagation()
		if (e.key === "Escape") {
			closeCommandLine()
		} else if (e.key === "Enter") {
			executeCommand(value)
			closeCommandLine()
		} else if (e.key === "Tab") {
			e.preventDefault()
			const completed = autocomplete(value)
			if (completed) setValue(completed)
		}
	}

	const autocomplete = (cmd: string): string | null => {
		const trimmed = cmd.trim()

		// Autocomplete commands
		const commands = ["write", "quit", "edit", "w", "q", "e", "wq", "terminal", "term", "snake", "adventure"]
		if (!trimmed.includes(" ")) {
			const match = commands.find((c) => c.startsWith(trimmed) && c !== trimmed)
			if (match) return match
		}

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

		if (trimmed === "w") {
			// Simulate save
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

	return (
		<div className="absolute bottom-12 left-0 z-50 flex w-full items-center border-t border-border bg-bg-dark p-1 text-fg">
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
	)
}
