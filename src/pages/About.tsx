import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Buffer from "../components/Buffer"
import { usePageTitle } from "../hooks/usePageTitle"

type Project = {
	name: string
	customer?: string | null
	language: string
	framework?: string | null
	firstCommitDate?: string
	lastCommitDate?: string
	totalLinesOfCode: number
	myLinesOfCode: number
	myCommitCount: number
}

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
		fetch("/projects.json")
			.then((res) => res.json())
			.then((data) => setProjects(data.projects))
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
		<div key="desc-content" className="ml-8 max-w-2xl text-justify">
			Tech lead with 22+ years of experience designing and building complete systems from the ground
			up, turning complex frontend, backend, and infrastructure challenges into creative, scalable,
			and high-impact solutions in fast-paced environments. Systems thinker who combines deep
			technical expertise with leadership, mentoring, and strategic vision.
		</div>,
		"",
		...(metrics
			? [
					<div key="metrics-header" className="font-bold text-magenta uppercase">
						METRICS
					</div>,
					<div key="metrics-intro" className="ml-8">
						<span className="text-fg font-semibold">Track record, quantified.</span>{" "}
						<span className="text-comment italic">Metrics from 22 years of real projects.</span>{" "}
						<Link to="/projects" className="text-cyan hover:underline">
							Explore →
						</Link>
					</div>,
					"",
					<div key="metrics-summary" className="ml-8">
						<span className="text-cyan">{metrics.years}+</span> years •{" "}
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
					<div key="metrics-leadership-header" className="ml-8 text-yellow font-bold">
						Leadership Indicators
					</div>,
					<ul key="metrics-leadership" className="ml-8 list-disc list-inside">
						<li>
							<span className="text-cyan">207</span> personal/solo projects — initiative and
							self-driven development
						</li>
						<li>
							Worked on teams up to <span className="text-cyan">39</span> engineers (gaudi-portal)
						</li>
						<li>Maintained open-source projects</li>
						<li>
							<span className="text-cyan">13</span> currently active projects
						</li>
					</ul>,
					"",
					<div key="metrics-talking-header" className="ml-8 text-yellow font-bold">
						Value Proposition
					</div>,
					<ol key="metrics-talking" className="ml-8 list-decimal list-inside">
						<li>
							<span className="text-fg font-semibold">Full-stack polyglot</span>
							<span className="text-comment">
								{" "}
								— Proven across Ruby, TypeScript, Java, Elixir, Rust
							</span>
						</li>
						<li>
							<span className="text-fg font-semibold">Enterprise experience</span>
							<span className="text-comment">
								{" "}
								— IKEA, Tele2, Philips, ING, fintech/proptech startups
							</span>
						</li>
						<li>
							<span className="text-fg font-semibold">Scale</span>
							<span className="text-comment">
								{" "}
								— 6M+ LOC, 22K commits, 22 years of continuous delivery
							</span>
						</li>
						<li>
							<span className="text-fg font-semibold">Technical leadership</span>
							<span className="text-comment">
								{" "}
								— Large team collaboration + significant solo ownership
							</span>
						</li>
						<li>
							<span className="text-fg font-semibold">Modern stack fluency</span>
							<span className="text-comment">
								{" "}
								— React, Next.js, TypeScript, serverless (GraphQL + AWS)
							</span>
						</li>
						<li>
							<span className="text-fg font-semibold">Domain expertise</span>
							<span className="text-comment"> — Telecom, fintech, proptech, healthcare</span>
						</li>
					</ol>,
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
					platform from the ground up: private equity made liquid. Peliqan gives private equity
					investors what the institutions have always had: full visibility across your portfolio and
					the freedom to act on it. Sell a position, finance a commitment, plan ahead.
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
				"Spearheading the technological development for Revive Capital, a fintech asset leasing company startup, to create a state-of-the-art asset-backed lending platform for brokers from the ground up.",
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
				"Developing an innovative car dealership portal that empowers dealers to efficiently handle customer lease requests, enabling them to finalize leases and deliver vehicles within the time it takes to enjoy two cups of coffee!",
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
				"Leading the development and technical implementation of the IKEA Content Coworker Experience program, helping sales coworkers navigate information more effectively and perform their jobs better through hyper-personalization, innovative UI, and knowledge graph technology.",
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
				"Building a lead processing system from the ground up that matches customers seeking mortgage guidance with qualified advisors, streamlining the advisory process.",
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
				"At Homigo, a corporate startup backed by ING Neo, I lead the technical implementation from the ground up of a SaaS productivity platform (mobile/web) for contractors and homeowners to manage home renovations. I design and implement technically challenging features, including real-time chat, file sharing, resource planning, and other domain-specific tools.",
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
				"Kabisa specializes in developing elegant enterprise software solutions using technologies such as Ruby (on Rails) and Java. I have been with Kabisa since its inception, growing into roles including Scrum Master, DevOps engineer, lead developer, consultant, and software architect, contributing to a wide range of exciting projects for clients such as Philips, ViaViela B.V., Media Groep Limburg, Seacon Logistics, and Yellobrick.",
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
