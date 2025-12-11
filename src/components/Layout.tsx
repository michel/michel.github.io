import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useEditor } from "../context/EditorContext"
import { useVimKeys } from "../hooks/useVimKeys"
import AdventureGame from "./AdventureGame"
import ColossusTerminal from "./ColossusTerminal"
import CommandLine from "./CommandLine"
import FuzzyFinder from "./FuzzyFinder"
import HelpPopup from "./HelpPopup"
import IndependenceTerminal from "./IndependenceTerminal"
import JurassicTerminal from "./JurassicTerminal"
import MatrixTerminal from "./MatrixTerminal"
import MobileSidebar from "./MobileSidebar"
import Sidebar from "./Sidebar"
import SnakeGame from "./SnakeGame"
import StatusLine from "./StatusLine"
import TabLine from "./TabLine"
import Terminal from "./Terminal"
import TmuxLine from "./TmuxLine"

export default function Layout() {
	useVimKeys()
	const location = useLocation()
	const mainContentRef = useRef<HTMLDivElement>(null)
	const {
		sidebarOpen,
		fuzzyFinderOpen,
		helpPopupOpen,
		activeTmuxWindow,
		matrixComplete,
		independenceComplete,
		jurassicComplete,
		terminalOpen,
		snakeGameOpen,
		adventureGameOpen,
	} = useEditor()
	const [terminalHeight, setTerminalHeight] = useState(300)
	const [isResizing, setIsResizing] = useState(false)

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		setIsResizing(true)
	}, [])

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return
			const newHeight = Math.max(
				100,
				Math.min(window.innerHeight - 200, window.innerHeight - e.clientY),
			)
			setTerminalHeight(newHeight)
		},
		[isResizing],
	)

	const handleMouseUp = useCallback(() => {
		setIsResizing(false)
	}, [])

	useEffect(() => {
		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove)
			document.addEventListener("mouseup", handleMouseUp)
		}
		return () => {
			document.removeEventListener("mousemove", handleMouseMove)
			document.removeEventListener("mouseup", handleMouseUp)
		}
	}, [isResizing, handleMouseMove, handleMouseUp])

	// Scroll to top on route change
	useEffect(() => {
		if (mainContentRef.current) mainContentRef.current.scrollTop = 0
	}, [location.pathname])

	return (
		<div className="flex h-full flex-col outline-none">
			{fuzzyFinderOpen && <FuzzyFinder />}
			{helpPopupOpen && <HelpPopup />}
			{snakeGameOpen && <SnakeGame />}
			{adventureGameOpen && <AdventureGame />}
			<MobileSidebar />

			{activeTmuxWindow === 1 ? (
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="flex min-h-0 flex-1 overflow-hidden">
						{sidebarOpen && <Sidebar />}
						<main className="relative flex min-w-0 flex-1 flex-col bg-bg">
							<TabLine />
							<div ref={mainContentRef} className="relative flex-1 overflow-auto p-4 outline-none">
								<Outlet />
							</div>
						</main>
					</div>
					{terminalOpen && (
						<div
							className="relative border-t border-[#4a4670] bg-bg-dark"
							style={{ height: terminalHeight }}
						>
							<div
								className="absolute left-0 top-0 h-1 w-full cursor-row-resize hover:bg-magenta"
								onMouseDown={handleMouseDown}
								style={{ backgroundColor: isResizing ? "var(--color-magenta)" : "transparent" }}
							/>
							<Terminal />
						</div>
					)}
				</div>
			) : activeTmuxWindow === 0 && !matrixComplete ? (
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<MatrixTerminal />
				</div>
			) : activeTmuxWindow === 3 && !independenceComplete ? (
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<IndependenceTerminal />
				</div>
			) : activeTmuxWindow === 4 && !jurassicComplete ? (
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<JurassicTerminal />
				</div>
			) : activeTmuxWindow === 5 ? (
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<ColossusTerminal />
				</div>
			) : (
				<div className="flex min-h-0 flex-1 overflow-hidden bg-bg-dark">
					<Terminal />
				</div>
			)}

			<StatusLine />
			<TmuxLine />
			<CommandLine />
		</div>
	)
}
