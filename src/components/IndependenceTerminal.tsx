import { useEffect, useState } from "react"
import { useEditor } from "../context/EditorContext"

const script: { text: string; delay: number }[] = [
	{ text: "CONNECTING TO ALIEN MOTHERSHIP...", delay: 0 },
	{ text: "ACCESS GRANTED", delay: 2000 },
	{ text: "UPLOADING VIRUS...", delay: 1500 },
]

export default function IndependenceTerminal() {
	const { setActiveTmuxWindow, setIndependenceComplete } = useEditor()
	const [lines, setLines] = useState<string[]>([])
	const [progress, setProgress] = useState(0)
	const [showProgress, setShowProgress] = useState(false)
	const [showFinal, setShowFinal] = useState(false)

	useEffect(() => {
		let cancelled = false

		setLines([script[0]?.text ?? ""])
		let lineIndex = 1

		const showNextLine = () => {
			if (cancelled) return
			if (lineIndex < script.length) {
				const entry = script[lineIndex]
				setTimeout(() => {
					if (cancelled) return
					setLines((prev) => [...prev, entry?.text ?? ""])
					lineIndex++
					showNextLine()
				}, entry?.delay ?? 1500)
			} else {
				setTimeout(() => {
					if (cancelled) return
					setShowProgress(true)
				}, 1000)
			}
		}

		showNextLine()

		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		if (!showProgress) return
		let cancelled = false

		const interval = setInterval(() => {
			if (cancelled) return
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval)
					setTimeout(() => {
						if (cancelled) return
						setShowFinal(true)
						setTimeout(() => {
							if (cancelled) return
							setActiveTmuxWindow(1)
							setTimeout(() => setIndependenceComplete(true), 100)
						}, 2500)
					}, 500)
					return 100
				}
				return prev + 5
			})
		}, 100)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [showProgress, setActiveTmuxWindow, setIndependenceComplete])

	const progressBar = () => {
		const filled = Math.floor(progress / 5)
		const empty = 20 - filled
		return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${progress}%`
	}

	return (
		<div className="flex h-full w-full flex-col bg-black p-4 font-mono text-sm">
			{lines.map((line, i) => (
				<div key={i} className="text-green">
					{line}
				</div>
			))}
			{showProgress && (
				<div className="text-green">
					{progressBar()}
				</div>
			)}
			{showFinal && (
				<div className="mt-2 text-green font-bold">
					HAVE A NICE DAY
				</div>
			)}
			{!showFinal && lines.length > 0 && (
				<span className="mt-2 inline-block h-4 w-2 animate-pulse bg-green" />
			)}
		</div>
	)
}
