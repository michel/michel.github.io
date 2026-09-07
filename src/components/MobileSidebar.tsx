import { ChevronDown, ChevronRight, FileText, FolderClosed } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { type FileNode, fileTree, useEditor } from "../context/EditorContext"

const rowBase =
	"flex min-h-9 w-full items-center gap-1 border-l-2 border-l-transparent py-1 text-left transition-colors duration-100 hover:bg-black"

function FileTreeNode({
	node,
	depth = 0,
	onSelect,
}: {
	node: FileNode
	depth?: number
	onSelect: () => void
}) {
	const [expanded, setExpanded] = useState(true)
	const location = useLocation()
	const { openBuffer } = useEditor()

	const isActive = location.pathname === node.path
	const paddingLeft = `${depth * 1}rem`

	if (node.type === "folder") {
		return (
			<>
				<button
					type="button"
					className={rowBase}
					style={{ paddingLeft }}
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? (
						<ChevronDown aria-hidden="true" className="h-3 w-3 shrink-0 text-blue" />
					) : (
						<ChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-blue" />
					)}
					<FolderClosed aria-hidden="true" className="h-3 w-3 shrink-0 text-yellow" />
					<span className="text-fg">{node.name}</span>
				</button>
				{expanded &&
					node.children?.map((child) => (
						<FileTreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
					))}
			</>
		)
	}

	const handleClick = (e: React.MouseEvent) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey) return
		openBuffer(node.path)
		onSelect()
	}

	return (
		<Link
			to={node.path}
			className={`${rowBase} ${isActive ? "border-l-magenta bg-bg-active" : ""}`}
			style={{ paddingLeft }}
			onClick={handleClick}
		>
			<FileText aria-hidden="true" className="h-3 w-3 shrink-0 text-pink" />
			<span className="marquee min-w-0 flex-1 text-fg">
				<span>{node.name}</span>
			</span>
		</Link>
	)
}

export default function MobileSidebar() {
	const { mobileSidebarOpen, closeMobileSidebar } = useEditor()

	if (!mobileSidebarOpen) return null

	return (
		<div id="mobile-sidebar" className="fixed inset-0 z-50 md:hidden">
			<div className="absolute inset-0 bg-black/50" onClick={closeMobileSidebar} />
			<aside className="absolute left-0 top-0 flex h-full w-80 flex-col border-r border-border bg-bg">
				<div className="flex items-center justify-between bg-bg-dark pl-2 font-bold text-magenta">
					re-invention
					<button
						type="button"
						aria-label="Close file tree"
						className="min-h-11 min-w-11 px-3 text-lg text-comment transition-colors duration-100 hover:text-fg"
						onClick={closeMobileSidebar}
					>
						×
					</button>
				</div>
				<div className="flex-1 overflow-y-auto px-2 py-1">
					{fileTree.map((node) => (
						<FileTreeNode key={node.id} node={node} depth={0} onSelect={closeMobileSidebar} />
					))}
				</div>
				<div className="border-t border-border p-1 text-center text-comment">
					"Tap a file to open it"
				</div>
			</aside>
		</div>
	)
}
