import data from "./projects.json"
export type Language = {
	language: string
	files?: number
	lines: number
	percentage: number
}

export type Project = {
	name: string
	customer?: string | null
	language: string
	languages?: Language[]
	framework?: string | null
	firstCommitDate?: string
	lastCommitDate?: string
	totalLinesOfCode: number
	myLinesOfCode: number
	myCommitCount: number
	status: string
	isPersonalProject?: boolean
	commitYearStats?: Record<string, number>
}

type ProjectsData = {
	totalProjects: number
	projects: Project[]
}

// Bundled rather than fetched so About can render its metrics during prerender and
// hydrate without a layout shift
export const projects = (data as unknown as ProjectsData).projects
