import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { allFiles, useEditor } from "../context/EditorContext"

export default function FuzzyFinder() {
	const [query, setQuery] = useState("")
	const [selectedIndex, setSelectedIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const navigate = useNavigate()
	const { closeFuzzyFinder, openBuffer } = useEditor()

	const filtered = allFiles.filter(
		(f) =>
			f.name.toLowerCase().includes(query.toLowerCase()) ||
			f.path.toLowerCase().includes(query.toLowerCase()),
	)

	const selectedFile = filtered[selectedIndex]

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset selection when query changes
	useEffect(() => {
		setSelectedIndex(0)
	}, [query])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			closeFuzzyFinder()
		} else if (e.key === "ArrowDown" || (e.ctrlKey && (e.key === "n" || e.key === "j"))) {
			e.preventDefault()
			setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
		} else if (e.key === "ArrowUp" || (e.ctrlKey && (e.key === "p" || e.key === "k"))) {
			e.preventDefault()
			setSelectedIndex((i) => Math.max(i - 1, 0))
		} else if (e.key === "Enter") {
			if (selectedFile) {
				openBuffer(selectedFile.path)
				navigate(selectedFile.path)
				closeFuzzyFinder()
			}
		}
	}

	const handleSelect = (path: string) => {
		openBuffer(path)
		navigate(path)
		closeFuzzyFinder()
	}

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center">
			<div className="flex w-[80vw] gap-4">
				{/* Left column: Results + Find Files */}
				<div className="flex flex-[2] flex-col gap-4">
					{/* Results box */}
					<div className="relative flex h-52 flex-col rounded-lg border border-[#4a4670] bg-bg-dark pt-2">
						<span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bg-dark px-2 text-comment">
							Results
						</span>
						<div className="flex-1 overflow-y-auto overflow-x-hidden">
							{filtered.map((f, idx) => (
								<div
									key={f.id}
									onClick={() => handleSelect(f.path)}
									className={`flex cursor-pointer items-center gap-2 px-3 py-1 ${
										idx === selectedIndex ? "bg-bg-panel text-fg" : "text-comment hover:bg-bg-panel"
									}`}
								>
									<span className={idx === selectedIndex ? "text-magenta" : "text-comment"}>
										{idx === selectedIndex ? ">" : " "}
									</span>
									<span className="text-fg">{f.name}</span>
									<span className="ml-auto text-comment">{f.path}</span>
								</div>
							))}
						</div>
					</div>

					{/* Find Files box */}
					<div className="relative rounded-lg border border-[#4a4670] bg-bg-dark pt-2">
						<span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bg-dark px-2 text-comment">
							Find Files
						</span>
						<div className="flex items-center gap-2 p-2">
							<span className="text-magenta">&gt;</span>
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								className="flex-1 border-none bg-transparent text-fg outline-none"
								placeholder="Type filename..."
							/>
						</div>
					</div>
				</div>

				{/* Right column: Preview box */}
				<div className="relative flex flex-[5] flex-col rounded-lg border border-[#4a4670] bg-bg-dark pt-2">
					<span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bg-dark px-2 text-comment">
						Grep Preview
					</span>
					<div className="flex-1 overflow-y-auto overflow-x-hidden whitespace-pre-wrap p-3 text-fg">
						{selectedFile?.preview ?? ""}
					</div>
				</div>
			</div>
		</div>
	)
}
