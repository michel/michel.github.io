import { useCallback, useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { fileTree, flattenVisibleTree, useEditor } from "../context/EditorContext"

export function useVimKeys() {
	const navigate = useNavigate()
	const location = useLocation()
	const {
		mode,
		setMode,
		openBuffers,
		closeBuffer,
		toggleCommandLine,
		toggleFuzzyFinder,
		toggleHelpPopup,
		commandLineOpen,
		fuzzyFinderOpen,
		helpPopupOpen,
		sidebarOpen,
		sidebarFocused,
		sidebarCursorIndex,
		expandedFolders,
		focusSidebar,
		unfocusSidebar,
		setSidebarCursorIndex,
		toggleFolder,
		openBuffer,
		toggleTerminal,
		terminalOpen,
		terminalFocused,
		focusTerminal,
		unfocusTerminal,
		adventureGameOpen,
		snakeGameOpen,
		moveCursor,
	} = useEditor()

	const visibleNodes = useMemo(
		() => flattenVisibleTree(fileTree, expandedFolders),
		[expandedFolders],
	)

	const cycleBuffer = useCallback(
		(direction: 1 | -1) => {
			const currentIndex = openBuffers.indexOf(location.pathname)
			if (currentIndex === -1) return

			let newIndex = currentIndex + direction
			if (newIndex < 0) newIndex = openBuffers.length - 1
			if (newIndex >= openBuffers.length) newIndex = 0

			const newPath = openBuffers[newIndex]
			if (newPath) navigate(newPath)
		},
		[openBuffers, location.pathname, navigate],
	)

	const closeCurrentBuffer = useCallback(() => {
		if (openBuffers.length <= 1) return

		const currentIndex = openBuffers.indexOf(location.pathname)
		if (currentIndex === -1) return

		const nextIndex = currentIndex === openBuffers.length - 1 ? currentIndex - 1 : currentIndex
		const nextPath = openBuffers[nextIndex === currentIndex ? currentIndex + 1 : nextIndex]

		closeBuffer(location.pathname)
		if (nextPath) navigate(nextPath)
	}, [openBuffers, location.pathname, closeBuffer, navigate])

	const closeOtherBuffers = useCallback(() => {
		openBuffers.forEach((path) => {
			if (path !== location.pathname) closeBuffer(path)
		})
	}, [openBuffers, location.pathname, closeBuffer])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

			// Ctrl+` toggles terminal panel
			if (e.ctrlKey && e.code === "Backquote") {
				e.preventDefault()
				toggleTerminal()
				return
			}

			if (commandLineOpen || fuzzyFinderOpen || helpPopupOpen || adventureGameOpen || snakeGameOpen)
				return
			if (isInput && mode !== "NORMAL") return

			if (e.ctrlKey && e.key === "p") {
				e.preventDefault()
				toggleFuzzyFinder()
				return
			}

			// Ctrl+w cycles focus: buffer → sidebar → terminal → buffer
			if (e.ctrlKey && e.key === "w") {
				e.preventDefault()
				if (terminalFocused) {
					unfocusTerminal()
				} else if (sidebarFocused) {
					unfocusSidebar()
					if (terminalOpen) focusTerminal()
				} else {
					if (sidebarOpen) focusSidebar()
					else if (terminalOpen) focusTerminal()
				}
				return
			}

			if (mode === "NORMAL") {
				// Sidebar-focused navigation
				if (sidebarFocused) {
					switch (e.key) {
						case "j": {
							e.preventDefault()
							const newIndex = Math.min(sidebarCursorIndex + 1, visibleNodes.length - 1)
							setSidebarCursorIndex(newIndex)
							break
						}
						case "k": {
							e.preventDefault()
							const newIndex = Math.max(sidebarCursorIndex - 1, 0)
							setSidebarCursorIndex(newIndex)
							break
						}
						case "Enter": {
							e.preventDefault()
							const node = visibleNodes[sidebarCursorIndex]
							if (node) {
								if (node.type === "folder") {
									toggleFolder(node.id)
								} else {
									openBuffer(node.path)
									navigate(node.path)
									unfocusSidebar()
								}
							}
							break
						}
						case "Escape":
							e.preventDefault()
							unfocusSidebar()
							break
						case "?":
							e.preventDefault()
							toggleHelpPopup()
							break
					}
					return
				}

				// Buffer-focused navigation
				switch (e.key) {
					case "i":
						e.preventDefault()
						setMode("INSERT")
						break
					case "v":
						e.preventDefault()
						setMode("VISUAL")
						break
					case ":":
						e.preventDefault()
						toggleCommandLine()
						break
					case "Tab":
						e.preventDefault()
						if (e.shiftKey) cycleBuffer(-1)
						else cycleBuffer(1)
						break
					case "?":
						e.preventDefault()
						toggleHelpPopup()
						break
					case "x":
						e.preventDefault()
						closeCurrentBuffer()
						break
					case "X":
						e.preventDefault()
						closeOtherBuffers()
						break
					case "j":
					case "ArrowDown":
						e.preventDefault()
						moveCursor("down")
						break
					case "k":
					case "ArrowUp":
						e.preventDefault()
						moveCursor("up")
						break
				}
			} else if (mode === "INSERT" || mode === "VISUAL") {
				if (e.key === "Escape") {
					e.preventDefault()
					setMode("NORMAL")
				}
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [
		mode,
		setMode,
		cycleBuffer,
		closeCurrentBuffer,
		closeOtherBuffers,
		toggleCommandLine,
		toggleFuzzyFinder,
		toggleHelpPopup,
		commandLineOpen,
		fuzzyFinderOpen,
		helpPopupOpen,
		adventureGameOpen,
		snakeGameOpen,
		sidebarOpen,
		sidebarFocused,
		sidebarCursorIndex,
		visibleNodes,
		setSidebarCursorIndex,
		toggleFolder,
		openBuffer,
		navigate,
		focusSidebar,
		unfocusSidebar,
		toggleTerminal,
		terminalOpen,
		terminalFocused,
		focusTerminal,
		unfocusTerminal,
		moveCursor,
	])
}
