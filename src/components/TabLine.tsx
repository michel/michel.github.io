import { Home } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { allFiles, useEditor } from "../context/EditorContext"

export default function TabLine() {
	const navigate = useNavigate()
	const location = useLocation()
	const { openBuffers, toggleMobileSidebar } = useEditor()

	return (
		<div className="flex select-none overflow-x-auto" style={{ backgroundColor: "#191725" }}>
			<button
				type="button"
				className="flex items-center px-2 py-1 hover:bg-black md:hidden"
				onClick={toggleMobileSidebar}
			>
				<Home className="h-4 w-4 text-magenta" />
			</button>
			{openBuffers.map((path, idx) => {
				const file = allFiles.find((f) => f.path === path)
				const isActive = location.pathname === path
				const nextPath = openBuffers[idx + 1]
				const isNextActive = nextPath && location.pathname === nextPath
				const name = file?.name ?? path

				return (
					<div key={path} className="flex items-center">
						<div
							onClick={() => navigate(path)}
							className={`cursor-pointer py-1 pl-3 pr-2 ${
								isActive ? "bg-magenta font-bold text-black pl-6" : "text-magenta"
							}`}
						>
							{name}
						</div>
						{isActive ? (
							<div
								className="h-0 w-0"
								style={{
									borderTop: "14px solid transparent",
									borderBottom: "14px solid transparent",
									borderLeft: "8px solid var(--color-magenta)",
								}}
							/>
						) : isNextActive ? (
							<div className="relative" style={{ backgroundColor: "var(--color-magenta)" }}>
								<div
									className="h-0 w-0"
									style={{
										borderTop: "14px solid transparent",
										borderBottom: "14px solid transparent",
										borderLeft: "0px solid var(--color-magenta)",
									}}
								/>
								<div
									className="absolute left-0 top-[2px] h-0 w-0"
									style={{
										borderTop: "12px solid transparent",
										borderBottom: "12px solid transparent",
										borderLeft: "6px solid #191725",
									}}
								/>
							</div>
						) : (
							<div className="relative" style={{ backgroundColor: "transparent" }}>
								<div
									className="h-0 w-0"
									style={{
										borderTop: "14px solid transparent",
										borderBottom: "14px solid transparent",
										borderLeft: "9px solid var(--color-magenta)",
									}}
								/>
								<div
									className="absolute left-0 top-[2px] h-0 w-0"
									style={{
										borderTop: "12px solid transparent",
										borderBottom: "12px solid transparent",
										borderLeft: "8px solid #191725",
									}}
								/>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
