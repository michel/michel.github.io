import { type ReactNode, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useEditor } from "../context/EditorContext"

interface BufferProps {
	lines: ReactNode[]
}

export default function Buffer({ lines }: BufferProps) {
	const contentRef = useRef<HTMLDivElement>(null)
	const { cursorLine, setCursorLine, setLineCount } = useEditor()
	const location = useLocation()

	// Sync line count with context for vim navigation; clear it when no buffer is mounted
	useEffect(() => {
		setLineCount(lines.length)
		return () => setLineCount(0)
	}, [lines.length, setLineCount])

	// Scroll to top and reset the cursor when navigating to a different page
	useEffect(() => {
		if (contentRef.current) contentRef.current.scrollTop = 0
		setCursorLine(0)
	}, [location.pathname, setCursorLine])

	// Auto-scroll to keep cursor visible
	useEffect(() => {
		if (!contentRef.current) return
		const lineEl = contentRef.current.children[cursorLine] as HTMLElement | undefined
		lineEl?.scrollIntoView({ block: "nearest", behavior: "auto" })
	}, [cursorLine])

	return (
		<div className="relative h-full overflow-hidden">
			{/* Colorcolumn at the 80ch mark of the text column */}
			<div
				className="absolute top-0 bottom-0 hidden bg-border opacity-30 md:block"
				style={{ left: "calc(4ch + 80ch)", width: "1ch" }}
			/>

			<div ref={contentRef} className="h-full overflow-auto">
				{lines.map((line, i) => (
					<div
						key={i}
						onClick={() => setCursorLine(i)}
						className={`flex cursor-pointer transition-colors duration-100 ${
							i === cursorLine ? "bg-bg-active" : "hover:bg-black/40"
						}`}
					>
						<span
							aria-hidden="true"
							className={`w-[4ch] shrink-0 select-none pr-2 text-right ${
								i === cursorLine ? "text-fg" : "text-comment"
							}`}
						>
							{i + 1}
						</span>
						<div className="min-w-0 max-w-[80ch] flex-1">{line || <br />}</div>
					</div>
				))}
			</div>
		</div>
	)
}
