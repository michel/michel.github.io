import { useCallback, useEffect, useMemo, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { fileTree, flattenVisibleTree, useEditor } from "../context/EditorContext"

export function useVimKeys() {
	const navigate = useNavigate()
	const location = useLocation()
	const pendingCtrlW = useRef(false)
	const {
		mode,
		setMode,
		openBuffers,
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
	} = useEditor()

	const visibleNodes = useMemo(
		() => flattenVisibleTree(fileTree, expandedFolders),
		[expandedFolders]
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

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement
			const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

			if (commandLineOpen || fuzzyFinderOpen || helpPopupOpen) return
			if (isInput && mode !== "NORMAL") return

			if (e.ctrlKey && e.key === "p") {
				e.preventDefault()
				toggleFuzzyFinder()
				return
			}

			// Ctrl+w for window navigation - set pending flag
			if (e.ctrlKey && e.key === "w") {
				e.preventDefault()
				pendingCtrlW.current = true
				setTimeout(() => { pendingCtrlW.current = false }, 500)
				return
			}

			// Handle h/l after Ctrl+w for focus switching
			if (pendingCtrlW.current && mode === "NORMAL") {
				pendingCtrlW.current = false
				if (e.key === "h" && sidebarOpen) {
					e.preventDefault()
					focusSidebar()
					return
				}
				if (e.key === "l") {
					e.preventDefault()
					unfocusSidebar()
					return
				}
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
					case "h":
						e.preventDefault()
						cycleBuffer(-1)
						break
					case "l":
						e.preventDefault()
						cycleBuffer(1)
						break
					case "?":
						e.preventDefault()
						toggleHelpPopup()
						break
					case "j": {
						e.preventDefault()
						const content = document.querySelector(".overflow-auto")
						content?.scrollBy({ top: 100, behavior: "smooth" })
						break
					}
					case "k": {
						e.preventDefault()
						const content = document.querySelector(".overflow-auto")
						content?.scrollBy({ top: -100, behavior: "smooth" })
						break
					}
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
		toggleCommandLine,
		toggleFuzzyFinder,
		toggleHelpPopup,
		commandLineOpen,
		fuzzyFinderOpen,
		helpPopupOpen,
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
	])
}
