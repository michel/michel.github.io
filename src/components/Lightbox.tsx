import { useEffect, useRef, useState } from "react"

interface LightboxProps {
	src: string
	alt: string
}

export default function Lightbox({ src, alt }: LightboxProps) {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isOpen) containerRef.current?.focus()
	}, [isOpen])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			e.preventDefault()
			setIsOpen(false)
		}
	}

	return (
		<>
			<div className="flex flex-col gap-1">
				<img
					src={src}
					alt={alt}
					onClick={() => setIsOpen(true)}
					className="max-w-full cursor-pointer rounded border border-border transition-opacity hover:opacity-80"
				/>
				<span className="text-comment text-sm">{`// ${alt}`}</span>
			</div>

			{isOpen && (
				<div
					ref={containerRef}
					tabIndex={-1}
					onKeyDown={handleKeyDown}
					onClick={() => setIsOpen(false)}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none md:p-8"
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="relative flex max-h-full max-w-full flex-col rounded-lg border border-magenta bg-bg-dark p-2"
					>
						<img
							src={src}
							alt={alt}
							className="max-h-[calc(100vh-8rem)] max-w-full rounded object-contain"
						/>
						<div className="mt-2 flex items-center justify-between text-sm">
							<span className="text-comment">{`// ${alt}`}</span>
							<span className="text-comment opacity-50">Press Esc to close</span>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
