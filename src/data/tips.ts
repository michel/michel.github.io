export interface Tip {
	id: string
	text: string
	category: "basic" | "intermediate" | "easter" | "personality"
}

export const tips: Tip[] = [
	// Basic tips
	{ id: "help", text: "Press ? for help with keybindings", category: "basic" },
	{ id: "fuzzy", text: "Press Ctrl+p to open the fuzzy file finder", category: "basic" },
	{ id: "terminal", text: "Press Ctrl+` to toggle the terminal", category: "basic" },
	{ id: "command", text: "Press : to enter command mode", category: "basic" },
	{ id: "sidebar", text: "Use Ctrl+w to cycle focus between panels", category: "basic" },
	{ id: "escape", text: "Press Escape to return to normal mode", category: "basic" },
	{ id: "navigate", text: "Click on files in the sidebar to open them", category: "basic" },
	{ id: "resize", text: "Drag the dividers to resize panels", category: "basic" },

	// Intermediate tips
	{ id: "buffers", text: "gt and gT cycle through open buffers", category: "intermediate" },
	{ id: "close", text: "Press x to close the current buffer", category: "intermediate" },
	{ id: "hjkl", text: "Use j/k or arrow keys to scroll in normal mode", category: "intermediate" },
	{ id: "modes", text: "Try v for visual mode, : for command mode", category: "intermediate" },
	{ id: "themes", text: "Try :colorscheme to switch themes", category: "intermediate" },
	{ id: "closeothers", text: "Press X to close all other buffers", category: "intermediate" },
	{
		id: "autocomplete",
		text: "Tab completes commands and filenames in terminal",
		category: "intermediate",
	},
	{ id: "history", text: "Up/Down arrows navigate terminal history", category: "intermediate" },
	{ id: "man", text: "Try 'man michel' in the terminal", category: "intermediate" },
	{ id: "edit", text: ":e <filename> opens a file from command mode", category: "intermediate" },

	// Easter egg hints
	{ id: "tmux", text: "Some tmux windows hide secrets... try Ctrl+a then 0-6", category: "easter" },
	{ id: "matrix", text: "Follow the white rabbit: try 'matrix' in terminal", category: "easter" },
	{ id: "games", text: "Bored? Try :snake or :adventure", category: "easter" },
	{ id: "cowsay", text: "The terminal knows cowsay, fortune, and sl...", category: "easter" },
	{ id: "glados", text: "There's a cake somewhere in the tmux windows", category: "easter" },
	{ id: "neo", text: "Window 0 is named 'neo'. Coincidence?", category: "easter" },
	{ id: "jurassic", text: "One window has Unix system files from 1993...", category: "easter" },
	{ id: "hidden", text: "Try 'ls -la' to see hidden files", category: "easter" },
	{ id: "hackerman", text: "Type 'hackerman' in terminal for elite status", category: "easter" },
	{ id: "sudo", text: "sudo make me a sandwich", category: "easter" },
	{ id: "rm", text: "Don't worry, 'rm -rf /' is safe here", category: "easter" },
	{ id: "env", text: "Check the environment variables... 'env'", category: "easter" },

	// Personality
	{ id: "spaces", text: "The author prefers spaces over tabs. Fight me.", category: "personality" },
	{ id: "btw", text: "btw I use Arch (try it in terminal)", category: "personality" },
	{ id: "react", text: "This site has no JavaScript frameworks... wait", category: "personality" },
	{
		id: "vim",
		text: "I've been using vim for 20 years. Still can't quit.",
		category: "personality",
	},
	{ id: "rust", text: "If it compiles, it probably works™", category: "personality" },
	{ id: "coffee", text: "Powered by mass amounts of caffeine", category: "personality" },
	{ id: "debug", text: "console.log('here') - the universal debugger", category: "personality" },
	{ id: "meetings", text: "This meeting could have been an email", category: "personality" },
	{
		id: "docs",
		text: "I'll write the docs later (narrator: they didn't)",
		category: "personality",
	},
	{ id: "refactor", text: "Just one more refactor and it'll be perfect", category: "personality" },
	{ id: "stackoverflow", text: "Copy. Paste. Pray.", category: "personality" },
	{ id: "weekend", text: "It works on my machine ¯\\_(ツ)_/¯", category: "personality" },
]

const STORAGE_KEY = "seen-tips"

// Blocked storage or a malformed value reads as nothing seen yet
const readSeen = (): string[] => {
	try {
		const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
		return Array.isArray(seen) ? seen : []
	} catch {
		return []
	}
}

// Picks a tip not shown yet and remembers it; once every tip is seen the cycle starts over
export function nextTip(): Tip {
	const seen = readSeen()
	const unseen = tips.filter((t) => !seen.includes(t.id))
	const pool = unseen.length ? unseen : tips
	const tip = pool[Math.floor(Math.random() * pool.length)] as Tip
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(unseen.length ? [...seen, tip.id] : [tip.id]))
	} catch {
		// Storage blocked: tips still rotate, they may just repeat
	}
	return tip
}

export function getAllTips(): Tip[] {
	return tips
}
