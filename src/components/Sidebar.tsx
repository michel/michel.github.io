import { ChevronDown, ChevronRight, FileText, FolderClosed } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { type FileNode, fileTree, flattenVisibleTree, useEditor } from "../context/EditorContext"

function FileTreeNode({
	node,
	depth = 0,
	isCursor,
	isExpanded,
	onToggle,
}: {
	node: FileNode
	depth?: number
	isCursor: boolean
	isExpanded: boolean
	onToggle: (id: string) => void
}) {
	const navigate = useNavigate()
	const location = useLocation()
	const { openBuffer, sidebarFocused, unfocusSidebar } = useEditor()

	const isActive = location.pathname === node.path
	const paddingLeft = `${depth * 1}rem`
	const cursorClass = isCursor && sidebarFocused ? "bg-black ring-1 ring-magenta" : ""

	if (node.type === "folder") {
		return (
			<div
				className={`flex cursor-pointer items-center gap-1 py-0.5 hover:bg-black ${cursorClass}`}
				style={{ paddingLeft }}
				onClick={() => onToggle(node.id)}
			>
				{isExpanded ? (
					<ChevronDown className="h-3 w-3 text-blue" />
				) : (
					<ChevronRight className="h-3 w-3 text-blue" />
				)}
				<FolderClosed className="h-3 w-3 text-yellow" />
				<span className="text-fg">{node.name}</span>
			</div>
		)
	}

	const handleClick = () => {
		openBuffer(node.path)
		navigate(node.path)
		unfocusSidebar()
	}

	return (
		<div
			className={`flex cursor-pointer items-center gap-1 py-0.5 hover:bg-black ${isActive ? "bg-black" : ""} ${cursorClass}`}
			style={{ paddingLeft }}
			onClick={handleClick}
		>
			<FileText className="h-3 w-3 text-pink" />
			<span className="text-fg">{node.name}</span>
		</div>
	)
}

function getNodeDepth(node: FileNode, tree: FileNode[], depth = 0): number {
	for (const n of tree) {
		if (n.id === node.id) return depth
		if (n.children) {
			const found = getNodeDepth(node, n.children, depth + 1)
			if (found !== -1) return found
		}
	}
	return -1
}

export default function Sidebar() {
	const [width, setWidth] = useState(320)
	const [isResizing, setIsResizing] = useState(false)
	const { sidebarCursorIndex, expandedFolders, toggleFolder, sidebarFocused } = useEditor()

	const visibleNodes = flattenVisibleTree(fileTree, expandedFolders)

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		setIsResizing(true)
	}, [])

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return
			const newWidth = Math.max(150, Math.min(500, e.clientX))
			setWidth(newWidth)
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

	return (
		<aside
			className={`relative hidden flex-col border-r border-border bg-bg md:flex ${sidebarFocused ? "ring-1 ring-inset ring-magenta" : ""}`}
			style={{ width }}
		>
			<div className="px-2 py-1 font-bold text-magenta" style={{ backgroundColor: "#191725" }}>
				re-invention
			</div>
			<div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
				{visibleNodes.map((node, index) => (
					<FileTreeNode
						key={node.id}
						node={node}
						depth={getNodeDepth(node, fileTree)}
						isCursor={index === sidebarCursorIndex}
						isExpanded={expandedFolders.has(node.id)}
						onToggle={toggleFolder}
					/>
				))}
			</div>
			<div className="border-t border-border p-1 text-center text-comment">
				{sidebarFocused ? '"j/k nav, Enter select, ? help"' : '"Ctrl+w focus, ? help"'}
			</div>
			<div
				className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-magenta"
				onMouseDown={handleMouseDown}
				style={{ backgroundColor: isResizing ? "var(--color-magenta)" : "transparent" }}
			/>
		</aside>
	)
}
