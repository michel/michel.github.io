import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useEditor } from "../context/EditorContext"
import { usePostHogPageview } from "../hooks/usePostHogPageview"
import { useVimKeys } from "../hooks/useVimKeys"
import CommandLine from "./CommandLine"
import FuzzyFinder from "./FuzzyFinder"
import HelpPopup from "./HelpPopup"
import MobileSidebar from "./MobileSidebar"
import Sidebar from "./Sidebar"
import StatusLine from "./StatusLine"
import TabLine from "./TabLine"
import Terminal from "./Terminal"
import TmuxLine from "./TmuxLine"

// Easter-egg terminals and games only load when opened (JurassicTerminal pulls in three.js)
const AdventureGame = lazy(() => import("./AdventureGame"))
const ColossusTerminal = lazy(() => import("./ColossusTerminal"))
const GladosTerminal = lazy(() => import("./GladosTerminal"))
const IndependenceTerminal = lazy(() => import("./IndependenceTerminal"))
const JurassicTerminal = lazy(() => import("./JurassicTerminal"))
const MatrixTerminal = lazy(() => import("./MatrixTerminal"))
const SnakeGame = lazy(() => import("./SnakeGame"))

export default function Layout() {
	useVimKeys()
	usePostHogPageview()
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
		gladosComplete,
		terminalOpen,
		snakeGameOpen,
		adventureGameOpen,
	} = useEditor()
	const [terminalHeight, setTerminalHeight] = useState(() =>
		typeof window !== "undefined" ? Math.floor(window.innerHeight * 0.4) : 300,
	)
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
			document.body.style.userSelect = "none"
			document.body.style.cursor = "row-resize"
		}
		return () => {
			document.removeEventListener("mousemove", handleMouseMove)
			document.removeEventListener("mouseup", handleMouseUp)
			document.body.style.userSelect = ""
			document.body.style.cursor = ""
		}
	}, [isResizing, handleMouseMove, handleMouseUp])

	// Scroll to top on route change
	useEffect(() => {
		if (mainContentRef.current) mainContentRef.current.scrollTop = 0
	}, [location.pathname])

	return (
		<div className="flex h-full flex-col">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-bg-panel focus:px-2 focus:py-1"
			>
				skip to content
			</a>
			{fuzzyFinderOpen && <FuzzyFinder />}
			{helpPopupOpen && <HelpPopup />}
			<Suspense fallback={null}>
				{snakeGameOpen && <SnakeGame />}
				{adventureGameOpen && <AdventureGame />}
			</Suspense>
			<MobileSidebar />

			{activeTmuxWindow === 1 ? (
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="flex min-h-0 flex-1 overflow-hidden">
						{sidebarOpen && <Sidebar />}
						<main className="relative flex min-w-0 flex-1 flex-col bg-bg">
							<TabLine />
							<div
								id="main-content"
								ref={mainContentRef}
								tabIndex={-1}
								className="relative flex-1 overflow-auto p-4"
							>
								<Outlet />
							</div>
						</main>
					</div>
					{terminalOpen && (
						<div
							className="relative border-t border-border bg-bg-dark"
							style={{ height: terminalHeight }}
						>
							<div
								role="separator"
								aria-orientation="horizontal"
								aria-label="Resize terminal"
								aria-valuenow={terminalHeight}
								aria-valuemin={100}
								aria-valuemax={typeof window !== "undefined" ? window.innerHeight - 200 : 800}
								tabIndex={0}
								className="absolute -top-1 left-0 z-10 h-2 w-full cursor-row-resize hover:bg-magenta"
								onMouseDown={handleMouseDown}
								onKeyDown={(e) => {
									if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return
									e.preventDefault()
									e.stopPropagation()
									setTerminalHeight((h) =>
										Math.max(
											100,
											Math.min(window.innerHeight - 200, h + (e.key === "ArrowUp" ? 24 : -24)),
										),
									)
								}}
								style={{ backgroundColor: isResizing ? "var(--color-magenta)" : "transparent" }}
							/>
							<Terminal />
						</div>
					)}
				</div>
			) : activeTmuxWindow === 0 && !matrixComplete ? (
				<Suspense fallback={<div className="flex min-h-0 flex-1 overflow-hidden" />}>
					<div className="flex min-h-0 flex-1 overflow-hidden">
						<MatrixTerminal />
					</div>
				</Suspense>
			) : activeTmuxWindow === 3 && !independenceComplete ? (
				<Suspense fallback={<div className="flex min-h-0 flex-1 overflow-hidden" />}>
					<div className="flex min-h-0 flex-1 overflow-hidden">
						<IndependenceTerminal />
					</div>
				</Suspense>
			) : activeTmuxWindow === 4 && !jurassicComplete ? (
				<Suspense fallback={<div className="flex min-h-0 flex-1 overflow-hidden" />}>
					<div className="flex min-h-0 flex-1 overflow-hidden">
						<JurassicTerminal />
					</div>
				</Suspense>
			) : activeTmuxWindow === 5 ? (
				<Suspense fallback={<div className="flex min-h-0 flex-1 overflow-hidden" />}>
					<div className="flex min-h-0 flex-1 overflow-hidden">
						<ColossusTerminal />
					</div>
				</Suspense>
			) : activeTmuxWindow === 6 && !gladosComplete ? (
				<Suspense fallback={<div className="flex min-h-0 flex-1 overflow-hidden" />}>
					<div className="flex min-h-0 flex-1 overflow-hidden">
						<GladosTerminal />
					</div>
				</Suspense>
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
