import { useEffect, useRef, useState } from "react"
import { useEditor } from "../context/EditorContext"
import { itemDescriptions, rooms, startRoom } from "../data/adventureRooms"

interface GameState {
	currentRoom: string
	inventory: string[]
	flags: Set<string>
	history: string[]
}

const HELP_TEXT = `Available commands:
  look          - Examine your surroundings
  go <dir>      - Move in a direction (north, south, east, west, etc.)
  take <item>   - Pick up an item
  use <item>    - Use an item from your inventory
  inventory     - Check what you're carrying
  help          - Show this help message
  quit          - Exit the adventure

Shortcuts: n/s/e/w for directions, i for inventory, l for look`

export default function AdventureGame() {
	const { closeAdventureGame } = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const outputRef = useRef<HTMLDivElement>(null)

	const [input, setInput] = useState("")
	const [gameState, setGameState] = useState<GameState>({
		currentRoom: startRoom,
		inventory: [],
		flags: new Set(),
		history: [],
	})
	const [output, setOutput] = useState<string[]>([])

	const addOutput = (text: string) => {
		setOutput((prev) => [...prev, text])
	}

	const getCurrentRoom = () => rooms[gameState.currentRoom]

	const getProcessedDescription = (description: string, inventory: string[]) => {
		let processed = description

		const itemPatterns: Record<string, RegExp> = {
			phone: /Your PHONE is vibrating violently on the nightstand\.\n\n/,
			"laptop bag": /Your LAPTOP BAG is by the DOOR\. /,
			"2fa device":
				/There's a 2FA DEVICE on the counter you could TAKE\. You'll need that for VPN\.\n\n/,
			coffee: /There's COFFEE in the corner with a sticky note: "EMERGENCY USE ONLY"\n/,
		}

		for (const [item, pattern] of Object.entries(itemPatterns)) {
			if (inventory.includes(item)) {
				processed = processed.replace(pattern, "")
			}
		}

		return processed
	}

	const describeRoom = () => {
		const room = getCurrentRoom()
		if (!room) return

		addOutput("")
		addOutput(`═══ ${room.name.toUpperCase()} ═══`)
		addOutput("")
		addOutput(getProcessedDescription(room.description, gameState.inventory))

		if (room.items && room.items.length > 0) {
			const availableItems = room.items.filter((item) => !gameState.inventory.includes(item))
			if (availableItems.length > 0) {
				addOutput("")
				addOutput(`You can see: ${availableItems.join(", ")}`)
			}
		}
	}

	useEffect(() => {
		containerRef.current?.focus()
		addOutput("╔════════════════════════════════════════╗")
		addOutput("║     PRODUCTION IS DOWN: A NIGHTMARE    ║")
		addOutput("║         A Text Adventure Game          ║")
		addOutput("╚════════════════════════════════════════╝")
		addOutput("")
		addOutput("Type 'help' for commands or 'quit' to exit.")
		describeRoom()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight
		}
	}, [])

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const processCommand = (cmd: string) => {
		const trimmed = cmd.trim().toLowerCase()
		addOutput(`> ${cmd}`)

		if (!trimmed) return

		setGameState((prev) => ({
			...prev,
			history: [...prev.history, trimmed],
		}))

		const parts = trimmed.split(" ")
		const action = parts[0]
		const target = parts.slice(1).join(" ")

		switch (action) {
			case "quit":
			case "q":
				closeAdventureGame()
				return

			case "help":
			case "h":
			case "?":
				addOutput(HELP_TEXT)
				return

			case "look":
			case "l":
				describeRoom()
				return

			case "inventory":
			case "i":
				if (gameState.inventory.length === 0) {
					addOutput("Your pockets are empty. Just your phone and its endless notifications.")
				} else {
					addOutput("You are carrying:")
					gameState.inventory.forEach((item) => {
						addOutput(`  - ${item}`)
					})
				}
				return

			case "go":
			case "n":
			case "s":
			case "e":
			case "w":
			case "north":
			case "south":
			case "east":
			case "west": {
				let direction = target
				if (["n", "north"].includes(action)) direction = "north"
				if (["s", "south"].includes(action)) direction = "south"
				if (["e", "east"].includes(action)) direction = "east"
				if (["w", "west"].includes(action)) direction = "west"

				const room = getCurrentRoom()
				if (!room) return
				const nextRoomId = room.exits[direction]

				if (!nextRoomId) {
					addOutput("You can't go that way.")
					return
				}

				setGameState((prev) => ({ ...prev, currentRoom: nextRoomId }))
				setTimeout(() => describeRoom(), 0)
				return
			}

			case "take":
			case "get":
			case "grab": {
				if (!target) {
					addOutput("Take what?")
					return
				}

				const room = getCurrentRoom()
				if (!room || !room.items || !room.items.includes(target)) {
					addOutput(`You don't see a ${target} here.`)
					return
				}

				if (gameState.inventory.includes(target)) {
					addOutput("You already have that.")
					return
				}

				setGameState((prev) => ({
					...prev,
					inventory: [...prev.inventory, target],
				}))
				addOutput(`You pick up the ${target}.`)
				return
			}

			case "use": {
				if (!target) {
					addOutput("Use what?")
					return
				}

				// Special case: use laptop
				if (target === "laptop" && gameState.currentRoom === "office") {
					addOutput("You open the laptop and start the VPN client...")
					setGameState((prev) => ({ ...prev, currentRoom: "vpn" }))
					setTimeout(() => describeRoom(), 0)
					return
				}

				// Special case: use 2fa device in VPN
				if (target === "2fa device" && gameState.currentRoom === "vpn") {
					if (!gameState.inventory.includes("2fa device")) {
						addOutput("You don't have your 2FA device. It's probably in the bathroom.")
						return
					}
					addOutput("You enter the 6-digit code from your 2FA device...")
					addOutput("Authentication successful!")
					setGameState((prev) => ({
						...prev,
						currentRoom: "vpn_connected",
						flags: new Set([...prev.flags, "vpn_connected"]),
					}))
					setTimeout(() => describeRoom(), 0)
					return
				}

				// Special case: use phone
				if (target === "phone") {
					if (gameState.inventory.includes("phone")) {
						const messages = [
							"#incidents: @here anyone know what's happening?",
							"#incidents: CEO has joined the channel",
							"#incidents: PM: can we get an ETA?",
							"#incidents: CTO: let's schedule a post-mortem",
							"#incidents: intern: sorry I think this might be my fault",
							"PagerDuty: CRITICAL - Database CPU at 100%",
							"PagerDuty: CRITICAL - API response time > 30s",
							"Missed call from: Your Manager (3)",
						]
						const randomMessages = messages.sort(() => Math.random() - 0.5).slice(0, 3)
						addOutput("You check your phone:")
						for (const msg of randomMessages) addOutput(`  ${msg}`)
						addOutput("")
						addOutput("You put the phone away. Some things are better left unread.")
					} else {
						addOutput("You don't have your phone.")
					}
					return
				}

				// Special case: use coffee
				if (target === "coffee") {
					if (!gameState.inventory.includes("coffee")) {
						const room = getCurrentRoom()
						if (room?.items?.includes("coffee")) {
							addOutput("You brew a cup of emergency coffee and drink it.")
							addOutput("Your eyes snap open. Your mind sharpens. You feel... awake.")
							setGameState((prev) => ({
								...prev,
								inventory: [...prev.inventory, "coffee"],
								flags: new Set([...prev.flags, "caffeinated"]),
							}))
						} else {
							addOutput("There's no coffee here.")
						}
						return
					}
					addOutput(
						"You've already had your emergency coffee. Any more and you'll vibrate through walls.",
					)
					return
				}

				if (!gameState.inventory.includes(target)) {
					addOutput(`You don't have a ${target}.`)
					return
				}

				const desc = itemDescriptions[target]
				if (desc) {
					addOutput(desc)
				} else {
					addOutput(`You're not sure how to use the ${target} right now.`)
				}
				return
			}

			case "ssh": {
				if (
					gameState.currentRoom !== "vpn_connected" &&
					gameState.currentRoom !== "prod_web" &&
					gameState.currentRoom !== "prod_db"
				) {
					addOutput("You need to be connected to VPN first.")
					return
				}

				if (target === "web" || target === "prod-web-01") {
					setGameState((prev) => ({ ...prev, currentRoom: "prod_web" }))
					setTimeout(() => describeRoom(), 0)
					return
				}

				if (target === "db" || target === "prod-db-01") {
					setGameState((prev) => ({ ...prev, currentRoom: "prod_db" }))
					setTimeout(() => describeRoom(), 0)
					return
				}

				addOutput("Unknown server. Try 'ssh web' or 'ssh db'.")
				return
			}

			case "show": {
				if (target === "processlist" && gameState.currentRoom === "prod_db") {
					setGameState((prev) => ({ ...prev, currentRoom: "processlist" }))
					setTimeout(() => describeRoom(), 0)
					return
				}
				addOutput("Show what?")
				return
			}

			case "kill": {
				if (gameState.currentRoom !== "processlist") {
					addOutput("Kill what process?")
					return
				}

				const pid = target.replace(/^-9\s+/, "").replace(/\s+-9$/, "")

				if (pid === "1339") {
					setGameState((prev) => ({
						...prev,
						currentRoom: "victory",
						flags: new Set([...prev.flags, "victory"]),
					}))
					setTimeout(() => describeRoom(), 0)
					return
				}

				if (pid === "1337") {
					addOutput("Process 1337 is locked waiting on 1339. Kill the source, not the victim.")
					return
				}

				if (pid === "1338") {
					addOutput("Process 1338 is also locked. There's one process causing all this...")
					return
				}

				if (["query", "cron", "intern"].includes(pid)) {
					addOutput("You need to specify the process ID. Check the processlist for the PID.")
					return
				}

				if (["mysql", "postgresql", "postgres", "database", "db"].includes(pid)) {
					addOutput(
						"That would kill the whole database server. Just kill the runaway query by its PID.",
					)
					return
				}

				addOutput("Unknown process. Type 'look' to see running queries.")
				return
			}

			case "disconnect":
			case "back": {
				const room = getCurrentRoom()
				if (!room) return
				const backRoom = room.exits.back || room.exits.disconnect
				if (backRoom) {
					setGameState((prev) => ({ ...prev, currentRoom: backRoom }))
					setTimeout(() => describeRoom(), 0)
				} else {
					addOutput("You can't go back from here.")
				}
				return
			}

			case "examine":
			case "x": {
				if (!target) {
					describeRoom()
					return
				}
				const desc = itemDescriptions[target]
				if (desc) {
					addOutput(desc)
				} else {
					addOutput(`You don't see anything special about the ${target}.`)
				}
				return
			}

			default:
				addOutput(`I don't understand "${action}". Type 'help' for commands.`)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			e.preventDefault()
			closeAdventureGame()
			return
		}

		if (e.key === "Enter") {
			e.preventDefault()
			processCommand(input)
			setInput("")
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				ref={containerRef}
				className="flex h-[80vh] w-[800px] max-w-[90vw] flex-col rounded-lg border border-[#4a4670] bg-bg-dark/95 font-mono text-sm backdrop-blur-sm"
			>
				<div
					ref={outputRef}
					className="flex-1 overflow-y-auto p-4 text-green"
					style={{ whiteSpace: "pre-wrap" }}
				>
					{output.map((line, i) => (
						<div key={i} className={line.startsWith(">") ? "text-cyan" : "text-green"}>
							{line}
						</div>
					))}
				</div>

				<div className="flex border-t border-[#4a4670] p-2">
					<span className="text-cyan">{">"}</span>
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className="ml-2 flex-1 bg-transparent text-green outline-none"
					/>
				</div>

				<div className="border-t border-[#4a4670] p-2 text-xs text-comment">
					<span className="text-magenta">ESC</span> to quit •{" "}
					<span className="text-magenta">help</span> for commands • Inventory:{" "}
					{gameState.inventory.length === 0 ? "empty" : gameState.inventory.join(", ")}
				</div>
			</div>
		</div>
	)
}
