import { useEffect, useRef, useState } from "react"
import { useEditor } from "../context/EditorContext"
import { executeCommand } from "../hooks/useTerminalCommands"

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
	let match: RegExpExecArray | null = null

	while ((match = regex.exec(text)) !== null) {
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
	}

	if (lastIndex < text.length) parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>)

	return parts.length > 0 ? parts : [text]
}

const availableCommands = [
	"neofetch",
	"ls",
	"cat",
	"npm",
	"cowsay",
	"clear",
	"help",
	"pwd",
	"whoami",
	"date",
	"uname",
	"top",
	"ps",
	"htop",
	"echo",
]

export default function Terminal() {
	const { terminalFocused, focusTerminal, unfocusTerminal, closeTerminal, setActiveTmuxWindow } = useEditor()
	const [history, setHistory] = useState<TerminalLine[]>(() => {
		// Run neofetch on initial mount
		const result = executeCommand("neofetch")
		return result.output.map((content) => ({
			id: crypto.randomUUID(),
			type: "output" as const,
			content,
		}))
	})
	const [input, setInput] = useState("")
	const [commandHistory, setCommandHistory] = useState<string[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (terminalFocused && inputRef.current) inputRef.current.focus()
	}, [terminalFocused])

	useEffect(() => {
		if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
	}, [history])

	const addLine = (type: "input" | "output", content: string) => {
		setHistory((h) => [...h, { id: crypto.randomUUID(), type, content }])
	}

	const autocomplete = (partial: string): string | null => {
		if (!partial) return null
		const lower = partial.toLowerCase()
		return availableCommands.find((c) => c.startsWith(lower) && c !== lower) ?? null
	}

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
			const match = autocomplete(input)
			if (match) setInput(match)
		}
	}

	return (
		<div className="flex h-full flex-col bg-bg-dark" onClick={handleClick}>
			<div ref={containerRef} className="flex-1 overflow-auto p-2 font-mono text-sm">
				{history.map((line) => (
					<div key={line.id} className="whitespace-pre break-all">
						{line.type === "input" ? (
							<>
								<span className="text-green">michel@macbook</span>
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
					<span className="text-green">michel@macbook</span>
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
							className="absolute inset-0 w-full bg-transparent text-fg caret-transparent outline-none"
							autoFocus={terminalFocused}
						/>
						<span className="text-fg">{input}</span>
						<span className={`${terminalFocused ? "cursor-blink" : ""} bg-fg text-bg`}> </span>
					</div>
				</div>
			</div>
		</div>
	)
}
