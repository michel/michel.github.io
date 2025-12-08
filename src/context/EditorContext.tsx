import { type ReactNode, createContext, useCallback, useContext, useState } from "react"

export type VimMode = "NORMAL" | "INSERT" | "VISUAL" | "COMMAND"

export interface FileNode {
	id: string
	name: string
	path: string
	type: "file" | "folder"
	children?: FileNode[]
}

export const fileTree: FileNode[] = [
	{
		id: "posts",
		name: "posts/",
		path: "/posts",
		type: "folder",
		children: [
			{ id: "rust", name: "learning_rust_the_hard_way.md", path: "/posts/learning-rust-the-hard-way", type: "file" },
		],
	},
	{ id: "home", name: "README.md", path: "/", type: "file" },
	{ id: "cv", name: "about_michel.man", path: "/about", type: "file" },
	{ id: "contact", name: "contact_card.vcf", path: "/contact", type: "file" },
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

export const allFiles = [
	{
		id: "home",
		name: "README.md",
		path: "/",
		preview: `# Welcome to the system.
// Press <Space>f to fuzzy search files.
// Use h/j/k/l to navigate if you're cool.

const status = {
  role: "Tech Lead",
  loc: "NL",
  open_for_work: true
}`,
	},
	{
		id: "rust",
		name: "learning_rust_the_hard_way.md",
		path: "/posts/learning-rust-the-hard-way",
		preview: `---
title: "Learning Rust the Hard Way"
date: "2025-12-04"
---

# Learning Rust the hard way: reverse engineering
# a 2000s P2P protocol

I wanted to really learn Rust. Not tutorials.
Not toy projects. Real systems programming.

So I picked Soulseek, the underground music
sharing network from the early 2000s.`,
	},
	{
		id: "cv",
		name: "about_michel.man",
		path: "/about",
		preview: `MICHEL(1)              General Commands Manual

NAME
    Michel de Graaf - Tech Lead / Software Engineer

SYNOPSIS
    michel [--role tech_lead] [--exp 22_years]

DESCRIPTION
    Tech lead with 22+ years of experience designing
    and building complete systems from the ground up.`,
	},
	{
		id: "contact",
		name: "contact_card.vcf",
		path: "/contact",
		preview: `Email: michel@re-invention.nl
Phone: +31 (0)6 36 42 74 07
Web: re-invention.nl

-- Socials --
Github: github.com/michel
X.com: @micheldegraaf`,
	},
]

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
