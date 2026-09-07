import data from "./projects.json"
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

// Bundled rather than fetched so About can render its metrics during prerender and
// hydrate without a layout shift
export const projects = (data as unknown as ProjectsData).projects
