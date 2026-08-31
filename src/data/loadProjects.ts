export type Language = {
	language: string
	files?: number
	lines: number
	percentage: number
}

export type Project = {
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
	path: string
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

let cache: Promise<Project[]> | null = null

const fetchProjects = async () => {
	const res = await fetch("/projects.json")
	if (!res.ok) throw new Error(`projects.json: ${res.status}`)
	const data = (await res.json()) as ProjectsData
	return data.projects
}

// One fetch per session, shared by About and Projects
export const loadProjects = () => {
	if (cache) return cache
	cache = fetchProjects().catch((err) => {
		// Drop the rejected promise so a retry re-fetches instead of replaying the failure
		cache = null
		throw err
	})
	return cache
}
