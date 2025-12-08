import { ChevronDown, ChevronRight, FileText, FolderClosed } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { type FileNode, fileTree, useEditor } from "../context/EditorContext"

function FileTreeNode({ node, depth = 0, onSelect }: { node: FileNode; depth?: number; onSelect: () => void }) {
	const [expanded, setExpanded] = useState(true)
	const navigate = useNavigate()
	const location = useLocation()
	const { openBuffer } = useEditor()

	const isActive = location.pathname === node.path
	const paddingLeft = `${depth * 1}rem`

	if (node.type === "folder") {
		return (
			<>
				<div
					className="flex cursor-pointer items-center gap-1 py-0.5 hover:bg-black"
					style={{ paddingLeft }}
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? (
						<ChevronDown className="h-3 w-3 text-blue" />
					) : (
						<ChevronRight className="h-3 w-3 text-blue" />
					)}
					<FolderClosed className="h-3 w-3 text-yellow" />
					<span className="text-fg">{node.name}</span>
				</div>
				{expanded &&
					node.children?.map((child) => (
						<FileTreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
					))}
			</>
		)
	}

	const handleClick = () => {
		openBuffer(node.path)
		navigate(node.path)
		onSelect()
	}

	return (
		<div
			className={`flex cursor-pointer items-center gap-1 py-0.5 hover:bg-black ${isActive ? "bg-black" : ""}`}
			style={{ paddingLeft }}
			onClick={handleClick}
		>
			<FileText className="h-3 w-3 text-pink" />
			<span className="text-fg">{node.name}</span>
		</div>
	)
}

export default function MobileSidebar() {
	const { mobileSidebarOpen, closeMobileSidebar } = useEditor()

	if (!mobileSidebarOpen) return null

	return (
		<div className="fixed inset-0 z-50 md:hidden">
			<div className="absolute inset-0 bg-black/50" onClick={closeMobileSidebar} />
			<aside className="absolute left-0 top-0 flex h-full w-80 flex-col border-r border-border bg-bg">
				<div className="px-2 py-1 font-bold text-magenta" style={{ backgroundColor: "#191725" }}>
					re-invention
				</div>
				<div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
					{fileTree.map((node) => (
						<FileTreeNode key={node.id} node={node} depth={0} onSelect={closeMobileSidebar} />
					))}
				</div>
				<div className="border-t border-border p-1 text-center text-comment">"Press ? for help"</div>
			</aside>
		</div>
	)
}
