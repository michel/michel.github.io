import { useCallback, useEffect, useMemo, useRef } from "react"
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
		activeTmuxWindow,
		setActiveTmuxWindow,
		tmuxPrefixActive,
		setTmuxPrefixActive,
	} = useEditor()

	const visibleNodes = useMemo(
		() => flattenVisibleTree(fileTree, expandedFolders),
		[expandedFolders],
	)

	const prefixTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const gPrefixRef = useRef(false)
	const handlerRef = useRef<(e: KeyboardEvent) => void>(() => {})

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

	const handleKeyDown = (e: KeyboardEvent) => {
		const target = e.target as HTMLElement
		const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

		// Ctrl+` toggles terminal panel
		if (e.ctrlKey && e.code === "Backquote") {
			e.preventDefault()
			toggleTerminal()
			return
		}

		// Ctrl+a activates tmux prefix mode
		if (e.ctrlKey && e.key === "a") {
			e.preventDefault()
			if (prefixTimeoutRef.current) clearTimeout(prefixTimeoutRef.current)
			setTmuxPrefixActive(true)
			prefixTimeoutRef.current = setTimeout(() => setTmuxPrefixActive(false), 500)
			return
		}

		// When tmux prefix is active, 0-9 switches windows
		if (tmuxPrefixActive && e.key >= "0" && e.key <= "6") {
			e.preventDefault()
			if (prefixTimeoutRef.current) clearTimeout(prefixTimeoutRef.current)
			setTmuxPrefixActive(false)
			setActiveTmuxWindow(Number.parseInt(e.key, 10) as 0 | 1 | 2 | 3 | 4 | 5 | 6)
			return
		}

		// Any other key cancels tmux prefix mode
		if (tmuxPrefixActive) {
			if (prefixTimeoutRef.current) clearTimeout(prefixTimeoutRef.current)
			setTmuxPrefixActive(false)
		}

		if (
			commandLineOpen ||
			fuzzyFinderOpen ||
			helpPopupOpen ||
			adventureGameOpen ||
			snakeGameOpen ||
			activeTmuxWindow !== 1 ||
			document.querySelector('[aria-modal="true"]')
		)
			return

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

		// Typing in an input belongs to that input — each input handles its own keys
		if (isInput) return

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
				// gt / gT cycle buffers, vim-style; Tab stays native so focus navigation works
				case "g":
					e.preventDefault()
					gPrefixRef.current = true
					setTimeout(() => {
						gPrefixRef.current = false
					}, 600)
					break
				case "t":
					if (gPrefixRef.current) {
						e.preventDefault()
						gPrefixRef.current = false
						cycleBuffer(1)
					}
					break
				case "T":
					if (gPrefixRef.current) {
						e.preventDefault()
						gPrefixRef.current = false
						cycleBuffer(-1)
					}
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

	useEffect(() => {
		handlerRef.current = handleKeyDown
	})

	useEffect(() => {
		const listener = (e: KeyboardEvent) => handlerRef.current(e)
		window.addEventListener("keydown", listener)
		return () => window.removeEventListener("keydown", listener)
	}, [])
}
