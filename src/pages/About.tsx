import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Buffer from "../components/Buffer"
import { loadProjects, type Project } from "../data/loadProjects"
import { usePageTitle } from "../hooks/usePageTitle"

const formatNum = (n: number) =>
	n >= 1_000_000
		? `${(n / 1_000_000).toFixed(1)}M`
		: n >= 1_000
			? `${Math.round(n / 1_000)}K`
			: String(n)

const getYearRange = (p: Project): string => {
	const start = p.firstCommitDate ? new Date(p.firstCommitDate).getFullYear() : null
	const end = p.lastCommitDate ? new Date(p.lastCommitDate).getFullYear() : null
	if (!start || start < 1980) return ""
	if (!end || end < 1980) return `${start}`
	if (start === end) return `${start}`
	return `${start}-${end}`
}

const ManEntry = ({
	id,
	title,
	date,
	children,
	tech,
}: {
	id: string
	title: string
	date: string
	children: ReactNode
	tech?: string[]
}): ReactNode[] => [
	<div key={`${id}-header`} className="flex justify-between max-w-3xl">
		<span className="font-bold text-yellow">{title}</span>
		<span className="text-comment">{date}</span>
	</div>,
	<div key={`${id}-content`} className="text-fg">
		{children}
	</div>,
	...(tech
		? [
				<div key={`${id}-tech`} className="text-cyan">
					[ {tech.join(", ")} ]
				</div>,
			]
		: []),
	"",
]

export default function About() {
	usePageTitle("About")
	const [projects, setProjects] = useState<Project[]>([])

	useEffect(() => {
		loadProjects()
			.then(setProjects)
			.catch(() => {})
	}, [])

	const metrics = useMemo(() => {
		if (projects.length === 0) return null

		const dates = projects
			.map((p) => (p.firstCommitDate ? new Date(p.firstCommitDate) : null))
			.filter((d): d is Date => d !== null && d.getFullYear() > 1970)
		const earliest = dates.length ? Math.min(...dates.map((d) => d.getTime())) : Date.now()
		const years = new Date().getFullYear() - new Date(earliest).getFullYear()

		const totalLoc = projects.reduce((acc, p) => acc + (p.myLinesOfCode || 0), 0)
		const totalCommits = projects.reduce((acc, p) => acc + (p.myCommitCount || 0), 0)

		const personalNames = ["personal", "michel", "micheldegraaf"]
		const customers = new Set(
			projects
				.map((p) => p.customer)
				.filter((c): c is string => !!c && !personalNames.includes(c.toLowerCase()))
				.map((c) => (c === "Homigo" ? "ING" : c)),
		)

		const langCounts: Record<string, number> = {}
		projects.forEach((p) => {
			if (p.language) langCounts[p.language] = (langCounts[p.language] || 0) + 1
		})
		const topLangs = Object.entries(langCounts)
			.filter(([lang]) => lang !== "Unknown")
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)

		const frameworkCounts: Record<string, number> = {}
		projects.forEach((p) => {
			if (p.framework) frameworkCounts[p.framework] = (frameworkCounts[p.framework] || 0) + 1
		})
		const topFrameworks = Object.entries(frameworkCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 4)

		const topProjects = [...projects]
			.sort((a, b) => (b.myCommitCount || 0) - (a.myCommitCount || 0))
			.slice(0, 5)

		const enterpriseNames = ["IKEA", "Homigo", "Tele2", "Philips"]
		const enterpriseStats: Record<string, number> = {}
		enterpriseNames.forEach((name) => {
			const displayName = name === "Homigo" ? "ING" : name
			const count = projects.filter((p) => p.customer === name).length
			if (count > 0) enterpriseStats[displayName] = (enterpriseStats[displayName] || 0) + count
		})

		return {
			years,
			totalLoc,
			totalCommits,
			totalProjects: projects.length,
			soloProjects: projects.filter((p) => p.isPersonalProject).length,
			activeProjects: projects.filter((p) => p.status === "active").length,
			customers: customers.size,
			topLangs,
			topFrameworks,
			topProjects,
			enterpriseStats,
		}
	}, [projects])

	const lines: ReactNode[] = [
		<h1 key="title" className="text-2xl font-bold text-fg">
			MICHEL(1)
		</h1>,
		<div key="subtitle" className="text-comment uppercase">
			General Commands Manual
		</div>,
		"",
		"",
		<div key="name-header" className="font-bold text-magenta uppercase">
			NAME
		</div>,
		<div key="name-content" className="ml-8">
			Michel de Graaf - Tech Lead / Software Engineer
		</div>,
		"",
		<div key="synopsis-header" className="font-bold text-magenta uppercase">
			SYNOPSIS
		</div>,
		<div key="synopsis-content" className="ml-8">
			<span className="text-pink">michel</span> [--role{" "}
			<span className="text-yellow">tech_lead</span>] [--exp{" "}
			<span className="text-yellow">22_years</span>] [--stack{" "}
			<span className="text-blue">full_stack</span>]
		</div>,
		"",
		<div key="desc-header" className="font-bold text-magenta uppercase">
			DESCRIPTION
		</div>,
		<div key="desc-content" className="ml-8 max-w-2xl">
			Tech lead, 22 years in. I build whole systems, frontend through infrastructure, and lead the
			teams that ship them. Mostly fintech and proptech startups; sometimes enterprises like IKEA,
			ING and Tele2.
		</div>,
		"",
		...(metrics
			? [
					<div key="metrics-header" className="font-bold text-magenta uppercase">
						METRICS
					</div>,
					<div key="metrics-intro" className="ml-8">
						<span className="text-comment">SEE ALSO:</span>{" "}
						<Link to="/projects" className="text-cyan hover:underline">
							projects(1)
						</Link>
					</div>,
					"",
					<div key="metrics-summary" className="ml-8">
						<span className="text-cyan">{metrics.years}</span> years of recoverable git history •{" "}
						<span className="text-cyan">{metrics.totalProjects}</span> projects •{" "}
						<span className="text-cyan">{formatNum(metrics.totalLoc)}</span> LOC •{" "}
						<span className="text-cyan">{formatNum(metrics.totalCommits)}</span> commits •{" "}
						<span className="text-cyan">{metrics.customers}</span> organizations
					</div>,
					"",
					<div key="metrics-langs-header" className="ml-8 text-yellow font-bold">
						Languages
					</div>,
					<div key="metrics-langs" className="ml-8 font-mono">
						{metrics.topLangs.map(([lang, count], i) => (
							<span key={lang}>
								<Link to={`/projects?lang=${lang}`} className="text-fg hover:underline">
									{lang}
								</Link>
								<span className="text-comment"> ({count})</span>
								{i < metrics.topLangs.length - 1 ? " • " : ""}
							</span>
						))}
					</div>,
					"",
					<div key="metrics-fw-header" className="ml-8 text-yellow font-bold">
						Frameworks
					</div>,
					<div key="metrics-fw" className="ml-8 font-mono">
						{metrics.topFrameworks.map(([fw, count], i) => (
							<span key={fw}>
								<span className="text-fg">{fw}</span>
								<span className="text-comment"> ({count})</span>
								{i < metrics.topFrameworks.length - 1 ? " • " : ""}
							</span>
						))}
					</div>,
					"",
					<div key="metrics-enterprise-header" className="ml-8 text-yellow font-bold">
						Enterprise Clients
					</div>,
					<div key="metrics-enterprise" className="ml-8 font-mono">
						{Object.entries(metrics.enterpriseStats).map(([name, count], i, arr) => (
							<span key={name}>
								<Link
									to={`/projects?customer=${name === "ING" ? "Homigo" : name}`}
									className="text-fg hover:underline"
								>
									{name}
								</Link>
								<span className="text-comment"> ({count} projects)</span>
								{i < arr.length - 1 ? " • " : ""}
							</span>
						))}
					</div>,
					"",
					<div key="metrics-top-header" className="ml-8 text-yellow font-bold">
						Largest Projects
					</div>,
					...metrics.topProjects.map((p, i) => {
						const years = getYearRange(p)
						return (
							<div key={`top-proj-${i}`} className="ml-8 font-mono">
								<Link to={`/projects?q=${p.name}`} className="text-fg hover:underline">
									{p.name}
								</Link>
								<span className="text-comment">
									{" "}
									— {formatNum(p.totalLinesOfCode)} LOC, {formatNum(p.myCommitCount)} personal
									commits
									{p.customer &&
										` (${p.customer === "Homigo" ? "ING" : p.customer === "Brickyard" ? "Yellobrick" : p.customer})`}
									{years && ` [${years}]`}
								</span>
							</div>
						)
					}),
					"",
					<div key="metrics-stats-header" className="ml-8 text-yellow font-bold">
						Statistics
					</div>,
					<ul key="metrics-stats" className="ml-8 list-disc list-inside">
						<li>
							<span className="text-cyan">{metrics.soloProjects}</span> personal/solo projects
						</li>
						<li>
							Worked on teams up to <span className="text-cyan">39</span> engineers (gaudi-portal)
						</li>
						<li>Maintained open-source projects</li>
						<li>
							<span className="text-cyan">{metrics.activeProjects}</span> currently active projects
						</li>
					</ul>,
					"",
				]
			: []),
		<div key="exp-header" className="font-bold text-magenta uppercase">
			EXPERIENCE
		</div>,
		"",
		...ManEntry({
			id: "peliqan",
			title: "Peliqan - Chief Technology Officer",
			date: "Apr 2026 - Present",
			children: (
				<>
					<img src="/images/peliqan-logo.svg" alt="PELIQAN logo" className="h-4 my-1.5" />
					<div className="text-comment">Amsterdam, North Holland, Netherlands · On-site</div>
					Building the{" "}
					<a
						href="https://peliqan.eu/"
						target="_blank"
						rel="noreferrer"
						className="underline hover:text-cyan"
					>
						Peliqan
					</a>{" "}
					platform. Investors see their whole portfolio and can act on it: sell a position, finance
					a commitment, plan ahead. Institutions have had that for decades; everyone else hasn't.
				</>
			),
		}).map((line, i) => (
			<div key={`peliqan-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "reinvention",
			title: "Re-invention (Founder)",
			date: "2004 - Current",
			children: "My consultancy company: specialized in advanced (web-based) software solutions.",
		}).map((line, i) => (
			<div key={`reinvention-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "revive",
			title: "Revive Capital B.V - Tech Lead (Freelance)",
			date: "2024 - Current",
			children:
				"Leading engineering at Revive Capital, a fintech leasing startup. Built their asset-backed lending platform for brokers from scratch.",
			tech: [
				"TypeScript",
				"TDD",
				"OpenAPI",
				"OpenAI",
				"Basikon",
				"Salesforce",
				"Apex",
				"textract",
				"OCR",
				"Docker",
				"Serverless",
				"Terraform",
				"CI/CD",
				"GITOPS",
			],
		}).map((line, i) => (
			<div key={`revive-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "finlease",
			title: "Financial Lease - Tech Lead (Freelance)",
			date: "2023 - 2024",
			children:
				"Built a dealer portal for car leases. A dealer takes a customer's request, finalises the lease and hands over the car in the time it takes to drink two coffees.",
			tech: [
				"TypeScript",
				"GraphQL",
				"tRPC",
				"MUI",
				"React",
				"AWS",
				"Node.js",
				"Next.js",
				"Serverless",
				"Terraform",
				"CI/CD",
				"Salesforce/Apex",
			],
		}).map((line, i) => (
			<div key={`finlease-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "ikea",
			title: "IKEA - Tech Lead (Freelance)",
			date: "2022 - 2023",
			children:
				"Led the IKEA Content Coworker Experience program: getting shop-floor coworkers the information they need, personalised per person, on top of a knowledge graph.",
			tech: ["Neo4J", "TypeScript", "GraphQL", "Apollo", "React", "Azure", "Node.js", "CI/CD"],
		}).map((line, i) => (
			<div key={`ikea-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "hypotheek",
			title: "hypotheekrente.nl - Tech Lead (Freelance)",
			date: "2022 - 2025",
			children:
				"Built the lead system that matches people looking for mortgage advice with an advisor who can take them on.",
			tech: [
				"Ruby on Rails",
				"TypeScript",
				"Apollo",
				"GraphQL",
				"Docker",
				"CI/CD",
				"GITOPS",
				"K8S",
			],
		}).map((line, i) => (
			<div key={`hypotheek-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "homigo",
			title: "ING / Homigo - CTO (Freelance)",
			date: "2019 - 2022",
			children:
				"At Homigo, a corporate startup backed by ING Neo, I led the technical implementation of a SaaS productivity platform (mobile/web) for contractors and homeowners to manage home renovations. I designed and implemented the hard parts: real-time chat, file sharing, resource planning, and other domain-specific tools.",
			tech: ["Ruby on Rails", "TypeScript", "React Native", "Apollo", "GraphQL", "Docker", "CI/CD"],
		}).map((line, i) => (
			<div key={`homigo-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "beequip",
			title: "BEEQUIP - Tech Lead (Freelance)",
			date: "2016 - 2019",
			children:
				"Developing BEEQUIP's (startup, fintech) online leasing platform from the ground up and helping build the technology team. Designed and implemented BEEHIVE, an information system that captured and automated core business processes, exposing a GraphQL API consumed by the dealer portal and customer portal (BEEPORT). In 2022, BEEQUIP provided €735 million in lease financing, and in 2024, the company was acquired by Apollo Capital Management.",
			tech: [
				"Ruby on Rails",
				"Python",
				"TypeScript",
				"JavaScript",
				"Node.js",
				"React",
				"Apollo",
				"Salesforce",
				"Dynamics NAV",
				"GraphQL",
				"Docker",
				"AWS",
				"CI/CD",
			],
		}).map((line, i) => (
			<div key={`beequip-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "backpack",
			title: "Backpackapp - CTO",
			date: "2015 - 2018",
			children:
				"Building a travel agency platform for backpackers on the go, tackling challenges such as automated document classification and recognition, and developing an offline-first, cross-platform mobile app.",
			tech: ["Elixir", "React Native", "JavaScript"],
		}).map((line, i) => (
			<div key={`backpack-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "tele2",
			title: "Tele2 - Software Engineer (Freelance)",
			date: "2015 - 2016",
			children:
				"Maintaining a software system for commissioning and provisioning 4G network devices. Developed a consistency-checking tool to audit device configurations and enhanced overall software quality by improving tests and engineering practices.",
			tech: [
				"Ruby on Rails",
				"EventMachine",
				"RabbitMQ",
				"Backbone.js",
				"MongoDB",
				"Redis",
				"JavaScript",
				"Docker",
			],
		}).map((line, i) => (
			<div key={`tele2-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "postinitial",
			title: "Postinitial - CTO",
			date: "2014 - 2016",
			children: "Building an e-learning platform for Corporate Finance.",
			tech: ["Ruby", "JavaScript", "Rails", "React", "Flux", "Docker"],
		}).map((line, i) => (
			<div key={`postinitial-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "kabisa",
			title: "Kabisa - Software Engineer / Lead / DevOps / Consultant",
			date: "2008 - 2015",
			children:
				"Kabisa builds enterprise software in Ruby on Rails and Java. I joined at the start and worked as scrum master, DevOps engineer, lead developer, consultant and architect for clients including Philips, Media Groep Limburg, Seacon Logistics and Yellobrick.",
		}).map((line, i) => (
			<div key={`kabisa-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "philips",
			title: "Philips - Internship",
			date: "2007 - 2008",
			children:
				"Internship where I developed an internet-connected television prototype where users can share photos and play games over the internet.",
		}).map((line, i) => (
			<div key={`philips-${i}`} className="ml-8">
				{line}
			</div>
		)),
		<div key="edu-header" className="font-bold text-magenta uppercase">
			EDUCATION
		</div>,
		"",
		...ManEntry({
			id: "uva",
			title: "University of Amsterdam - Master Software Engineering",
			date: "2008 - 2009",
			children: "For my master's thesis, I researched Intelligent fuzzing of web applications.",
		}).map((line, i) => (
			<div key={`uva-${i}`} className="ml-8">
				{line}
			</div>
		)),
		...ManEntry({
			id: "avans",
			title: "Avans Hogeschool s-Hertogenbosch - Bachelor Computer Science",
			date: "2005 - 2008",
			children: (
				<ul className="list-disc list-inside">
					<li>Graduated cum laude</li>
					<li>
						Graduation internship at the Philips Innovation Lab worked on the European-funded Amigo
						project
					</li>
				</ul>
			),
		}).map((line, i) => (
			<div key={`avans-${i}`} className="ml-8">
				{line}
			</div>
		)),
		<div key="lang-header" className="font-bold text-magenta uppercase">
			LANGUAGES
		</div>,
		<div key="lang-content" className="ml-8">
			Dutch (mother tongue) • English (fluent) • German (basic)
		</div>,
		"",
		<div key="awards-header" className="font-bold text-magenta uppercase">
			HONORS & AWARDS & CERTIFICATES
		</div>,
		<ul key="awards-content" className="ml-8 list-disc list-inside">
			<li>Graduated cum laude for bachelor degree computer science</li>
			<li>Professional Scrum Master certificate (Scrum.org)</li>
			<li>Coursera: Neural Networks and Deep Learning</li>
			<li>Placed first at the RubyenRails 2009 rumble</li>
			<li>Dutch Drivers license (B)</li>
		</ul>,
		"",
		<div key="hobbies-header" className="font-bold text-magenta uppercase">
			HOBBIES
		</div>,
		<ul key="hobbies-content" className="ml-8 list-disc list-inside">
			<li>Ricing and customizing my development environment (Neovim, Alacritty, Tmux)</li>
			<li>Weight training, running (Marathon runner / iron man)</li>
			<li>Hiking, camping, mountains and nature, traveling</li>
			<li>Music and DJ-ing (soundcloud.com/herrgraaf)</li>
		</ul>,
		"",
		<div key="author-header" className="font-bold text-magenta uppercase">
			AUTHOR
		</div>,
		<div key="author-content" className="ml-8">
			Michel de Graaf &lt;michel@re-invention.nl&gt;
		</div>,
	]

	return <Buffer lines={lines} />
}
