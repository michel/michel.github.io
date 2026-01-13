import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useEditor } from "../context/EditorContext"
import { usePageTitle } from "../hooks/usePageTitle"

type Language = {
	language: string
	files?: number
	lines: number
	percentage: number
}

type Project = {
	name: string
	description?: string | null
	customer?: string | null
	language: string
	languages?: Language[]
	framework?: string | null
	firstCommitDate?: string
	lastCommitDate?: string
	totalLinesOfCode: number
	myLinesOfCode: number
	myCommitCount: number
	totalCommitCount?: number
	status: string
	path?: string
	isPersonalProject?: boolean
	repository?: string | null
	commitYearStats?: Record<string, number>
}

type ProjectsData = {
	generatedAt: string
	rootPath: string
	totalProjects: number
	projects: Project[]
}

type Filter = {
	type: "year" | "language" | "customer" | null
	value: string | number | null
}

type SortColumn = "name" | "customer" | "language" | "lines" | "commits" | "status" | "start"

// Utilities
const formatNum = (num: number) =>
	new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(num)

const parseDate = (d?: string | null): Date | null => {
	if (!d) return null
	const date = new Date(d)
	return date.getFullYear() === 1970 ? null : date
}

// Panel component
const Panel = ({
	title,
	titleColor = "text-cyan",
	children,
	className = "",
}: {
	title: string
	titleColor?: string
	children: React.ReactNode
	className?: string
}) => (
	<div
		className={`relative flex min-h-0 flex-col rounded-md border border-border bg-bg-panel ${className}`}
	>
		<div
			className={`absolute -top-2.5 left-3 bg-bg-panel px-1.5 text-[10px] font-bold uppercase tracking-wide ${titleColor}`}
		>
			{title}
		</div>
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
	</div>
)

// Bar component for stats
const StatBar = ({ color, width }: { color: string; width: number }) => (
	<div className="mt-1 h-2.5 overflow-hidden rounded-sm bg-black/30">
		<div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${width}%` }} />
	</div>
)

// Customer metadata from CV
const CUSTOMER_DATA: Record<string, { role: string; period: string; activities: string }> = {
	"Revive Capital": {
		role: "Tech lead",
		period: "2024 - Current",
		activities: "Building asset-backed lending platform for brokers from the ground up",
	},
	"Financial Lease": {
		role: "Tech lead",
		period: "2023 - 2024",
		activities: "Developing car dealership portal for handling customer lease requests",
	},
	IKEA: {
		role: "Tech lead",
		period: "2022 - 2023",
		activities: "Leading Content Coworker Experience program with knowledge graph technology",
	},
	"Hypotheekrente.nl": {
		role: "Tech lead",
		period: "2022 - 2025",
		activities: "Building lead processing system matching customers with mortgage advisors",
	},
	ING: {
		role: "CTO",
		period: "2019 - 2022",
		activities: "Leading SaaS productivity platform (Homigo) for contractors and homeowners",
	},
	Homigo: {
		role: "CTO",
		period: "2019 - 2022",
		activities: "Leading SaaS productivity platform for contractors and homeowners",
	},
	BEEQUIP: {
		role: "Tech lead",
		period: "2016 - 2019",
		activities: "Developing online leasing platform and BEEHIVE information system",
	},
	Tele2: {
		role: "Software engineer",
		period: "2015 - 2016",
		activities: "Maintaining 4G network device commissioning and provisioning system",
	},
	Postinitial: {
		role: "CTO",
		period: "2014 - 2016",
		activities: "Building e-learning platform for Corporate Finance",
	},
	Kabisa: {
		role: "Software engineer / Lead / DevOps / Consultant",
		period: "2008 - 2015",
		activities:
			"Agency work for various clients including Philips, MGL, ViaViela, Seacon Logistics",
	},
	Philips: {
		role: "Backend/Frontend engineer (via Kabisa)",
		period: "2011 - 2012",
		activities:
			"Philips SleepGuide: architecting and developing web services for sleep tracking product designed for 300K+ users",
	},
	MGL: {
		role: "Lead engineer / Architect (via Kabisa)",
		period: "2010 - 2013",
		activities: "Media Groep Limburg: mobile platform, ESB development, cloud migration to AWS EC2",
	},
	ViaViela: {
		role: "Backend engineer (via Kabisa)",
		period: "2012",
		activities: "Building Ruby on Rails applications for day care intermediary platform",
	},
	"Seacon Logistics": {
		role: "Lead engineer / Architect (via Kabisa)",
		period: "2013 - 2014",
		activities: "CASSANDRA project: supply chain visibility and risk assessment platform",
	},
	Simac: {
		role: "Ruby on Rails / Frontend developer (via Kabisa)",
		period: "2013",
		activities: "Mobile application for law enforcement officers with back office system",
	},
	Lecturis: {
		role: "Developer (via Kabisa)",
		period: "2009",
		activities: "Online print ordering portal integrated with Adobe InDesign Server",
	},
	Wegener: {
		role: "Developer (via Kabisa)",
		period: "2009",
		activities: "Wijrijden: Ruby on Rails multisite for automotive news channel",
	},
	Brickyard: {
		role: "Software engineer",
		period: "2016",
		activities: "Taxameter Centrale BV: taxi meter and fleet management systems",
	},
	"Dutchies Travel": {
		role: "CTO",
		period: "2015 - 2018",
		activities: "BackpackApp: travel agency platform for backpackers with offline-first mobile app",
	},
}

const getCustomerInfo = (customer: string | null | undefined) => {
	if (!customer) return null
	return CUSTOMER_DATA[customer] || null
}

export default function Projects() {
	usePageTitle("projects")
	const { openBuffer } = useEditor()
	useEffect(() => {
		openBuffer("/projects")
	}, [openBuffer])

	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [searchParams, setSearchParams] = useSearchParams()
	const [sortCol, setSortCol] = useState<SortColumn>("commits")
	const [sortAsc, setSortAsc] = useState(false)
	const [searchMode, setSearchMode] = useState(false)
	const listRef = useRef<HTMLDivElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	// Read filter state from URL
	const filter: Filter = useMemo(() => {
		const year = searchParams.get("year")
		const lang = searchParams.get("lang")
		const customer = searchParams.get("customer")
		if (year) return { type: "year", value: parseInt(year, 10) }
		if (lang) return { type: "language", value: lang }
		if (customer) return { type: "customer", value: customer }
		return { type: null, value: null }
	}, [searchParams])

	const searchQuery = searchParams.get("q") || ""

	// Fetch projects data
	useEffect(() => {
		fetch("/projects.json")
			.then((res) => res.json())
			.then((data: ProjectsData) => {
				setProjects(data.projects)
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}, [])

	// Global stats
	const globalStats = useMemo(() => {
		const validDates = projects
			.map((p) => parseDate(p.firstCommitDate))
			.filter((d): d is Date => d !== null)
		const earliest = validDates.length
			? new Date(Math.min(...validDates.map((d) => d.getTime())))
			: new Date()
		const now = new Date()
		const diffTime = Math.abs(now.getTime() - earliest.getTime())
		const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
		const diffDays = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24))

		const totalLoc = projects.reduce((acc, p) => acc + (p.myLinesOfCode || 0), 0)
		const totalCommits = projects.reduce((acc, p) => acc + (p.myCommitCount || 0), 0)
		const totalDays = diffYears * 365 + diffDays
		const avgLocPerDay = totalDays > 0 ? Math.round(totalLoc / totalDays) : 0

		return {
			diffYears,
			diffDays,
			totalLoc,
			totalCommits,
			totalProjects: projects.length,
			avgLocPerDay,
		}
	}, [projects])

	// Commit history by year
	const commitsByYear = useMemo(() => {
		const byYear: Record<number, number> = {}
		const currentYear = new Date().getFullYear()

		projects.forEach((p) => {
			if (p.commitYearStats) {
				Object.entries(p.commitYearStats).forEach(([year, count]) => {
					const y = parseInt(year, 10)
					byYear[y] = (byYear[y] || 0) + count
				})
			}
		})

		const allYears = Object.keys(byYear).map(Number)
		const minYear = allYears.length ? Math.min(...allYears) : currentYear
		const years: { year: number; count: number }[] = []
		let maxVal = 0

		for (let y = minYear; y <= currentYear; y++) {
			const count = byYear[y] || 0
			years.push({ year: y, count })
			if (count > maxVal) maxVal = count
		}

		return { years, maxVal }
	}, [projects])

	// Language stats
	const languageStats = useMemo(() => {
		const stats: Record<string, number> = {}
		projects.forEach((p) => {
			p.languages?.forEach((l) => {
				stats[l.language] = (stats[l.language] ?? 0) + l.lines
			})
		})
		const hiddenLangs = ["R", "Vue", "Perl", "Protocol Buffers", "Kotlin", "GraphQL"]
		return Object.entries(stats)
			.filter(([lang]) => !hiddenLangs.includes(lang))
			.sort((a, b) => b[1] - a[1])
	}, [projects])

	// Normalize customer name
	const normalizeCustomer = (customer: string | null | undefined): string => {
		if (!customer || customer === "michel" || customer === "micheldegraaf") return "personal"
		return customer.toLowerCase()
	}

	// Customer stats
	const customerStats = useMemo(() => {
		const stats: Record<string, number> = {}
		projects.forEach((p) => {
			const customer = normalizeCustomer(p.customer)
			stats[customer] = (stats[customer] ?? 0) + 1
		})
		return Object.entries(stats).sort((a, b) => b[1] - a[1])
	}, [projects])

	// Filtered and sorted projects
	const filteredProjects = useMemo(() => {
		let filtered = projects

		if (filter.type === "year" && typeof filter.value === "number") {
			const year = filter.value
			filtered = projects.filter((p) => p.commitYearStats?.[year] && p.commitYearStats[year] > 0)
		} else if (filter.type === "language" && typeof filter.value === "string") {
			filtered = projects.filter((p) => p.languages?.some((l) => l.language === filter.value))
		} else if (filter.type === "customer" && typeof filter.value === "string") {
			const customerFilter = filter.value.toLowerCase()
			filtered = projects.filter((p) => normalizeCustomer(p.customer) === customerFilter)
		}

		// Search filter (name and customer, case insensitive)
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(query) || (p.customer?.toLowerCase() || "").includes(query),
			)
		}

		// Sort
		const sorted = [...filtered].sort((a, b) => {
			let valA: string | number, valB: string | number
			switch (sortCol) {
				case "name":
					valA = a.name.toLowerCase()
					valB = b.name.toLowerCase()
					return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
				case "customer":
					valA = (a.customer || "").toLowerCase()
					valB = (b.customer || "").toLowerCase()
					return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
				case "language":
					valA = (a.language || "").toLowerCase()
					valB = (b.language || "").toLowerCase()
					return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
				case "lines":
					valA = a.totalLinesOfCode || 0
					valB = b.totalLinesOfCode || 0
					return sortAsc ? valA - valB : valB - valA
				case "commits":
					valA = a.myCommitCount || 0
					valB = b.myCommitCount || 0
					return sortAsc ? valA - valB : valB - valA
				case "status": {
					const rank: Record<string, number> = { active: 3, maintained: 2, archived: 1, unknown: 0 }
					valA = rank[a.status] || 0
					valB = rank[b.status] || 0
					return sortAsc ? valA - valB : valB - valA
				}
				case "start":
					valA = parseDate(a.firstCommitDate)?.getTime() || 0
					valB = parseDate(b.firstCommitDate)?.getTime() || 0
					return sortAsc ? valA - valB : valB - valA
				default:
					return 0
			}
		})

		return sorted
	}, [projects, filter, sortCol, sortAsc, searchQuery])

	// Selected project
	const selectedProject = filteredProjects[selectedIndex] || null

	// Filter handlers
	// Update URL with filter
	const updateFilter = useCallback(
		(newFilter: Filter) => {
			const params = new URLSearchParams()
			if (newFilter.type === "year") params.set("year", String(newFilter.value))
			else if (newFilter.type === "language") params.set("lang", String(newFilter.value))
			else if (newFilter.type === "customer") params.set("customer", String(newFilter.value))
			if (searchQuery) params.set("q", searchQuery)
			setSearchParams(params)
			setSelectedIndex(0)
		},
		[searchQuery, setSearchParams],
	)

	const toggleFilter = useCallback(
		(type: "year" | "language" | "customer", value: string | number) => {
			if (filter.type === type && filter.value === value) {
				updateFilter({ type: null, value: null })
			} else {
				updateFilter({ type, value })
			}
		},
		[filter, updateFilter],
	)

	const clearFilter = useCallback(() => {
		updateFilter({ type: null, value: null })
	}, [updateFilter])

	// Update search query in URL
	const updateSearchQuery = useCallback(
		(q: string) => {
			const params = new URLSearchParams(searchParams)
			if (q) params.set("q", q)
			else params.delete("q")
			setSearchParams(params, { replace: true })
		},
		[searchParams, setSearchParams],
	)

	// Sort handler
	const handleSort = useCallback(
		(column: SortColumn) => {
			if (sortCol === column) {
				setSortAsc(!sortAsc)
			} else {
				setSortCol(column)
				setSortAsc(false)
			}
		},
		[sortCol, sortAsc],
	)

	// Keyboard navigation
	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			// "/" to enter search mode
			if (e.key === "/" && !searchMode) {
				e.preventDefault()
				setSearchMode(true)
				return
			}

			// Escape to exit search mode or clear filter
			if (e.key === "Escape") {
				e.preventDefault()
				if (searchMode) {
					setSearchMode(false)
					updateSearchQuery("")
				} else if (filter.type) {
					clearFilter()
				}
				return
			}

			// Skip navigation keys when in search mode (typing in input)
			if (searchMode) return

			if (e.key === "ArrowDown" || e.key === "j") {
				e.preventDefault()
				setSelectedIndex((i) => Math.min(i + 1, filteredProjects.length - 1))
			} else if (e.key === "ArrowUp" || e.key === "k") {
				e.preventDefault()
				setSelectedIndex((i) => Math.max(i - 1, 0))
			}
		}
		document.addEventListener("keydown", handleKeydown)
		return () => document.removeEventListener("keydown", handleKeydown)
	}, [filteredProjects.length, searchMode, filter.type, updateSearchQuery, clearFilter])

	// Focus search input when search mode is activated
	useEffect(() => {
		if (searchMode && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [searchMode])

	// Reset selection when search query changes
	useEffect(() => {
		setSelectedIndex(0)
	}, [searchQuery])

	// Scroll selected row into view
	useEffect(() => {
		const container = listRef.current
		if (!container) return
		const row = container.children[selectedIndex] as HTMLElement
		if (row) row.scrollIntoView({ block: "nearest", behavior: "smooth" })
	}, [selectedIndex])

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-comment">
				Loading system data...
			</div>
		)
	}

	const colors = ["bg-cyan", "bg-magenta", "bg-green", "bg-yellow", "bg-red"]
	const maxLangLines = languageStats[0]?.[1] || 1

	return (
		<div className="grid min-h-full grid-cols-1 gap-3 overflow-y-auto px-1 pb-1 pt-3 md:h-full md:grid-cols-4 md:grid-rows-[auto_1fr] md:gap-4 md:overflow-hidden md:px-4 md:pb-4 md:pt-2">
			{/* System Stats - spans columns 1-3 */}
			<header className="order-1 animate-[fadeIn_0.5s_ease-out] md:order-none md:col-span-3">
				<Panel title="SYSTEM_STATS" titleColor="text-green" className="p-2 md:p-4">
					{/* Row 1: Counters */}
					<div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
						<div className="flex flex-col justify-between">
							<span className="text-[10px] text-comment md:text-xs">UPTIME</span>
							<span className="text-base font-bold text-fg md:text-xl">
								{globalStats.diffYears}y {globalStats.diffDays}d
							</span>
							<StatBar color="bg-green" width={100} />
						</div>
						<div className="flex flex-col justify-between">
							<span className="text-[10px] text-comment md:text-xs">PROJECTS</span>
							<span className="text-base font-bold text-fg md:text-xl">
								{globalStats.totalProjects}
							</span>
							<StatBar color="bg-magenta" width={85} />
						</div>
						<div className="flex flex-col justify-between">
							<span className="text-[10px] text-comment md:text-xs">TOTAL LOC</span>
							<span className="text-base font-bold text-fg md:text-xl">
								{formatNum(globalStats.totalLoc)}
							</span>
							<StatBar color="bg-cyan" width={60} />
						</div>
						<div className="flex flex-col justify-between">
							<span className="text-[10px] text-comment md:text-xs">COMMITS</span>
							<span className="text-base font-bold text-fg md:text-xl">
								{formatNum(globalStats.totalCommits)}
							</span>
							<StatBar color="bg-yellow" width={45} />
						</div>
						<div className="col-span-2 flex flex-col justify-between md:col-span-1">
							<span className="text-[10px] text-comment md:text-xs">AVG LOC/DAY</span>
							<span className="text-base font-bold text-fg md:text-xl">
								{formatNum(globalStats.avgLocPerDay)}
							</span>
							<StatBar color="bg-orange" width={55} />
						</div>
					</div>

					{/* Row 2: Commit Graph */}
					<div className="mt-2 flex flex-col border-t border-border/50 pt-2 md:mt-4">
						<div className="mb-1 flex items-center justify-between md:mb-2">
							<div className="text-[9px] font-bold uppercase tracking-wider text-comment md:text-[10px]">
								COMMITS (ANNUAL)
							</div>
							{filter.type && (
								<div
									className="cursor-pointer text-[9px] text-cyan hover:text-fg md:text-[10px]"
									onClick={clearFilter}
								>
									<span className="hidden md:inline">[FILTER: </span>
									{filter.type === "year"
										? filter.value
										: filter.type === "language"
											? filter.value
											: filter.value}
									<span className="hidden md:inline">]</span>{" "}
									<span className="text-red hover:underline">✕</span>
								</div>
							)}
						</div>
						<div className="flex h-16 w-full items-end gap-1 md:h-20 md:gap-2">
							{commitsByYear.years.map((item) => {
								const heightPct =
									commitsByYear.maxVal > 0 && item.count > 0
										? Math.max(10, (item.count / commitsByYear.maxVal) * 100)
										: 0
								const isActive = filter.type === "year" && filter.value === item.year
								const isFaded = filter.type === "year" && !isActive

								return (
									<div
										key={item.year}
										className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end"
										onClick={() => toggleFilter("year", item.year)}
									>
										<div className="flex h-full w-full items-end overflow-hidden rounded-sm bg-cyan/10">
											<div
												className={`w-full transition-all duration-300 hover:bg-fg ${
													isActive
														? "bg-fg shadow-[0_0_10px_rgba(255,255,255,0.5)]"
														: isFaded
															? "bg-cyan opacity-20"
															: item.count > 0
																? "bg-cyan"
																: "bg-cyan opacity-30"
												}`}
												style={{ height: `${heightPct}%` }}
											/>
										</div>
										<div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover:block">
											<div className="whitespace-nowrap rounded border border-border bg-bg-dark px-2 py-1 text-xs text-fg shadow-lg">
												<span className="font-bold text-cyan">{item.year}</span>:{" "}
												{formatNum(item.count)} commits
											</div>
										</div>
										<div
											className={`mt-1 text-center font-mono text-[9px] md:text-[10px] ${
												isActive ? "font-bold text-fg" : "text-comment"
											}`}
										>
											'{String(item.year).slice(2)}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</Panel>
			</header>

			{/* Details & Customer Panels - spans both rows, column 4 */}
			<aside className="order-4 flex h-auto shrink-0 pt-2 animate-[fadeIn_0.5s_ease-out_0.2s_both] flex-col gap-4 md:order-none md:h-auto md:min-h-0 md:flex-1 md:row-span-2 md:gap-4 md:pt-0">
				<Panel title="DETAILS" titleColor="text-yellow" className="flex-1 p-2 md:p-4">
					{selectedProject ? (
						<div className="flex h-full flex-col gap-4">
							<div>
								<h2 className="mb-1 text-xl font-bold text-fg">{selectedProject.name}</h2>
								<div className="mb-2 font-mono text-xs text-cyan">
									{selectedProject.path
										? selectedProject.path.replace("/Users/micheldegraaf", "~")
										: `~/src/${selectedProject.name}`}
								</div>
								<div className="text-sm italic text-comment">
									{selectedProject.description || "No description available."}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2 border-y border-border py-3 text-xs">
								<div>
									<span className="block text-comment">Client</span>
									<span className="text-fg">
										{selectedProject.customer || "Internal / Personal"}
									</span>
								</div>
								<div>
									<span className="block text-comment">Framework</span>
									<span className="text-fg">{selectedProject.framework || "-"}</span>
								</div>
								<div>
									<span className="block text-comment">Primary Lang</span>
									<span className="text-fg">{selectedProject.language || "-"}</span>
								</div>
								<div>
									<span className="block text-comment">Start</span>
									<span className="text-fg">
										{parseDate(selectedProject.firstCommitDate)?.getFullYear() || "-"}
									</span>
								</div>
								<div>
									<span className="block text-comment">End</span>
									<span className="text-fg">
										{parseDate(selectedProject.lastCommitDate)?.getFullYear() || "-"}
									</span>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto">
								<h3 className="mb-2 text-xs font-bold uppercase text-comment">
									Language Breakdown
								</h3>
								<div className="space-y-2">
									{selectedProject.languages && selectedProject.languages.length > 0 ? (
										[...selectedProject.languages]
											.sort((a, b) => b.percentage - a.percentage)
											.map((l, i) => (
												<div key={i} className="flex items-center gap-2 text-xs">
													<span className="w-20 truncate text-fg">{l.language}</span>
													<div className="h-2 flex-1 overflow-hidden rounded-sm bg-black/30">
														<div className="h-full bg-cyan" style={{ width: `${l.percentage}%` }} />
													</div>
													<span className="w-8 text-right text-comment">{l.percentage}%</span>
												</div>
											))
									) : (
										<span className="text-xs text-comment">No language data.</span>
									)}
								</div>
							</div>

							<div className="mt-auto pt-2">
								<div className="mb-1 text-xs text-comment">CONTRIBUTION LEVEL</div>
								<div className="flex h-4 gap-1">
									{Array.from({ length: 20 }).map((_, i) => {
										const commitIntensity = Math.min(
											20,
											Math.ceil((selectedProject.myCommitCount || 0) / 10),
										)
										return (
											<div
												key={i}
												className={`flex-1 rounded-sm ${
													i < commitIntensity ? "bg-green" : "bg-black/30"
												}`}
											/>
										)
									})}
								</div>
							</div>
						</div>
					) : (
						<div className="flex h-full items-center justify-center text-center italic text-comment opacity-50">
							Select a project
							<br />
							to view details
						</div>
					)}
				</Panel>

				{/* Customer Panel - only shown when project has customer info */}
				{selectedProject && getCustomerInfo(selectedProject.customer) && (
					<Panel title="CUSTOMER" titleColor="text-orange" className="shrink-0 p-2 md:p-4">
						<div className="flex flex-col gap-2">
							<h2
								className="cursor-pointer text-lg font-bold text-fg hover:text-cyan"
								onClick={() => toggleFilter("customer", selectedProject.customer!)}
							>
								{selectedProject.customer}
							</h2>
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div>
									<span className="block text-comment">Role</span>
									<span className="text-cyan">
										{getCustomerInfo(selectedProject.customer)?.role}
									</span>
								</div>
								<div>
									<span className="block text-comment">Period</span>
									<span className="text-fg">
										{getCustomerInfo(selectedProject.customer)?.period}
									</span>
								</div>
							</div>
							<div className="text-xs">
								<span className="block text-comment">Activities</span>
								<span className="text-fg/80">
									{getCustomerInfo(selectedProject.customer)?.activities}
								</span>
							</div>
						</div>
					</Panel>
				)}
			</aside>

			{/* Languages & Customers - column 1 */}
			<div className="order-2 flex shrink-0 pt-2 animate-[fadeIn_0.5s_ease-out_0.1s_both] flex-col gap-3 md:order-none md:col-span-1 md:min-h-0 md:flex-1 md:gap-4 md:pt-0">
				<aside className="flex h-20 shrink-0 flex-col md:h-auto md:min-h-0 md:flex-1">
					<Panel
						title={`LANGUAGES (${languageStats.length})`}
						titleColor="text-magenta"
						className="flex-1 p-2 md:p-4"
					>
						<div className="relative h-full">
							<div className="flex h-full items-center gap-2 overflow-x-auto pb-1 md:flex-col md:items-stretch md:space-y-2 md:overflow-y-auto md:pr-2">
								{languageStats.map(([name, count], index) => {
									const percent = Math.round((count / maxLangLines) * 100)
									const colorClass = colors[index % colors.length]
									const isActive = filter.type === "language" && filter.value === name
									const isFaded = filter.type === "language" && !isActive

									return (
										<div
											key={name}
											className={`min-w-[80px] shrink-0 cursor-pointer border-l-2 pl-2 transition-all duration-200 md:min-w-0 md:shrink ${
												isActive ? "border-fg bg-fg/5" : "border-transparent hover:bg-fg/5"
											} ${isFaded ? "opacity-30" : ""}`}
											onClick={() => toggleFilter("language", name)}
										>
											<div className="flex justify-between text-xs md:flex-row">
												<span className={`font-bold ${isActive ? "text-fg" : "text-comment"}`}>
													{name}
												</span>
												<span className="hidden text-[10px] text-comment md:inline">
													{formatNum(count)} LOC
												</span>
											</div>
											<div className="mt-1 h-2.5 overflow-hidden rounded-sm bg-black/30">
												<div
													className={`h-full ${isActive ? "bg-fg" : colorClass}`}
													style={{ width: `${percent}%` }}
												/>
											</div>
										</div>
									)
								})}
							</div>
							<div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-bg-panel to-transparent md:hidden" />
						</div>
					</Panel>
				</aside>

				<aside className="flex h-16 shrink-0 pt-1 flex-col md:h-auto md:min-h-0 md:flex-1 md:pt-0">
					<Panel
						title={`CUSTOMERS (${customerStats.length})`}
						titleColor="text-orange"
						className="flex-1 p-2 md:p-4"
					>
						<div className="relative h-full">
							<div className="flex h-full items-center gap-2 overflow-x-auto pb-1 md:flex-col md:items-stretch md:space-y-2 md:overflow-y-auto md:pr-2">
								{customerStats.map(([name, count]) => {
									const isActive = filter.type === "customer" && filter.value === name
									const isFaded = filter.type === "customer" && !isActive

									return (
										<div
											key={name}
											className={`min-w-[70px] shrink-0 cursor-pointer border-l-2 pl-2 transition-all duration-200 md:min-w-0 md:shrink ${
												isActive ? "border-fg bg-fg/5" : "border-transparent hover:bg-fg/5"
											} ${isFaded ? "opacity-30" : ""}`}
											onClick={() => toggleFilter("customer", name)}
										>
											<div className="flex justify-between text-xs">
												<span className={`font-bold ${isActive ? "text-fg" : "text-comment"}`}>
													{name}
												</span>
												<span className="hidden text-[10px] text-comment md:inline">
													{count} projects
												</span>
											</div>
										</div>
									)
								})}
							</div>
							<div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-bg-panel to-transparent md:hidden" />
						</div>
					</Panel>
				</aside>
			</div>

			{/* Project List - columns 2-3 */}
			<section className="order-3 flex min-h-[300px] max-h-[50vh] shrink-0 pt-2 animate-[fadeIn_0.5s_ease-out_0.15s_both] flex-col md:order-none md:col-span-2 md:min-h-0 md:max-h-none md:flex-1 md:pt-0">
				<Panel
					title={`PROJECTS (${filter.type || searchQuery ? `${filteredProjects.length} of ` : ""}${projects.length})${searchQuery ? ` /${searchQuery}` : ""}`}
					titleColor="text-cyan"
					className="flex flex-1 flex-col"
				>
					{/* Header */}
					<div className="flex shrink-0 items-center gap-2 border-b border-border p-2 text-[10px] font-semibold uppercase">
						<div className="w-8 text-center text-comment">#</div>
						<div
							className="flex-1 cursor-pointer text-comment hover:text-fg"
							onClick={() => handleSort("name")}
						>
							Name {sortCol === "name" && (sortAsc ? "↑" : "↓")}
						</div>
						<div
							className="hidden w-24 cursor-pointer text-comment hover:text-fg md:block"
							onClick={() => handleSort("customer")}
						>
							Client {sortCol === "customer" && (sortAsc ? "↑" : "↓")}
						</div>
						<div
							className="hidden w-20 cursor-pointer text-comment hover:text-fg md:block"
							onClick={() => handleSort("language")}
						>
							Language {sortCol === "language" && (sortAsc ? "↑" : "↓")}
						</div>
						<div
							className="w-20 cursor-pointer text-right text-comment hover:text-fg"
							onClick={() => handleSort("lines")}
						>
							Lines {sortCol === "lines" && (sortAsc ? "↑" : "↓")}
						</div>
						<div
							className="hidden w-16 cursor-pointer text-right text-comment hover:text-fg md:block"
							onClick={() => handleSort("commits")}
						>
							Commits {sortCol === "commits" && (sortAsc ? "↑" : "↓")}
						</div>
						<div
							className="hidden w-12 cursor-pointer text-center text-comment hover:text-fg md:block"
							onClick={() => handleSort("start")}
						>
							Start {sortCol === "start" && (sortAsc ? "↑" : "↓")}
						</div>
						<div
							className="w-20 cursor-pointer text-center text-comment hover:text-fg"
							onClick={() => handleSort("status")}
						>
							Status {sortCol === "status" && (sortAsc ? "↑" : "↓")}
						</div>
					</div>

					{/* Search Input */}
					{searchMode && (
						<div className="flex shrink-0 items-center gap-2 border-b border-cyan bg-cyan/10 px-2 py-1">
							<span className="text-cyan">/</span>
							<input
								ref={searchInputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => updateSearchQuery(e.target.value)}
								placeholder="type to filter..."
								className="flex-1 bg-transparent text-xs text-fg placeholder-comment outline-none"
							/>
							<span className="text-[10px] text-comment">ESC to close</span>
						</div>
					)}

					{/* Filter Warning */}
					{filter.type && (
						<div
							className="shrink-0 cursor-pointer bg-magenta/20 p-2 text-center text-xs text-magenta hover:bg-magenta/30"
							onClick={clearFilter}
						>
							Filter Active:{" "}
							<span className="font-bold">
								{filter.type === "year"
									? `Year: ${filter.value}`
									: filter.type === "customer"
										? `Client: ${filter.value}`
										: filter.value}
							</span>{" "}
							(Click to Clear or ESC)
						</div>
					)}

					{/* List */}
					<div ref={listRef} className="flex-1 overflow-y-auto">
						{filteredProjects.length === 0 ? (
							<div className="p-4 text-center italic text-comment">
								No projects found for current filter.
							</div>
						) : (
							filteredProjects.map((p, i) => {
								const statusColor =
									p.status === "active"
										? "text-green font-bold animate-pulse"
										: p.status === "maintained"
											? "text-cyan"
											: p.status === "archived"
												? "text-red opacity-70"
												: "text-comment"

								return (
									<div
										key={`${p.name}-${i}`}
										className={`flex shrink-0 cursor-pointer items-center gap-2 border-b border-border/50 p-2 text-xs transition-colors duration-100 ${
											i === selectedIndex
												? "border-l-2 border-l-cyan bg-cyan/20"
												: "hover:bg-cyan/10"
										}`}
										onClick={() => setSelectedIndex(i)}
									>
										<div className="w-8 shrink-0 text-center font-mono text-comment">{i + 1}</div>
										<div className="flex-1 truncate font-semibold text-fg">
											{p.name.length > 25 ? `${p.name.substring(0, 22)}...` : p.name}
										</div>
										<div className="hidden w-24 shrink-0 truncate text-comment md:block">
											{p.customer || "-"}
										</div>
										<div className="hidden w-20 shrink-0 truncate text-magenta md:block">
											{p.language || "-"}
										</div>
										<div className="w-20 shrink-0 text-right font-mono text-cyan">
											{formatNum(p.totalLinesOfCode)}
										</div>
										<div className="hidden w-16 shrink-0 text-right font-mono text-yellow md:block">
											{p.myCommitCount || 0}
										</div>
										<div className="hidden w-12 shrink-0 text-center font-mono text-comment md:block">
											{parseDate(p.firstCommitDate)?.getFullYear() || "-"}
										</div>
										<div
											className={`w-20 shrink-0 text-center text-[10px] uppercase ${statusColor}`}
										>
											{p.status || "unk"}
										</div>
									</div>
								)
							})
						)}
					</div>

					{/* Footer */}
					<div className="flex shrink-0 justify-between border-t border-border p-2 text-xs text-comment">
						<span>
							Total Projects: <span className="text-fg">{filteredProjects.length}</span>
						</span>
						<span className="hidden md:inline">
							<span className="rounded border border-border px-1 text-fg">/</span> search{" "}
							<span className="rounded border border-border px-1 text-fg">j</span>{" "}
							<span className="rounded border border-border px-1 text-fg">k</span> navigate
						</span>
					</div>
				</Panel>
			</section>
		</div>
	)
}
