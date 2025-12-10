import { useEffect, useMemo, useRef, useState } from "react"
import { useEditor } from "../context/EditorContext"
import { availableCommands, executeCommand, hackerFileNames } from "../hooks/useTerminalCommands"

interface TerminalLine {
	id: string
	type: "input" | "output"
	content: string
}

const colorMap: Record<string, string> = {
	cyan: "text-cyan",
	magenta: "text-magenta",
	green: "text-green",
	yellow: "text-yellow",
	blue: "text-blue",
	red: "text-red",
	orange: "text-orange",
	pink: "text-pink",
	comment: "text-comment",
	reset: "text-fg",
}

function parseColoredText(text: string): React.ReactNode[] {
	const parts: React.ReactNode[] = []
	// biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally matching ANSI escape sequences
	const regex = /\x1b\[(\w+)\](.*?)(?=\x1b\[|$)/g
	let lastIndex = 0
	let match: RegExpExecArray | null = regex.exec(text)

	while (match !== null) {
		if (match.index > lastIndex)
			parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>)

		const color = match[1] ?? ""
		const content = match[2] ?? ""
		const colorClass = colorMap[color] || "text-fg"
		parts.push(
			<span key={match.index} className={colorClass}>
				{content}
			</span>,
		)
		lastIndex = regex.lastIndex
		match = regex.exec(text)
	}

	if (lastIndex < text.length) parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>)

	return parts.length > 0 ? parts : [text]
}

const generateId = () =>
	typeof crypto !== "undefined" && crypto.randomUUID
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2)

export default function Terminal() {
	const { terminalFocused, focusTerminal, unfocusTerminal, closeTerminal, setActiveTmuxWindow } =
		useEditor()
	const [history, setHistory] = useState<TerminalLine[]>(() => {
		// Run neofetch on initial mount
		const result = executeCommand("neofetch")
		return result.output.map((content) => ({
			id: generateId(),
			type: "output" as const,
			content,
		}))
	})
	const [input, setInput] = useState("")
	const [commandHistory, setCommandHistory] = useState<string[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)
	const [tabIndex, setTabIndex] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (terminalFocused && inputRef.current) inputRef.current.focus()
	}, [terminalFocused])

	useEffect(() => {
		if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
	}, [])

	const addLine = (type: "input" | "output", content: string) => {
		setHistory((h) => [...h, { id: generateId(), type, content }])
	}

	// Fish-style autocomplete: get all matching commands or files
	const matches = useMemo(() => {
		if (!input.trim()) return []
		const trimmed = input.trim()
		const lower = trimmed.toLowerCase()

		// Check if we're completing a file argument for cat
		if (lower.startsWith("cat ")) {
			const fileArg = trimmed.slice(4) // Everything after "cat "
			if (!fileArg) return hackerFileNames.map((f) => `cat ${f}`)
			const fileLower = fileArg.toLowerCase()
			return hackerFileNames
				.filter((f) => f.toLowerCase().startsWith(fileLower) && f.toLowerCase() !== fileLower)
				.map((f) => `cat ${f}`)
		}

		// Only match the command part (first word) if no space
		if (lower.includes(" ")) return []
		return availableCommands.filter((c) => c.startsWith(lower) && c !== lower)
	}, [input])

	// Reset tab index when input changes
	useEffect(() => {
		setTabIndex(0)
	}, [])

	// Current suggestion based on tab index
	const suggestion = matches[tabIndex % Math.max(1, matches.length)] ?? null

	const handleClick = () => {
		focusTerminal()
		inputRef.current?.focus()
	}

	const handleSubmit = () => {
		if (!input.trim()) {
			addLine("input", "")
			return
		}

		addLine("input", input)
		setCommandHistory((h) => [...h, input])
		setHistoryIndex(-1)

		const result = executeCommand(input)
		if (result.clear) {
			setHistory([])
		} else {
			for (const line of result.output) {
				addLine("output", line)
			}
		}

		if (result.closeTerminal) {
			setTimeout(() => closeTerminal(), 500)
		}

		if (result.switchToNvim) {
			setTimeout(() => setActiveTmuxWindow(1), 500)
		}

		setInput("")
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Let Ctrl+` bubble up to toggle terminal
		if (e.ctrlKey && e.code === "Backquote") return

		e.stopPropagation()

		if (e.key === "Enter") {
			handleSubmit()
		} else if (e.key === "Escape") {
			unfocusTerminal()
		} else if (e.ctrlKey && e.key === "c") {
			addLine("input", `${input}^C`)
			setInput("")
		} else if (e.ctrlKey && e.key === "l") {
			setHistory([])
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			if (commandHistory.length > 0) {
				const newIndex =
					historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
				setHistoryIndex(newIndex)
				setInput(commandHistory[newIndex] ?? "")
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault()
			if (historyIndex !== -1) {
				const newIndex = historyIndex + 1
				if (newIndex >= commandHistory.length) {
					setHistoryIndex(-1)
					setInput("")
				} else {
					setHistoryIndex(newIndex)
					setInput(commandHistory[newIndex] ?? "")
				}
			}
		} else if (e.key === "Tab") {
			e.preventDefault()
			if (matches.length > 0) {
				// If we have a suggestion, accept it or cycle to next
				if (suggestion) {
					const currentMatch = matches[tabIndex % matches.length]
					if (input.toLowerCase() === currentMatch) {
						// Already at this match, cycle to next
						setTabIndex((i) => i + 1)
					} else {
						// Accept current suggestion
						setInput(suggestion)
						setTabIndex((i) => i + 1)
					}
				}
			}
		} else if (e.key === "ArrowRight" && suggestion) {
			// Fish-style: right arrow accepts suggestion
			const cursorAtEnd = inputRef.current?.selectionStart === input.length
			if (cursorAtEnd) {
				e.preventDefault()
				setInput(suggestion)
			}
		}
	}

	return (
		<div className="flex h-full flex-col bg-bg-dark" onClick={handleClick}>
			<div ref={containerRef} className="flex-1 overflow-auto p-2 font-mono text-sm">
				{history.map((line) => (
					<div key={line.id} className="whitespace-pre break-all">
						{line.type === "input" ? (
							<>
								<span className="text-green">michel@spaceheater</span>
								<span className="text-fg">:</span>
								<span className="text-cyan">~/src/michel</span>
								<span className="text-fg">$ {line.content}</span>
							</>
						) : (
							<span className="text-fg">{parseColoredText(line.content)}</span>
						)}
					</div>
				))}

				<div className="flex whitespace-pre-wrap break-all">
					<span className="text-green">michel@spaceheater</span>
					<span className="text-fg">:</span>
					<span className="text-cyan">~/src/michel</span>
					<span className="text-fg">$ </span>
					<div className="relative flex-1">
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							onFocus={focusTerminal}
							className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
							style={{ fontSize: '16px' }}
						/>
						<span className="text-fg">{input}</span>
						<span className="text-comment">{suggestion?.slice(input.length)}</span>
						<span className={`${terminalFocused ? "cursor-blink" : ""} bg-fg text-bg`}> </span>
					</div>
				</div>
			</div>
		</div>
	)
}
