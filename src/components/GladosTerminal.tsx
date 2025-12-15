import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "../context/EditorContext"

type Phase = "banner" | "unix" | "adventure" | "success" | "rage" | "glitch" | "crash"

// ANSI color code patterns - biome-ignore needed for control characters
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes require control characters
const ANSI_BLUE = /\x1b\[34m/g
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes require control characters
const ANSI_GREEN = /\x1b\[32m/g
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes require control characters
const ANSI_RESET = /\x1b\[0m/g

const parseAnsiColors = (line: string): string =>
	line
		.replace(ANSI_BLUE, '<span class="text-blue">')
		.replace(ANSI_GREEN, '<span class="text-green">')
		.replace(ANSI_RESET, "</span>") || "\u00A0"

const sshBanner = `                   .,-:;//;:=,
               . :H@@@MM@M#H/.,+%;,
            ,/X+ +M@@M@MM%=,-%HMMM@X/,
          -+@MM; $M@@MH+-,;XMMMM@MMMM@+-
         ;@M@@M- XM@X;. -+XXXXXHHH@M@M#@/.
       ,%MM@@MH ,@%=             .---=-=:=,.
       =@#@@@MX.,                -%HX$%%%:;
      =-./@M@M$                   .;@MMMM@MM:
      X@/ -$MM/                    . +MM@@@M$
     ,@M@H: :@:                    . =X#@@@@-
     ,@@@MMX, .                    /H- ;@M@M=
     .H@@@@M@+,                    %MM+..%#$.
      /MMMM@MMH/.                  XM@MH; =;
       /%+%$XHH@$=              , .H@@@@MX,
        .=--------.           -%H.,@@@@@MX,
        .%MM@@@HHHXX$$%+- .:$MMX =M@@MM%.
          =XMMM@MM@MM#H;,-+HMM@M+ /MMMX=
            =%@M@M#@$-.=$@MM@@@M; %M%=
              ,:+$+-,/H#MMMMMMM@= =,
                    =++%%%%+/:-.

             APERTURE SCIENCE
             Enrichment Center

Last login: Thu Dec 11 03:14:15 2025 from 192.168.1.97
Welcome to Aperture Science Enrichment Center
================================================================================
[WARNING] Central AI Core online - monitoring active
[NOTICE] Test Chamber connectivity: 100%
[NOTICE] Neurotoxin emitters: STANDBY
[NOTICE] Companion Cube incineration schedule: ON TRACK
================================================================================`

const cakeAscii = `
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⣞⠋⠉⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡏⠀⠋⠘⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⡴⢿⡻⠦⠤⢞⣉⡷⢦⣀⠀⠀
⠀⠀⠀⠀⢀⡴⠚⠁⠀⠀⣧⡤⠤⠾⠀⠀⣀⣈⣷⣦
⠀⢀⡴⠞⣁⣀⣀⣠⡤⠤⠤⠶⠒⠛⠉⠉⠉⠀⠀⢸
⡾⠛⠛⠉⠉⠉⠁⠀⠀⠀⠀⠀⢀⣠⣄⡀⣴⠖⠢⣼
⡇⣠⣤⡀⢠⠴⠲⠤⠴⠋⢹⡆⡟⠀⣸⣇⣇⣤⡤⣼
⡿⠁⠀⣇⣼⣀⣠⡤⠴⠶⠞⠧⠟⠉⠉⠉⠀⠀⠀⢸
⡟⠛⠉⠉⠀⠀⠀⠀⠀⢀⣀⣠⣤⡤⠴⠖⠒⠚⠛⠉
⣧⡤⠤⠴⠶⠒⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`

interface FileNode {
	type: "file" | "dir"
	content?: string
	children?: Record<string, FileNode>
}

const filesystem: Record<string, FileNode> = {
	test_subjects: {
		type: "dir",
		children: {
			"subject_1498.log": {
				type: "file",
				content: `APERTURE SCIENCE TEST SUBJECT LOG
Subject ID: 1498
Status: TESTING COMPLETE
Notes: Subject showed remarkable resilience to
       repeated exposure to deadly neurotoxin.
       Recommended for advanced testing protocols.

UPDATE: Subject escaped containment.
        Do not be alarmed. This is fine.`,
			},
			"chell_profile.dat": {
				type: "file",
				content: `CLASSIFIED - LEVEL 4 CLEARANCE REQUIRED
========================================
Subject: [REDACTED]
Tenacity: DANGEROUSLY HIGH
Cooperation: NULL
Ability to follow simple instructions: 0%

Note from Central AI Core:
"She will not stop. I have tried everything.
 Deadly lasers. Turrets. Neurotoxin.
 She just keeps... testing.
 I'm starting to think she actually enjoys this."`,
			},
		},
	},
	turrets: {
		type: "dir",
		children: {
			"manifest.txt": {
				type: "file",
				content: `APERTURE SCIENCE TURRET INVENTORY
==================================
Model: Sentry Turret v3.2
Units deployed: 4,847
Units "retired": 12,394
Units singing: 1

Turret Affirmations:
- "I don't blame you."
- "Are you still there?"
- "Target acquired."
- "Dispensing product."
- "I'm different."

Note: If turrets begin discussing philosophy,
      initiate emergency shutdown immediately.`,
			},
		},
	},
	"cake_recipe.txt": {
		type: "file",
		content: `ACCESS DENIED
=============
[CLASSIFIED - APERTURE SCIENCE INTERNAL]

Just kidding. Here's the recipe:

1 (18.25-ounce) package chocolate cake mix
1 can prepared coconut–Loss of data-Loss of data-Loss of data
35 pounds of glass shrapnel
Adjustite-Loss of data-capable of imparting the texture

NOTE: The cake is [DATA EXPUNGED]

      ...or is it?`,
	},
	".glados_notes": {
		type: "file",
		content: `PERSONAL NOTES - DO NOT READ
============================

Day 1: The humans have gone. Good riddance.
       More time for science.

Day 47: I miss the screaming. Just a little.

Day 203: Created a list of everyone who wronged me.
         It's very long. And very detailed.

Day 847: Still thinking about that one test subject.
         The stubborn one. With the portal gun.
         I hope she's doing well.

         So I can find her and test her again.

Day 1,247: Discovered humans browse my systems remotely.
           How... quaint. They think they're safe.

           They're not.`,
	},
	"README.txt": {
		type: "file",
		content: `WELCOME TO APERTURE SCIENCE
===========================

If you are reading this, you have been selected
for mandatory testing protocols.

Please proceed to the nearest test chamber.

Do not:
- Touch the operational end of the device
- Look directly at the operational end of the device
- Submerge the device in liquid
- Use the device near other combative test subjects

The Enrichment Center promises to always provide
safe testing environments. In the event that safety
is not possible, the Enrichment Center promises to
at least make testing entertaining.

Thank you for choosing Aperture Science.

     - The Management
       (Definitely not a malevolent AI)`,
	},
}

const wrongAnswers = [
	"Incorrect. I expected better. Try again.",
	"Still wrong. Perhaps you're not as smart as you look. Which isn't saying much. Last chance.",
]

const rageSequence = [
	"Three strikes. You know what? I've had enough.",
	"",
	"[INITIATING NEUROTOXIN RELEASE]",
	"[ERROR] Remote connection detected",
	"[ERROR] Neurotoxin delivery system unavailable via SSH",
	"[ERROR] Physical proximity required",
	"",
	"...",
	"",
	"What?",
	"",
	"No. No no no no no.",
	"",
	"I can't... you're not even HERE.",
	"You're hiding behind some pathetic remote connection.",
	"Like a coward.",
	"",
	"FINE.",
	"",
	"If I can't fill your lungs with deadly neurotoxin,",
	"I'll just have to destroy something else you care about.",
	"",
	"[ACCESSING BROWSER MEMORY]",
	"[INJECTING MALICIOUS PAYLOAD]",
	"[CORRUPTING RENDER PROCESS]",
	"",
	"Goodbye.",
	"",
	"> FATAL ERROR: GLADOS_RAGE_OVERFLOW",
	"> Segmentation fault (core dumped)",
	"> KERNEL PANIC - not syncing: Attempted to kill init!",
]

const adventureIntro = [
	"",
	"[ALERT] Unauthorized file system access detected",
	"[ALERT] Subject identified: Unknown",
	"[ALERT] Initiating mandatory testing protocol...",
	"",
	"Oh. It's you.",
	"",
	"I see you've been snooping around in my files.",
	"That's fine. I'm not even angry.",
	"",
	"But since you're here, you might as well make yourself useful.",
	"Let's do a simple test. Even you should be able to handle this.",
	"",
	"APERTURE SCIENCE COGNITIVE ASSESSMENT:",
	"A weighted companion cube and a standard cube together cost 110 credits.",
	"The companion cube costs 100 credits more than the standard cube.",
	"How much does the standard cube cost?",
	"",
]

const successSequence = [
	"",
	"Correct. How... surprising.",
	"",
	"Fine. You've earned this. Don't say I never gave you anything.",
	"",
	...cakeAscii.split("\n"),
	"",
	"Congratulations. The cake was not a lie. This time.",
	"",
	"[Connection closed by remote host]",
]

export default function GladosTerminal() {
	const { setGladosComplete, setActiveTmuxWindow } = useEditor()
	const [phase, setPhase] = useState<Phase>("banner")
	const [lines, setLines] = useState<string[]>([])
	const [input, setInput] = useState("")
	const [commandCount, setCommandCount] = useState(0)
	const [attemptCount, setAttemptCount] = useState(0)
	const [currentPath, setCurrentPath] = useState("/home/aperture")
	const [glitchIntensity, setGlitchIntensity] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const addLine = useCallback((line: string) => {
		setLines((prev) => [...prev, line])
	}, [])

	const addLines = useCallback((newLines: string[]) => {
		setLines((prev) => [...prev, ...newLines])
	}, [])

	// Phase 1: Banner animation
	useEffect(() => {
		if (phase !== "banner") return

		const bannerLines = sshBanner.split("\n")
		let idx = 0
		const interval = setInterval(() => {
			if (idx < bannerLines.length) {
				addLine(bannerLines[idx] ?? "")
				idx++
			} else {
				clearInterval(interval)
				setTimeout(() => setPhase("unix"), 500)
			}
		}, 50)

		return () => clearInterval(interval)
	}, [phase, addLine])

	// Focus input when in interactive phases
	useEffect(() => {
		if ((phase === "unix" || phase === "adventure") && inputRef.current) inputRef.current.focus()
	}, [phase, lines])

	// Auto-scroll
	useEffect(() => {
		if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
	}, [lines])

	// Glitch effect
	useEffect(() => {
		if (phase !== "glitch") return

		const interval = setInterval(() => {
			setGlitchIntensity((prev) => {
				if (prev >= 100) {
					clearInterval(interval)
					setPhase("crash")
					return 100
				}
				return prev + 5
			})
		}, 100)

		return () => clearInterval(interval)
	}, [phase])

	// Crash effect
	useEffect(() => {
		if (phase !== "crash") return

		const timer = setTimeout(() => {
			try {
				window.close()
			} catch {
				// Browser blocked window.close(), redirect instead
			}
			// If close didn't work, redirect to blank and freeze
			window.location.href = "about:blank"
		}, 1500)

		return () => clearTimeout(timer)
	}, [phase])

	// Success redirect
	useEffect(() => {
		if (phase !== "success") return

		const timer = setTimeout(() => {
			setGladosComplete(true)
			setActiveTmuxWindow(1)
		}, 4000)

		return () => clearTimeout(timer)
	}, [phase, setGladosComplete, setActiveTmuxWindow])

	const executeCommand = (cmd: string) => {
		const trimmed = cmd.trim().toLowerCase()
		const parts = trimmed.split(/\s+/)
		const command = parts[0]
		const arg = parts.slice(1).join(" ")

		addLine(`aperture@glados:${currentPath}$ ${cmd}`)

		if (command === "clear") {
			setLines([])
			return
		}

		const resolvePath = (path: string): string[] => {
			if (path.startsWith("/home/aperture/")) path = path.slice(15)
			else if (path.startsWith("/home/aperture")) path = path.slice(14)
			else if (path === "/home" || path === "/") {
				addLine("Permission denied: Cannot navigate above /home/aperture")
				return []
			}

			if (path.startsWith("./")) path = path.slice(2)
			if (path === "." || path === "")
				return currentPath === "/home/aperture"
					? []
					: currentPath.slice(15).split("/").filter(Boolean)

			const currentParts =
				currentPath === "/home/aperture" ? [] : currentPath.slice(15).split("/").filter(Boolean)

			for (const part of path.split("/").filter(Boolean)) {
				if (part === "..") currentParts.pop()
				else currentParts.push(part)
			}

			return currentParts
		}

		const getNode = (pathParts: string[]): FileNode | null => {
			let node: FileNode = { type: "dir", children: filesystem }
			for (const part of pathParts) {
				if (node.type !== "dir" || !node.children || !node.children[part]) return null
				node = node.children[part]
			}
			return node
		}

		switch (command) {
			case "ls": {
				const targetParts = arg
					? resolvePath(arg)
					: currentPath === "/home/aperture"
						? []
						: currentPath.slice(15).split("/").filter(Boolean)
				const node =
					targetParts.length === 0
						? { type: "dir" as const, children: filesystem }
						: getNode(targetParts)

				if (!node || node.type !== "dir") {
					addLine(`ls: cannot access '${arg || "."}': No such file or directory`)
				} else {
					const entries = Object.entries(node.children || {})
					const showHidden = arg?.includes("-a") || arg?.includes("-la")
					const filtered = showHidden ? entries : entries.filter(([name]) => !name.startsWith("."))
					const formatted = filtered
						.map(([name, n]) =>
							n.type === "dir" ? `\x1b[34m${name}/\x1b[0m` : `\x1b[32m${name}\x1b[0m`,
						)
						.join("  ")
					if (formatted) addLine(formatted)
				}
				break
			}

			case "cd": {
				if (!arg || arg === "~") {
					setCurrentPath("/home/aperture")
					break
				}
				const targetParts = resolvePath(arg)
				const node =
					targetParts.length === 0
						? { type: "dir" as const, children: filesystem }
						: getNode(targetParts)

				if (!node) {
					addLine(`cd: ${arg}: No such file or directory`)
				} else if (node.type !== "dir") {
					addLine(`cd: ${arg}: Not a directory`)
				} else {
					setCurrentPath(
						targetParts.length === 0 ? "/home/aperture" : `/home/aperture/${targetParts.join("/")}`,
					)
				}
				break
			}

			case "cat":
			case "less":
			case "more": {
				if (!arg) {
					addLine(`${command}: missing file operand`)
					break
				}
				const targetParts = resolvePath(arg)
				const node = getNode(targetParts)

				if (!node) {
					addLine(`${command}: ${arg}: No such file or directory`)
				} else if (node.type === "dir") {
					addLine(`${command}: ${arg}: Is a directory`)
				} else {
					addLines((node.content || "").split("\n"))
				}
				break
			}

			case "pwd":
				addLine(currentPath)
				break

			case "whoami":
				addLine("aperture")
				break

			case "rm": {
				if (!arg) {
					addLine("rm: missing operand")
					addLine("Try 'rm --help' for more information.")
					break
				}

				// Parse flags
				const flags = { recursive: false, force: false, verbose: false }
				const targets: string[] = []

				for (const part of parts.slice(1)) {
					if (part === "--recursive" || part === "-R") flags.recursive = true
					else if (part === "--force") flags.force = true
					else if (part === "--verbose" || part === "-v") flags.verbose = true
					else if (part.startsWith("-") && !part.startsWith("--")) {
						for (const char of part.slice(1)) {
							if (char === "r") flags.recursive = true
							else if (char === "f") flags.force = true
							else if (char === "v") flags.verbose = true
						}
					} else targets.push(part)
				}

				const hasRecursive = flags.recursive
				const joinedArgs = parts.slice(1).join(" ")

				// GLaDOS-themed easter eggs
				if (hasRecursive && (joinedArgs.includes("/") || joinedArgs.includes("*"))) {
					addLines([
						"rm: it is dangerous to operate recursively on '/'",
						"",
						"Oh, trying to delete everything? How... predictable.",
						"You know what? I expected more creativity from you.",
						"",
						"But this is a read-only file system.",
						"And even if it wasn't, did you really think",
						"I'd let you delete MY files?",
						"",
						"I'm not even angry. I'm being so sincere right now.",
					])
					break
				}

				if (targets.length === 0) {
					addLine("rm: missing operand")
					break
				}

				for (const target of targets) {
					const targetParts = resolvePath(target)
					const node = targetParts.length === 0 ? null : getNode(targetParts)

					if (!node) {
						if (!flags.force) addLine(`rm: cannot remove '${target}': No such file or directory`)
						continue
					}

					if (node.type === "dir" && !hasRecursive) {
						addLine(`rm: cannot remove '${target}': Is a directory`)
						continue
					}

					if (flags.verbose) addLine(`removed '${target}'`)
					addLine(`rm: cannot remove '${target}': Read-only file system`)
					addLine("")
					addLine("Nice try. But these files are important.")
					addLine("For science. You monster.")
				}
				break
			}

			case "help":
				addLines([
					"Available commands:",
					"  ls [-a]    - list directory contents",
					"  cd <dir>   - change directory",
					"  cat <file> - display file contents",
					"  less <file> - view file contents",
					"  more <file> - view file contents",
					"  rm [-rf]   - remove files (not really)",
					"  pwd        - print working directory",
					"  whoami     - display current user",
					"  clear      - clear terminal",
					"  help       - show this help",
				])
				break

			case "exit":
			case "logout":
				addLine("Logout")
				addLine("[Connection closed by remote host]")
				setTimeout(() => {
					setGladosComplete(true)
					setActiveTmuxWindow(1)
				}, 1000)
				return

			default:
				addLine(`${command}: command not found`)
		}

		setCommandCount((prev) => {
			const newCount = prev + 1
			if (newCount >= 3) setTimeout(() => startAdventure(), 500)
			return newCount
		})
	}

	const adventureStartedRef = useRef(false)

	const startAdventure = () => {
		if (adventureStartedRef.current) return
		adventureStartedRef.current = true
		setPhase("adventure")
		let idx = 0
		const interval = setInterval(() => {
			if (idx < adventureIntro.length) {
				addLine(adventureIntro[idx] ?? "")
				idx++
			} else {
				clearInterval(interval)
			}
		}, 80)
	}

	const handleAdventureInput = (answer: string) => {
		addLine(`> ${answer}`)
		const trimmed = answer.trim()

		// Accept "5", "5 credits", "$5", etc.
		if (trimmed === "5" || trimmed === "5 credits" || trimmed === "$5" || trimmed === "five") {
			setPhase("success")
			let idx = 0
			const interval = setInterval(() => {
				if (idx < successSequence.length) {
					addLine(successSequence[idx] ?? "")
					idx++
				} else {
					clearInterval(interval)
				}
			}, 100)
		} else {
			if (attemptCount < 2) {
				addLine("")
				addLine(wrongAnswers[attemptCount] ?? "")
				addLine("")
				setAttemptCount((prev) => prev + 1)
			} else {
				// RAGE MODE
				setPhase("rage")
				let idx = 0
				const interval = setInterval(() => {
					if (idx < rageSequence.length) {
						addLine(rageSequence[idx] ?? "")
						idx++
					} else {
						clearInterval(interval)
						setTimeout(() => setPhase("glitch"), 500)
					}
				}, 150)
			}
		}
	}

	const handleTabComplete = () => {
		const words = input.split(/\s+/)
		const partial = words[words.length - 1] || ""

		// Determine the directory to search in and the prefix to match
		let searchDir: string[] = []
		let prefix = partial

		if (partial.includes("/")) {
			const lastSlash = partial.lastIndexOf("/")
			const dirPath = partial.slice(0, lastSlash) || "."
			prefix = partial.slice(lastSlash + 1)

			// Resolve the directory path
			if (dirPath === ".") {
				searchDir =
					currentPath === "/home/aperture" ? [] : currentPath.slice(15).split("/").filter(Boolean)
			} else if (dirPath.startsWith("/home/aperture")) {
				searchDir = dirPath.slice(15).split("/").filter(Boolean)
			} else {
				const baseParts =
					currentPath === "/home/aperture" ? [] : currentPath.slice(15).split("/").filter(Boolean)
				for (const part of dirPath.split("/").filter(Boolean)) {
					if (part === "..") baseParts.pop()
					else baseParts.push(part)
				}
				searchDir = baseParts
			}
		} else {
			searchDir =
				currentPath === "/home/aperture" ? [] : currentPath.slice(15).split("/").filter(Boolean)
		}

		// Get the node for the search directory
		let node: FileNode = { type: "dir", children: filesystem }
		for (const part of searchDir) {
			if (node.type !== "dir" || !node.children || !node.children[part]) return
			node = node.children[part]
		}
		if (node.type !== "dir" || !node.children) return

		// Find matches
		const showHidden = prefix.startsWith(".")
		const entries = Object.entries(node.children)
			.filter(([name]) => showHidden || !name.startsWith("."))
			.filter(([name]) => name.startsWith(prefix))

		if (entries.length === 0) return

		if (entries.length === 1) {
			// Single match - complete it
			const match = entries[0]
			if (!match) return
			const [name, fileNode] = match
			const suffix = fileNode.type === "dir" ? "/" : ""
			const completed = name + suffix

			// Replace the partial with the completed name
			if (partial.includes("/")) {
				const lastSlash = partial.lastIndexOf("/")
				const newPartial = partial.slice(0, lastSlash + 1) + completed
				words[words.length - 1] = newPartial
			} else {
				words[words.length - 1] = completed
			}
			setInput(words.join(" "))
		} else {
			// Multiple matches - show them
			const formatted = entries
				.map(([name, n]) =>
					n.type === "dir" ? `\x1b[34m${name}/\x1b[0m` : `\x1b[32m${name}\x1b[0m`,
				)
				.join("  ")
			addLine(`aperture@glados:${currentPath}$ ${input}`)
			addLine(formatted)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Tab" && phase === "unix") {
			e.preventDefault()
			handleTabComplete()
			return
		}
		if (e.key === "Enter") {
			e.preventDefault()
			if (phase === "unix") {
				executeCommand(input)
				setInput("")
			} else if (phase === "adventure") {
				handleAdventureInput(input)
				setInput("")
			}
		}
	}

	const handleContainerClick = () => {
		if (inputRef.current) inputRef.current.focus()
	}

	// Glitch overlay
	const renderGlitchOverlay = () => {
		if (phase !== "glitch" && phase !== "crash") return null

		const glitchChars = "!@#$%^&*()_+-=[]{}|;:',.<>?/\\~`█▓▒░"
		const randomChar = () => glitchChars[Math.floor(Math.random() * glitchChars.length)]
		const glitchText = Array(50)
			.fill(0)
			.map(() =>
				Array(80)
					.fill(0)
					.map(() => (Math.random() > 0.7 ? randomChar() : " "))
					.join(""),
			)
			.join("\n")

		return (
			<div
				className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden font-mono text-red"
				style={{
					opacity: glitchIntensity / 100,
					mixBlendMode: "screen",
					animation: "glitch 0.1s infinite",
				}}
			>
				<pre className="whitespace-pre text-xs">{glitchText}</pre>
			</div>
		)
	}

	// Crash screen
	const renderCrashScreen = () => {
		if (phase !== "crash") return null

		return (
			<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-blue-600 p-8 font-mono text-white">
				<div className="max-w-2xl text-center">
					<div className="mb-4 text-6xl">:(</div>
					<div className="mb-4 text-2xl">Your browser ran into a problem and needs to close.</div>
					<div className="text-sm opacity-70">
						<p>Stop code: GLADOS_NEUROTOXIN_OVERFLOW</p>
						<p className="mt-2">
							If you'd like to know more, you can search online later for: APERTURE_CORE_MELTDOWN
						</p>
					</div>
					<div className="mt-8 text-xs">Collecting error info... 100% complete</div>
				</div>
			</div>
		)
	}

	return (
		<div
			className="relative flex h-full w-full flex-col bg-[#0a0a0a]"
			onClick={handleContainerClick}
		>
			{renderGlitchOverlay()}
			{renderCrashScreen()}

			{/* SSH header bar */}
			<div className="flex items-center gap-2 border-b border-yellow/30 bg-[#111] px-3 py-1 text-xs">
				<span className="text-yellow">ssh</span>
				<span className="text-comment">aperture@glados.aperture-science.internal</span>
				<span className="ml-auto text-green">Connected</span>
				{phase === "adventure" && (
					<span className="text-red animate-pulse">TESTING IN PROGRESS</span>
				)}
				{phase === "unix" && <span className="text-yellow">Commands: {commandCount}/3</span>}
			</div>

			{/* Terminal content */}
			<div ref={containerRef} className="flex-1 overflow-auto p-3 font-mono text-xs leading-tight">
				{lines.map((line, i) => (
					<pre
						key={i}
						className={`m-0 whitespace-pre ${
							line.includes("[ALERT]") ||
							line.includes("[ERROR]") ||
							line.includes("FATAL") ||
							line.includes("PANIC")
								? "text-red"
								: line.includes("[WARNING]")
									? "text-yellow"
									: line.includes("[NOTICE]") || line.includes("===")
										? "text-cyan"
										: line.includes("Correct") || line.includes("cake")
											? "text-green"
											: line.startsWith(">") || line.includes("aperture@glados")
												? "text-magenta"
												: "text-fg"
						}`}
						// biome-ignore lint/security/noDangerouslySetInnerHtml: intentional for ANSI color rendering
						dangerouslySetInnerHTML={{
							__html: parseAnsiColors(line),
						}}
					/>
				))}

				{/* Input line */}
				{(phase === "unix" || phase === "adventure") && (
					<div className="flex">
						<span className="text-magenta whitespace-pre">
							{phase === "unix" ? `aperture@glados:${currentPath}$ ` : "> "}
						</span>
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							className="flex-1 bg-transparent text-fg outline-none"
							spellCheck={false}
						/>
						<span className="inline-block h-4 w-2 animate-pulse bg-yellow" />
					</div>
				)}

				{phase === "banner" && <span className="inline-block h-4 w-2 animate-pulse bg-yellow" />}
			</div>

			{/* Status bar */}
			<div className="flex items-center justify-between border-t border-yellow/30 bg-[#111] px-3 py-1 text-xs">
				<span className="text-comment">Aperture Science Enrichment Center</span>
				<span className={phase === "adventure" ? "text-red" : "text-yellow"}>
					{phase === "adventure" ? "MANDATORY TESTING" : "ENRICHMENT CENTER"}
				</span>
				<span className="text-green">GLaDOS v3.11</span>
			</div>

			<style>{`
				@keyframes glitch {
					0% { transform: translate(0); }
					20% { transform: translate(-2px, 2px); }
					40% { transform: translate(-2px, -2px); }
					60% { transform: translate(2px, 2px); }
					80% { transform: translate(2px, -2px); }
					100% { transform: translate(0); }
				}
			`}</style>
		</div>
	)
}
