export interface Theme {
	name: string
	label: string
	colors: {
		bg: string
		bgDark: string
		bgPanel: string
		bgActive: string
		fg: string
		comment: string
		red: string
		green: string
		yellow: string
		blue: string
		magenta: string
		cyan: string
		orange: string
		black: string
		border: string
		pink: string
	}
}

export const themes: Record<string, Theme> = {
	default: {
		name: "default",
		label: "Rose Pine",
		colors: {
			bg: "#232135",
			bgDark: "#191724",
			bgPanel: "#2a273f",
			bgActive: "#2d2a3b",
			fg: "#e0def4",
			comment: "#9a95b5",
			red: "#eb6f92",
			green: "#a3be8c",
			yellow: "#f6c177",
			blue: "#569fba",
			magenta: "#c0a1f0",
			cyan: "#9ccfd8",
			orange: "#ea9a97",
			black: "#393552",
			border: "#433c59",
			pink: "#eb98c3",
		},
	},
	gruvbox: {
		name: "gruvbox",
		label: "Gruvbox Dark",
		colors: {
			bg: "#282828",
			bgDark: "#1d2021",
			bgPanel: "#3c3836",
			bgActive: "#504945",
			fg: "#ebdbb2",
			comment: "#928374",
			red: "#fb4934",
			green: "#b8bb26",
			yellow: "#fabd2f",
			blue: "#83a598",
			magenta: "#d3869b",
			cyan: "#8ec07c",
			orange: "#fe8019",
			black: "#1d2021",
			border: "#504945",
			pink: "#d3869b",
		},
	},
	dracula: {
		name: "dracula",
		label: "Dracula",
		colors: {
			bg: "#282a36",
			bgDark: "#21222c",
			bgPanel: "#343746",
			bgActive: "#44475a",
			fg: "#f8f8f2",
			comment: "#6272a4",
			red: "#ff5555",
			green: "#50fa7b",
			yellow: "#f1fa8c",
			blue: "#6272a4",
			magenta: "#bd93f9",
			cyan: "#8be9fd",
			orange: "#ffb86c",
			black: "#21222c",
			border: "#44475a",
			pink: "#ff79c6",
		},
	},
	nord: {
		name: "nord",
		label: "Nord",
		colors: {
			bg: "#2e3440",
			bgDark: "#242933",
			bgPanel: "#3b4252",
			bgActive: "#434c5e",
			fg: "#eceff4",
			comment: "#616e88",
			red: "#bf616a",
			green: "#a3be8c",
			yellow: "#ebcb8b",
			blue: "#81a1c1",
			magenta: "#b48ead",
			cyan: "#88c0d0",
			orange: "#d08770",
			black: "#242933",
			border: "#4c566a",
			pink: "#b48ead",
		},
	},
	monokai: {
		name: "monokai",
		label: "Monokai Pro",
		colors: {
			bg: "#2d2a2e",
			bgDark: "#221f22",
			bgPanel: "#383539",
			bgActive: "#423f46",
			fg: "#fcfcfa",
			comment: "#727072",
			red: "#ff6188",
			green: "#a9dc76",
			yellow: "#ffd866",
			blue: "#78dce8",
			magenta: "#ab9df2",
			cyan: "#78dce8",
			orange: "#fc9867",
			black: "#221f22",
			border: "#525053",
			pink: "#ff6188",
		},
	},
}

export const themeNames = Object.keys(themes)

export function themeVars(themeName: string): Record<string, string> {
	const theme = themes[themeName] ?? themes.default
	if (!theme) return {}
	const c = theme.colors
	return {
		"--color-bg": c.bg,
		"--color-bg-dark": c.bgDark,
		"--color-bg-panel": c.bgPanel,
		"--color-bg-active": c.bgActive,
		"--color-fg": c.fg,
		"--color-comment": c.comment,
		"--color-red": c.red,
		"--color-green": c.green,
		"--color-yellow": c.yellow,
		"--color-blue": c.blue,
		"--color-magenta": c.magenta,
		"--color-cyan": c.cyan,
		"--color-orange": c.orange,
		"--color-black": c.black,
		"--color-border": c.border,
		"--color-pink": c.pink,
	}
}

export function applyTheme(themeName: string) {
	if (typeof document === "undefined") return
	const root = document.documentElement
	for (const [prop, value] of Object.entries(themeVars(themeName)))
		root.style.setProperty(prop, value)
}

export function getStoredTheme(): string {
	if (typeof localStorage === "undefined") return "default"
	return localStorage.getItem("theme") || "default"
}

export function storeTheme(themeName: string) {
	localStorage.setItem("theme", themeName)
	// Mirrored vars let index.html's boot script re-theme before first paint
	// without shipping the palette table; applyTheme corrects any stale copy on mount
	localStorage.setItem("themeVars", JSON.stringify(themeVars(themeName)))
}
