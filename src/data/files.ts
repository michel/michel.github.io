// Unified file content lookup table
// All file content is defined here once and shared across:
// - File Explorer (Sidebar)
// - Fuzzy Finder
// - Terminal simulation

export interface FileContent {
	id: string
	name: string
	path: string // Route path for navigation
	terminalPath: string // Path in terminal filesystem
	content: string[] // File content as lines
}

// Using a const assertion to preserve literal keys for type safety
export const files = {
	home: {
		id: "home",
		name: "README.md",
		path: "/",
		terminalPath: "/home/michel/blog/README.md",
		content: [
			"# Welcome to the system.",
			"// Press <Ctrl>+p to fuzzy search files.",
			"// Use h/j/k/l to navigate if you're cool.",
			"",
			"const status = {",
			'  role: "Tech Lead",',
			'  loc: "NL",',
			"  open_for_work: true",
			"}",
		],
	},
	rust: {
		id: "rust",
		name: "learning_rust_the_hard_way.md",
		path: "/posts/learning-rust-the-hard-way",
		terminalPath: "/home/michel/blog/posts/learning-rust.md",
		content: [
			"---",
			'title: "Learning Rust the Hard Way"',
			'date: "2025-12-04"',
			"---",
			"",
			"# Learning Rust the hard way: reverse engineering",
			"# a 2000s P2P protocol",
			"",
			"I wanted to really learn Rust. Not tutorials.",
			"Not toy projects. Real systems programming.",
			"",
			"So I picked Soulseek, the underground music",
			"sharing network from the early 2000s.",
		],
	},
	cv: {
		id: "cv",
		name: "about_michel.man",
		path: "/about",
		terminalPath: "/home/michel/blog/about_michel.man",
		content: [
			"MICHEL(1)              General Commands Manual",
			"",
			"NAME",
			"    Michel de Graaf - Tech Lead / Software Engineer",
			"",
			"SYNOPSIS",
			"    michel [--role tech_lead] [--exp 22_years]",
			"",
			"DESCRIPTION",
			"    Tech lead with 22+ years of experience designing",
			"    and building complete systems from the ground up.",
		],
	},
	contact: {
		id: "contact",
		name: "contact_card.vcf",
		path: "/contact",
		terminalPath: "/home/michel/blog/contact_card.vcf",
		content: [
			"Email: michel@re-invention.nl",
			"phone: +31 (0)6 36 42 74 07",
			"web: re-invention.nl",
			"",
			"github: github.com/michel",
			"x.com: @micheldegraaf",
			"linkedIn: linkedin.com/in/micheldegraaf",
			"soundcloud: soundcloud.com/herrgraaf",
		],
	},
} as const satisfies Record<string, FileContent>

export type FileId = keyof typeof files

// Helper to get file by terminal path
export function getFileByTerminalPath(terminalPath: string): FileContent | undefined {
	return Object.values(files).find((f) => f.terminalPath === terminalPath)
}

// Helper to get file by route path
export function getFileByRoutePath(routePath: string): FileContent | undefined {
	return Object.values(files).find((f) => f.path === routePath)
}

// Helper to get file by name (partial match)
export function getFileByName(name: string): FileContent | undefined {
	return Object.values(files).find(
		(f) => f.name === name || f.name.includes(name) || name.includes(f.name.replace(".md", "")),
	)
}

// Get content as preview string (for fuzzy finder)
export function getPreview(id: FileId): string {
	return files[id].content.join("\n")
}

// Get content as string array (for terminal)
export function getContentLines(id: FileId): string[] {
	return [...files[id].content]
}

// All file IDs for iteration
export const fileIds = Object.keys(files) as FileId[]
