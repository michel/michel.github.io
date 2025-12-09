import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "../context/EditorContext"

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

const GRID_WIDTH = 40
const GRID_HEIGHT = 20
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 5
const MIN_SPEED = 50

const getHighScore = () => {
	const stored = localStorage.getItem("snake-high-score")
	return stored ? parseInt(stored, 10) : 0
}

const setHighScore = (score: number) => {
	localStorage.setItem("snake-high-score", score.toString())
}

export default function SnakeGame() {
	const { closeSnakeGame } = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)
	const gameLoopRef = useRef<number | null>(null)
	const directionRef = useRef<Direction>("RIGHT")
	const nextDirectionRef = useRef<Direction>("RIGHT")

	const [snake, setSnake] = useState<Position[]>([
		{ x: 5, y: 10 },
		{ x: 4, y: 10 },
		{ x: 3, y: 10 },
	])
	const [food, setFood] = useState<Position>({ x: 20, y: 10 })
	const [score, setScore] = useState(0)
	const [highScore, setHighScoreState] = useState(getHighScore)
	const [gameOver, setGameOver] = useState(false)
	const [speed, setSpeed] = useState(INITIAL_SPEED)

	const spawnFood = useCallback((currentSnake: Position[]): Position => {
		let newFood: Position
		do {
			newFood = {
				x: Math.floor(Math.random() * GRID_WIDTH),
				y: Math.floor(Math.random() * GRID_HEIGHT),
			}
		} while (currentSnake.some((seg) => seg.x === newFood.x && seg.y === newFood.y))
		return newFood
	}, [])

	const resetGame = useCallback(() => {
		const initialSnake = [
			{ x: 5, y: 10 },
			{ x: 4, y: 10 },
			{ x: 3, y: 10 },
		]
		setSnake(initialSnake)
		setFood(spawnFood(initialSnake))
		setScore(0)
		setGameOver(false)
		setSpeed(INITIAL_SPEED)
		directionRef.current = "RIGHT"
		nextDirectionRef.current = "RIGHT"
	}, [spawnFood])

	const moveSnake = useCallback(() => {
		if (gameOver) return

		directionRef.current = nextDirectionRef.current

		setSnake((prevSnake) => {
			const head = prevSnake[0]
			if (!head) return prevSnake

			const direction = directionRef.current
			let newHead: Position

			switch (direction) {
				case "UP":
					newHead = { x: head.x, y: head.y - 1 }
					break
				case "DOWN":
					newHead = { x: head.x, y: head.y + 1 }
					break
				case "LEFT":
					newHead = { x: head.x - 1, y: head.y }
					break
				case "RIGHT":
					newHead = { x: head.x + 1, y: head.y }
					break
			}

			// Check wall collision
			if (newHead.x < 0 || newHead.x >= GRID_WIDTH || newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
				setGameOver(true)
				return prevSnake
			}

			// Check self collision
			if (prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
				setGameOver(true)
				return prevSnake
			}

			const newSnake = [newHead, ...prevSnake]

			// Check food collision
			if (newHead.x === food.x && newHead.y === food.y) {
				setScore((s) => {
					const newScore = s + 10
					if (newScore > highScore) {
						setHighScoreState(newScore)
						setHighScore(newScore)
					}
					return newScore
				})
				setFood(spawnFood(newSnake))
				setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INCREMENT))
			} else {
				newSnake.pop()
			}

			return newSnake
		})
	}, [gameOver, food, highScore, spawnFood])

	useEffect(() => {
		containerRef.current?.focus()
	}, [])

	useEffect(() => {
		if (gameOver) {
			if (gameLoopRef.current) clearInterval(gameLoopRef.current)
			return
		}

		gameLoopRef.current = window.setInterval(moveSnake, speed)
		return () => {
			if (gameLoopRef.current) clearInterval(gameLoopRef.current)
		}
	}, [moveSnake, speed, gameOver])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (e.key === "Escape" || e.key === "q") {
			closeSnakeGame()
			return
		}

		if (gameOver && e.key === "r") {
			resetGame()
			return
		}

		const current = directionRef.current

		switch (e.key) {
			case "h":
			case "ArrowLeft":
				if (current !== "RIGHT") nextDirectionRef.current = "LEFT"
				break
			case "j":
			case "ArrowDown":
				if (current !== "UP") nextDirectionRef.current = "DOWN"
				break
			case "k":
			case "ArrowUp":
				if (current !== "DOWN") nextDirectionRef.current = "UP"
				break
			case "l":
			case "ArrowRight":
				if (current !== "LEFT") nextDirectionRef.current = "RIGHT"
				break
		}
	}

	const renderGrid = () => {
		const lines: string[] = []

		// Top border
		lines.push("┌" + "─".repeat(GRID_WIDTH) + "┐")

		const snakeHead = snake[0]
		for (let y = 0; y < GRID_HEIGHT; y++) {
			let row = "│"
			for (let x = 0; x < GRID_WIDTH; x++) {
				const isHead = snakeHead && snakeHead.x === x && snakeHead.y === y
				const isBody = snake.slice(1).some((seg) => seg.x === x && seg.y === y)
				const isFood = food.x === x && food.y === y

				if (isHead) row += "█"
				else if (isBody) row += "▓"
				else if (isFood) row += "◆"
				else row += " "
			}
			row += "│"
			lines.push(row)
		}

		// Bottom border
		lines.push("└" + "─".repeat(GRID_WIDTH) + "┘")

		return lines
	}

	const grid = renderGrid()

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
			<div
				ref={containerRef}
				tabIndex={0}
				onKeyDown={handleKeyDown}
				className="rounded-lg border border-[#4a4670] bg-bg-dark p-4 outline-none"
			>
				<div className="mb-2 flex justify-between text-sm">
					<span className="text-cyan">Score: {score}</span>
					<span className="text-magenta">High Score: {highScore}</span>
				</div>

				<pre className="font-mono text-sm leading-none">
					{grid.map((line, i) => (
						<div key={i}>
							{line.split("").map((char, j) => {
								if (char === "█") return <span key={j} className="text-cyan">{char}</span>
								if (char === "▓") return <span key={j} className="text-cyan/70">{char}</span>
								if (char === "◆") return <span key={j} className="text-magenta">{char}</span>
								if ("┌┐└┘─│".includes(char)) return <span key={j} className="text-comment">{char}</span>
								return <span key={j} className="text-fg">{char}</span>
							})}
						</div>
					))}
				</pre>

				{gameOver ? (
					<div className="mt-2 text-center">
						<div className="text-red">GAME OVER</div>
						<div className="mt-1 text-sm text-comment">
							Press <span className="text-magenta">r</span> to restart or{" "}
							<span className="text-magenta">q</span> to quit
						</div>
					</div>
				) : (
					<div className="mt-2 text-center text-sm text-comment">
						Use <span className="text-magenta">hjkl</span> or arrows to move •{" "}
						<span className="text-magenta">q</span> to quit
					</div>
				)}
			</div>
		</div>
	)
}
