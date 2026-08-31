import { useEffect, useRef, useState } from "react"

interface LightboxProps {
	src: string
	alt: string
	width?: number
	height?: number
}

export default function Lightbox({ src, alt, width, height }: LightboxProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dialogRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isOpen) return
		const previouslyFocused = document.activeElement as HTMLElement | null
		dialogRef.current?.focus()
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return
			e.preventDefault()
			e.stopImmediatePropagation()
			setIsOpen(false)
		}
		window.addEventListener("keydown", handleKeyDown, true)
		return () => {
			window.removeEventListener("keydown", handleKeyDown, true)
			previouslyFocused?.focus()
		}
	}, [isOpen])

	return (
		<>
			<div className="flex flex-col gap-1">
				<button type="button" onClick={() => setIsOpen(true)} className="block text-left">
					<img
						src={src}
						alt={alt}
						width={width}
						height={height}
						loading="lazy"
						decoding="async"
						className="max-w-full outline outline-1 -outline-offset-1 outline-white/10 transition-opacity duration-100 hover:opacity-80"
					/>
				</button>
				<span className="text-comment">{`// ${alt}`}</span>
			</div>

			{isOpen && (
				<div
					ref={dialogRef}
					tabIndex={-1}
					role="dialog"
					aria-modal="true"
					aria-label={alt}
					onClick={() => setIsOpen(false)}
					className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/80 p-4 md:p-8"
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="relative flex max-h-full max-w-full flex-col border border-magenta bg-bg-dark p-2"
					>
						<img
							src={src}
							alt={alt}
							className="max-h-[calc(100vh-8rem)] max-w-full object-contain"
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
