import { type ReactNode, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { useEditor } from "../context/EditorContext"

interface BufferProps {
	lines: ReactNode[]
}

export default function Buffer({ lines }: BufferProps) {
	const [gutterLineCount, setGutterLineCount] = useState(50)
	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const { cursorLine, setCursorLine, setLineCount } = useEditor()
	const location = useLocation()

	useEffect(() => {
		if (!containerRef.current) return

		const updateGutterLineCount = () => {
			if (!containerRef.current) return
			const height = containerRef.current.clientHeight
			const lineHeight = parseFloat(getComputedStyle(containerRef.current).lineHeight)
			setGutterLineCount(Math.ceil(height / lineHeight) + 5)
		}

		const observer = new ResizeObserver(updateGutterLineCount)
		observer.observe(containerRef.current)
		updateGutterLineCount()

		return () => observer.disconnect()
	}, [])

	// Sync line count with context for vim navigation
	useEffect(() => {
		setLineCount(lines.length)
	}, [lines.length, setLineCount])

	// Scroll to top when navigating to a different page
	useEffect(() => {
		if (contentRef.current) contentRef.current.scrollTop = 0
	}, [location.pathname])

	// Auto-scroll to keep cursor visible
	useEffect(() => {
		if (!contentRef.current) return
		const lineElements = contentRef.current.children
		if (lineElements[cursorLine]) {
			const lineEl = lineElements[cursorLine] as HTMLElement
			lineEl.scrollIntoView({ block: "nearest", behavior: "smooth" })
		}
	}, [cursorLine])

	return (
		<div ref={containerRef} className="h-full relative overflow-hidden">
			{/* Gutter - fixed position, doesn't scroll */}
			<div className="absolute top-0 bottom-0 left-0 w-[1.5rem]">
				{Array.from({ length: gutterLineCount }, (_, i) => (
					<div key={i} className="text-right pr-2 text-comment opacity-50 select-none">
						{i + 1}
					</div>
				))}
			</div>

			{/* Content - scrolls independently */}
			<div
				ref={contentRef}
				className="h-full overflow-auto ml-[1.5rem]"
				style={{ maxWidth: "80ch" }}
			>
				<div
					className="absolute top-0 bottom-0 bg-border opacity-30 hidden md:block"
					style={{ left: "calc(1.5rem + 80ch)", width: "1ch" }}
				/>
				{lines.map((line, i) => (
					<div
						key={i}
						onClick={() => setCursorLine(i)}
						className={`cursor-pointer ${i === cursorLine ? "bg-[#373452]" : ""}`}
					>
						{line || <br />}
					</div>
				))}
			</div>
		</div>
	)
}
