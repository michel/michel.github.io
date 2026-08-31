import { Home, Palette } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { allFiles, useEditor } from "../context/EditorContext"
import { themeNames, themes } from "../data/themes"

export default function TabLine() {
	const location = useLocation()
	const { openBuffers, toggleMobileSidebar, mobileSidebarOpen, theme, setTheme } = useEditor()

	const cycleTheme = () => {
		const currentIndex = themeNames.indexOf(theme)
		const nextIndex = (currentIndex + 1) % themeNames.length
		setTheme(themeNames[nextIndex] ?? "default")
	}

	return (
		<div className="flex select-none overflow-x-auto bg-bg-dark">
			<button
				type="button"
				aria-label="File tree"
				aria-expanded={mobileSidebarOpen}
				aria-controls="mobile-sidebar"
				className="flex min-h-7 min-w-9 items-center justify-center px-2 py-1 text-magenta transition-colors duration-100 hover:bg-bg-panel md:hidden"
				onClick={toggleMobileSidebar}
			>
				<Home aria-hidden="true" className="h-4 w-4 text-magenta" />
			</button>
			{openBuffers.map((path, idx) => {
				const file = allFiles.find((f) => f.path === path)
				const isActive = location.pathname === path
				const nextPath = openBuffers[idx + 1]
				const isNextActive = nextPath && location.pathname === nextPath
				const name = file?.name ?? path

				return (
					<div key={path} className="flex items-center">
						<Link
							to={path}
							className={`flex items-center gap-1 py-1 pl-3 pr-2 transition-colors duration-100 ${
								isActive
									? "bg-magenta font-bold text-black focus-visible:outline-bg-dark"
									: "text-magenta hover:bg-bg-panel"
							}`}
						>
							<span aria-hidden="true" className="w-[1ch] shrink-0">
								{isActive ? "●" : ""}
							</span>
							{name}
						</Link>
						{isActive ? (
							<div
								className="h-0 w-0"
								style={{
									borderTop: "var(--tab-arrow-outer) solid transparent",
									borderBottom: "var(--tab-arrow-outer) solid transparent",
									borderLeft: "var(--tab-arrow-left) solid var(--color-magenta)",
								}}
							/>
						) : isNextActive ? (
							<div className="relative" style={{ backgroundColor: "var(--color-magenta)" }}>
								<div
									className="h-0 w-0"
									style={{
										borderTop: "var(--tab-arrow-outer) solid transparent",
										borderBottom: "var(--tab-arrow-outer) solid transparent",
										borderLeft: "0px solid var(--color-magenta)",
									}}
								/>
								<div
									className="absolute left-0 h-0 w-0"
									style={{
										top: "var(--tab-arrow-inset)",
										borderTop: "var(--tab-arrow-inner) solid transparent",
										borderBottom: "var(--tab-arrow-inner) solid transparent",
										borderLeft: "var(--tab-arrow-left) solid var(--color-bg-dark)",
									}}
								/>
							</div>
						) : (
							<div className="relative" style={{ backgroundColor: "transparent" }}>
								<div
									className="h-0 w-0"
									style={{
										borderTop: "var(--tab-arrow-outer) solid transparent",
										borderBottom: "var(--tab-arrow-outer) solid transparent",
										borderLeft: "var(--tab-arrow-left-lg) solid var(--color-magenta)",
									}}
								/>
								<div
									className="absolute left-0 h-0 w-0"
									style={{
										top: "var(--tab-arrow-inset)",
										borderTop: "var(--tab-arrow-inner) solid transparent",
										borderBottom: "var(--tab-arrow-inner) solid transparent",
										borderLeft: "var(--tab-arrow-left) solid var(--color-bg-dark)",
									}}
								/>
							</div>
						)}
					</div>
				)
			})}
			{/* Theme toggle */}
			<button
				type="button"
				aria-label="Cycle color theme"
				className="group relative ml-auto px-3 py-1 text-comment transition-colors duration-100 hover:text-fg"
				onClick={cycleTheme}
			>
				<Palette aria-hidden="true" className="h-4 w-4" />
				<span className="pointer-events-none absolute right-0 top-full z-20 mt-1 block opacity-0 transition-opacity group-hover:opacity-100">
					<span className="block whitespace-nowrap border border-border bg-bg-dark px-2 py-1 text-xs text-fg">
						Theme: <span className="text-cyan">{themes[theme]?.label ?? theme}</span>
					</span>
				</span>
			</button>
		</div>
	)
}
