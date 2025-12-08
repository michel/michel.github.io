import { Outlet } from "react-router-dom"
import { useEditor } from "../context/EditorContext"
import { useVimKeys } from "../hooks/useVimKeys"
import CommandLine from "./CommandLine"
import FuzzyFinder from "./FuzzyFinder"
import HelpPopup from "./HelpPopup"
import MobileSidebar from "./MobileSidebar"
import Sidebar from "./Sidebar"
import StatusLine from "./StatusLine"
import TabLine from "./TabLine"
import TmuxLine from "./TmuxLine"

export default function Layout() {
	useVimKeys()
	const { sidebarOpen, fuzzyFinderOpen, helpPopupOpen } = useEditor()

	return (
		<div className="flex h-full flex-col outline-none">
			{fuzzyFinderOpen && <FuzzyFinder />}
			{helpPopupOpen && <HelpPopup />}
			<MobileSidebar />

			<div className="flex min-h-0 flex-1 overflow-hidden">
				{sidebarOpen && <Sidebar />}

				<main className="relative flex min-w-0 flex-1 flex-col bg-bg">
					<TabLine />
					<div className="relative flex-1 overflow-auto p-4 outline-none">
						<Outlet />
					</div>
				</main>
			</div>

			<StatusLine />
			<TmuxLine />
			<CommandLine />
		</div>
	)
}
