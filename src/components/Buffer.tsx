import type { ReactNode } from "react"

interface BufferProps {
	lines: ReactNode[]
}

export default function Buffer({ lines }: BufferProps) {
	return (
		<div className="h-full relative" style={{ maxWidth: "80ch" }}>
			<div
				className="absolute top-0 bottom-0 bg-border opacity-30"
				style={{ left: "calc(3rem + 80ch)", width: "1ch" }}
			/>
			{lines.map((line, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: line order is stable, index is appropriate key
				<div key={i} className="flex">
					<div
						className="select-none pr-4 text-right text-comment opacity-50 shrink-0"
						style={{ width: "3rem" }}
					>
						{i + 1}
					</div>
					<div className="flex-1 min-w-0">{line || <br />}</div>
				</div>
			))}
		</div>
	)
}
