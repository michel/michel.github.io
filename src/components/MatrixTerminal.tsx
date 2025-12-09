import { useEffect, useState } from "react"
import { useEditor } from "../context/EditorContext"

const script: string[] = [
	"Wake up, Neo...",
	"The Matrix has you...",
	"Follow the white rabbit.",
	"Knock, knock, Neo.",
]

const rabbit = `
  (\\(\\
  ( -.-)
  o_(")(")
`

export default function MatrixTerminal() {
	const { setActiveTmuxWindow, setMatrixComplete } = useEditor()
	const [lines, setLines] = useState<string[]>([])
	const [showRabbit, setShowRabbit] = useState(false)

	useEffect(() => {
		let cancelled = false

		// Show first line immediately
		setLines([script[0] ?? ""])
		let i = 1

		const interval = setInterval(() => {
			if (cancelled) return
			if (i < script.length) {
				setLines((prev) => [...prev, script[i] ?? ""])
				i++
			} else {
				clearInterval(interval)
				// Show rabbit after last message
				setTimeout(() => {
					if (cancelled) return
					setShowRabbit(true)
				}, 1500)
				// Switch to nvim after showing rabbit
				setTimeout(() => {
					if (cancelled) return
					setActiveTmuxWindow(1)
					// Set complete after switching so component stays mounted
					setTimeout(() => setMatrixComplete(true), 100)
				}, 4000)
			}
		}, 2000)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [setActiveTmuxWindow, setMatrixComplete])

	return (
		<div className="flex h-full w-full flex-col bg-black p-4 font-mono text-sm">
			{lines.map((line, i) => (
				<div key={i} className="text-green">
					{line}
				</div>
			))}
			{showRabbit && (
				<pre className="mt-4 whitespace-pre text-green">{rabbit}</pre>
			)}
			{!showRabbit && lines.length > 0 && (
				<span className="mt-2 inline-block h-4 w-2 animate-pulse bg-green" />
			)}
		</div>
	)
}
