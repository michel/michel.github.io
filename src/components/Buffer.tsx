import type { ReactNode } from "react"

interface BufferProps {
	lines: ReactNode[]
}

export default function Buffer({ lines }: BufferProps) {
	return (
		<div className="h-full" style={{ maxWidth: "128ch" }}>
			{lines.map((line, i) => (
				<div key={i} className="flex">
					<div className="select-none pr-4 text-right text-comment opacity-50 shrink-0" style={{ width: "3rem" }}>
						{i + 1}
					</div>
					<div className="flex-1 min-w-0">{line || <br />}</div>
				</div>
			))}
		</div>
	)
}
