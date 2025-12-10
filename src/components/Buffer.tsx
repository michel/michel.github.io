import { useEffect, useRef, useState, type ReactNode } from "react"

interface BufferProps {
	lines: ReactNode[]
}

export default function Buffer({ lines }: BufferProps) {
	const [lineCount, setLineCount] = useState(50)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		const updateLineCount = () => {
			if (!containerRef.current) return
			const height = containerRef.current.clientHeight
			const lineHeight = parseFloat(getComputedStyle(containerRef.current).lineHeight)
			setLineCount(Math.ceil(height / lineHeight) + 5)
		}

		const observer = new ResizeObserver(updateLineCount)
		observer.observe(containerRef.current)
		updateLineCount()

		return () => observer.disconnect()
	}, [])

	return (
		<div ref={containerRef} className="h-full relative overflow-hidden">
			{/* Gutter - fixed position, doesn't scroll */}
			<div className="absolute top-0 bottom-0 left-0 w-[2rem]">
				{Array.from({ length: lineCount }, (_, i) => (
					<div key={i} className="text-right pr-2 text-comment opacity-50 select-none">
						{i + 1}
					</div>
				))}
			</div>

			{/* Content - scrolls independently */}
			<div className="h-full overflow-auto ml-[2rem]" style={{ maxWidth: "80ch" }}>
				<div
					className="absolute top-0 bottom-0 bg-border opacity-30 hidden md:block"
					style={{ left: "calc(2rem + 80ch)", width: "1ch" }}
				/>
				{lines.map((line, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: line order is stable, index is appropriate key
					<div key={i}>{line || <br />}</div>
				))}
			</div>
		</div>
	)
}
