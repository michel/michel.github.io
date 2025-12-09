import { Outlet } from "react-router-dom"
import { useEditor } from "../context/EditorContext"
import { useVimKeys } from "../hooks/useVimKeys"
import AdventureGame from "./AdventureGame"
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
	const { sidebarOpen, fuzzyFinderOpen, helpPopupOpen, activeTmuxWindow, matrixComplete, independenceComplete, jurassicComplete, terminalOpen, snakeGameOpen, adventureGameOpen } = useEditor()

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
							<div className="relative flex-1 overflow-auto p-4 outline-none">
								<Outlet />
							</div>
						</main>
					</div>
					{terminalOpen && (
						<div className="h-[40%] min-h-[200px] border-t border-[#4a4670] bg-bg-dark">
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
