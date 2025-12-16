import { createContext, type ReactNode, useCallback, useContext, useState } from "react"
import { files, type FileId, getPreview } from "../data/files"

export type VimMode = "NORMAL" | "INSERT" | "VISUAL" | "COMMAND"

export interface FileNode {
	id: string
	name: string
	path: string
	type: "file" | "folder"
	children?: FileNode[]
}

// File tree derived from unified lookup table
export const fileTree: FileNode[] = [
	{
		id: "posts",
		name: "posts/",
		path: "/posts",
		type: "folder",
		children: [
			{
				id: files.rust.id,
				name: files.rust.name,
				path: files.rust.path,
				type: "file",
			},
		],
	},
	{ id: files.home.id, name: files.home.name, path: files.home.path, type: "file" },
	{ id: files.cv.id, name: files.cv.name, path: files.cv.path, type: "file" },
	{ id: files.contact.id, name: files.contact.name, path: files.contact.path, type: "file" },
]

export function flattenVisibleTree(nodes: FileNode[], expandedFolders: Set<string>): FileNode[] {
	const result: FileNode[] = []
	for (const node of nodes) {
		result.push(node)
		if (node.type === "folder" && expandedFolders.has(node.id) && node.children)
			result.push(...flattenVisibleTree(node.children, expandedFolders))
	}
	return result
}

// All files derived from unified lookup table
export const allFiles = Object.values(files).map((f) => ({
	id: f.id,
	name: f.name,
	path: f.path,
	preview: getPreview(f.id as FileId),
}))

export type TmuxWindow = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface EditorState {
	mode: VimMode
	openBuffers: string[]
	sidebarOpen: boolean
	sidebarFocused: boolean
	sidebarCursorIndex: number
	expandedFolders: Set<string>
	mobileSidebarOpen: boolean
	commandLineOpen: boolean
	fuzzyFinderOpen: boolean
	helpPopupOpen: boolean
	terminalOpen: boolean
	terminalFocused: boolean
	activeTmuxWindow: TmuxWindow
	tmuxPrefixActive: boolean
	matrixComplete: boolean
	independenceComplete: boolean
	jurassicComplete: boolean
	gladosComplete: boolean
	snakeGameOpen: boolean
	adventureGameOpen: boolean
	cursorLine: number
	lineCount: number
	pendingTerminalCommand: string | null
}

interface EditorContextType extends EditorState {
	setMode: (mode: VimMode) => void
	openBuffer: (path: string) => void
	closeBuffer: (path: string) => void
	toggleSidebar: () => void
	focusSidebar: () => void
	unfocusSidebar: () => void
	setSidebarCursorIndex: (index: number) => void
	toggleFolder: (folderId: string) => void
	toggleMobileSidebar: () => void
	closeMobileSidebar: () => void
	toggleCommandLine: () => void
	toggleFuzzyFinder: () => void
	closeFuzzyFinder: () => void
	closeCommandLine: () => void
	toggleHelpPopup: () => void
	closeHelpPopup: () => void
	toggleTerminal: () => void
	openTerminal: () => void
	closeTerminal: () => void
	focusTerminal: () => void
	unfocusTerminal: () => void
	setActiveTmuxWindow: (window: TmuxWindow) => void
	setTmuxPrefixActive: (active: boolean) => void
	setMatrixComplete: (complete: boolean) => void
	setIndependenceComplete: (complete: boolean) => void
	setJurassicComplete: (complete: boolean) => void
	setGladosComplete: (complete: boolean) => void
	openSnakeGame: () => void
	closeSnakeGame: () => void
	openAdventureGame: () => void
	closeAdventureGame: () => void
	setCursorLine: (line: number) => void
	setLineCount: (count: number) => void
	moveCursor: (direction: "up" | "down") => void
	queueTerminalCommand: (cmd: string) => void
	clearPendingCommand: () => void
}

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<EditorState>({
		mode: "NORMAL",
		openBuffers: ["/"],
		sidebarOpen: true,
		sidebarFocused: false,
		sidebarCursorIndex: 0,
		expandedFolders: new Set(["posts"]),
		mobileSidebarOpen: false,
		commandLineOpen: false,
		fuzzyFinderOpen: false,
		helpPopupOpen: false,
		terminalOpen: false,
		terminalFocused: false,
		activeTmuxWindow: 1,
		tmuxPrefixActive: false,
		matrixComplete: false,
		independenceComplete: false,
		jurassicComplete: false,
		gladosComplete: false,
		snakeGameOpen: false,
		adventureGameOpen: false,
		cursorLine: 0,
		lineCount: 0,
		pendingTerminalCommand: null,
	})

	const setMode = useCallback((mode: VimMode) => {
		setState((s) => ({ ...s, mode }))
	}, [])

	const openBuffer = useCallback((path: string) => {
		setState((s) => ({
			...s,
			openBuffers: s.openBuffers.includes(path) ? s.openBuffers : [...s.openBuffers, path],
		}))
	}, [])

	const closeBuffer = useCallback((path: string) => {
		setState((s) => ({
			...s,
			openBuffers: s.openBuffers.filter((p) => p !== path),
		}))
	}, [])

	const toggleSidebar = useCallback(() => {
		setState((s) => ({ ...s, sidebarOpen: !s.sidebarOpen, sidebarFocused: false }))
	}, [])

	const focusSidebar = useCallback(() => {
		setState((s) => ({ ...s, sidebarFocused: true }))
	}, [])

	const unfocusSidebar = useCallback(() => {
		setState((s) => ({ ...s, sidebarFocused: false }))
	}, [])

	const setSidebarCursorIndex = useCallback((index: number) => {
		setState((s) => ({ ...s, sidebarCursorIndex: index }))
	}, [])

	const toggleFolder = useCallback((folderId: string) => {
		setState((s) => {
			const newExpanded = new Set(s.expandedFolders)
			if (newExpanded.has(folderId)) newExpanded.delete(folderId)
			else newExpanded.add(folderId)
			return { ...s, expandedFolders: newExpanded }
		})
	}, [])

	const toggleMobileSidebar = useCallback(() => {
		setState((s) => ({ ...s, mobileSidebarOpen: !s.mobileSidebarOpen }))
	}, [])

	const closeMobileSidebar = useCallback(() => {
		setState((s) => ({ ...s, mobileSidebarOpen: false }))
	}, [])

	const toggleCommandLine = useCallback(() => {
		setState((s) => ({
			...s,
			commandLineOpen: !s.commandLineOpen,
			mode: s.commandLineOpen ? "NORMAL" : "COMMAND",
		}))
	}, [])

	const toggleFuzzyFinder = useCallback(() => {
		setState((s) => ({ ...s, fuzzyFinderOpen: !s.fuzzyFinderOpen }))
	}, [])

	const closeFuzzyFinder = useCallback(() => {
		setState((s) => ({ ...s, fuzzyFinderOpen: false }))
	}, [])

	const closeCommandLine = useCallback(() => {
		setState((s) => ({ ...s, commandLineOpen: false, mode: "NORMAL" }))
	}, [])

	const toggleHelpPopup = useCallback(() => {
		setState((s) => ({ ...s, helpPopupOpen: !s.helpPopupOpen }))
	}, [])

	const closeHelpPopup = useCallback(() => {
		setState((s) => ({ ...s, helpPopupOpen: false }))
	}, [])

	const toggleTerminal = useCallback(() => {
		setState((s) => ({
			...s,
			terminalOpen: !s.terminalOpen,
			terminalFocused: !s.terminalOpen,
		}))
	}, [])

	const openTerminal = useCallback(() => {
		setState((s) => ({ ...s, terminalOpen: true, terminalFocused: true }))
	}, [])

	const closeTerminal = useCallback(() => {
		setState((s) => ({ ...s, terminalOpen: false, terminalFocused: false }))
	}, [])

	const focusTerminal = useCallback(() => {
		setState((s) => ({ ...s, terminalFocused: true }))
	}, [])

	const unfocusTerminal = useCallback(() => {
		setState((s) => ({ ...s, terminalFocused: false }))
	}, [])

	const setActiveTmuxWindow = useCallback((window: TmuxWindow) => {
		setState((s) => ({ ...s, activeTmuxWindow: window }))
	}, [])

	const setTmuxPrefixActive = useCallback((active: boolean) => {
		setState((s) => ({ ...s, tmuxPrefixActive: active }))
	}, [])

	const setMatrixComplete = useCallback((complete: boolean) => {
		setState((s) => ({ ...s, matrixComplete: complete }))
	}, [])

	const setIndependenceComplete = useCallback((complete: boolean) => {
		setState((s) => ({ ...s, independenceComplete: complete }))
	}, [])

	const setJurassicComplete = useCallback((complete: boolean) => {
		setState((s) => ({ ...s, jurassicComplete: complete }))
	}, [])

	const setGladosComplete = useCallback((complete: boolean) => {
		setState((s) => ({ ...s, gladosComplete: complete }))
	}, [])

	const openSnakeGame = useCallback(() => {
		setState((s) => ({ ...s, snakeGameOpen: true }))
	}, [])

	const closeSnakeGame = useCallback(() => {
		setState((s) => ({ ...s, snakeGameOpen: false }))
	}, [])

	const openAdventureGame = useCallback(() => {
		setState((s) => ({ ...s, adventureGameOpen: true }))
	}, [])

	const closeAdventureGame = useCallback(() => {
		setState((s) => ({ ...s, adventureGameOpen: false }))
	}, [])

	const setCursorLine = useCallback((line: number) => {
		setState((s) => ({ ...s, cursorLine: Math.max(0, Math.min(line, s.lineCount - 1)) }))
	}, [])

	const setLineCount = useCallback((count: number) => {
		setState((s) => ({ ...s, lineCount: count, cursorLine: Math.min(s.cursorLine, count - 1) }))
	}, [])

	const moveCursor = useCallback((direction: "up" | "down") => {
		setState((s) => {
			const newLine = direction === "down" ? s.cursorLine + 1 : s.cursorLine - 1
			return { ...s, cursorLine: Math.max(0, Math.min(newLine, s.lineCount - 1)) }
		})
	}, [])

	const queueTerminalCommand = useCallback((cmd: string) => {
		setState((s) => ({
			...s,
			terminalOpen: true,
			terminalFocused: true,
			pendingTerminalCommand: cmd,
		}))
	}, [])

	const clearPendingCommand = useCallback(() => {
		setState((s) => ({ ...s, pendingTerminalCommand: null }))
	}, [])

	return (
		<EditorContext.Provider
			value={{
				...state,
				setMode,
				openBuffer,
				closeBuffer,
				toggleSidebar,
				focusSidebar,
				unfocusSidebar,
				setSidebarCursorIndex,
				toggleFolder,
				toggleMobileSidebar,
				closeMobileSidebar,
				toggleCommandLine,
				toggleFuzzyFinder,
				closeFuzzyFinder,
				closeCommandLine,
				toggleHelpPopup,
				closeHelpPopup,
				toggleTerminal,
				openTerminal,
				closeTerminal,
				focusTerminal,
				unfocusTerminal,
				setActiveTmuxWindow,
				setTmuxPrefixActive,
				setMatrixComplete,
				setIndependenceComplete,
				setJurassicComplete,
				setGladosComplete,
				openSnakeGame,
				closeSnakeGame,
				openAdventureGame,
				closeAdventureGame,
				setCursorLine,
				setLineCount,
				moveCursor,
				queueTerminalCommand,
				clearPendingCommand,
			}}
		>
			{children}
		</EditorContext.Provider>
	)
}

export function useEditor() {
	const context = useContext(EditorContext)
	if (!context) throw new Error("useEditor must be used within EditorProvider")
	return context
}
