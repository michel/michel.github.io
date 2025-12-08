import type { ReactNode } from "react"
import Buffer from "../components/Buffer"

const ManEntry = ({ title, date, children, tech }: { title: string; date: string; children: ReactNode; tech?: string[] }): ReactNode[] => [
	<div className="flex justify-between max-w-3xl">
		<span className="font-bold text-yellow">{title}</span>
		<span className="text-comment">{date}</span>
	</div>,
	<div className="text-fg">{children}</div>,
	...(tech ? [<div className="text-cyan text-xs">[ {tech.join(", ")} ]</div>] : []),
	"",
]

export default function About() {
	const lines: ReactNode[] = [
		<h1 className="text-2xl font-bold text-fg">MICHEL(1)</h1>,
		<div className="text-comment uppercase text-sm">General Commands Manual</div>,
		"",
		"",
		<div className="font-bold text-magenta uppercase">NAME</div>,
		<div className="ml-8">Michel de Graaf - Tech Lead / Software Engineer</div>,
		"",
		<div className="font-bold text-magenta uppercase">SYNOPSIS</div>,
		<div className="ml-8">
			<span className="text-pink">michel</span> [--role <span className="text-yellow">tech_lead</span>] [--exp{" "}
			<span className="text-yellow">22_years</span>] [--stack <span className="text-blue">full_stack</span>]
		</div>,
		"",
		<div className="font-bold text-magenta uppercase">DESCRIPTION</div>,
		<div className="ml-8 max-w-2xl text-justify">
			Tech lead with 22+ years of experience designing and building complete systems from the ground up,
			turning complex frontend, backend, and infrastructure challenges into creative, scalable, and
			high-impact solutions in fast-paced environments. Systems thinker who combines deep technical
			expertise with leadership, mentoring, and strategic vision.
		</div>,
		<div className="ml-8 text-yellow">#typescript #ruby #rust #elixir #lua</div>,
		"",
		<div className="font-bold text-magenta uppercase">EXPERIENCE</div>,
		"",
		...ManEntry({
			title: "Re-invention (Founder)",
			date: "2004 - Current",
			children: "My consultancy company: specialized in advanced (web-based) software solutions.",
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Revive Capital B.V - Tech Lead (Freelance)",
			date: "2024 - Current",
			children: "Spearheading the technological development for Revive Capital, a fintech asset leasing company startup, to create a state-of-the-art asset-backed lending platform for brokers from the ground up.",
			tech: ["TypeScript", "TDD", "OpenAPI", "OpenAI", "Basikon", "Salesforce", "Apex", "textract", "OCR", "Docker", "Serverless", "Terraform", "CI/CD", "GITOPS"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Financial Lease - Tech Lead (Freelance)",
			date: "2023 - 2024",
			children: "Developing an innovative car dealership portal that empowers dealers to efficiently handle customer lease requests, enabling them to finalize leases and deliver vehicles within the time it takes to enjoy two cups of coffee!",
			tech: ["TypeScript", "GraphQL", "tRPC", "MUI", "React", "AWS", "Node.js", "Next.js", "Serverless", "Terraform", "CI/CD", "Salesforce/Apex"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "IKEA - Tech Lead (Freelance)",
			date: "2022 - 2023",
			children: "Leading the development and technical implementation of the IKEA Content Coworker Experience program, helping sales coworkers navigate information more effectively and perform their jobs better through hyper-personalization, innovative UI, and knowledge graph technology.",
			tech: ["Neo4J", "TypeScript", "GraphQL", "Apollo", "React", "Azure", "Node.js", "CI/CD"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "hypotheekrente.nl - Tech Lead (Freelance)",
			date: "2022 - 2025",
			children: "Building a lead processing system from the ground up that matches customers seeking mortgage guidance with qualified advisors, streamlining the advisory process.",
			tech: ["Ruby on Rails", "TypeScript", "Apollo", "GraphQL", "Docker", "CI/CD", "GITOPS", "K8S"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "ING / Homigo - CTO (Freelance)",
			date: "2019 - 2022",
			children: "At Homigo, a corporate startup backed by ING Neo, I lead the technical implementation from the ground up of a SaaS productivity platform (mobile/web) for contractors and homeowners to manage home renovations. I design and implement technically challenging features, including real-time chat, file sharing, resource planning, and other domain-specific tools.",
			tech: ["Ruby on Rails", "TypeScript", "React Native", "Apollo", "GraphQL", "Docker", "CI/CD"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "BEEQUIP - Tech Lead (Freelance)",
			date: "2016 - 2019",
			children: "Developing BEEQUIP's (startup, fintech) online leasing platform from the ground up and helping build the technology team. Designed and implemented BEEHIVE, an information system that captured and automated core business processes, exposing a GraphQL API consumed by the dealer portal and customer portal (BEEPORT). In 2022, BEEQUIP provided €735 million in lease financing, and in 2024, the company was acquired by Apollo Capital Management.",
			tech: ["Ruby on Rails", "Python", "TypeScript", "JavaScript", "Node.js", "React", "Apollo", "Salesforce", "Dynamics NAV", "GraphQL", "Docker", "AWS", "CI/CD"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Backpackapp - CTO",
			date: "2015 - 2018",
			children: "Building a travel agency platform for backpackers on the go, tackling challenges such as automated document classification and recognition, and developing an offline-first, cross-platform mobile app.",
			tech: ["Elixir", "React Native", "JavaScript"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Tele2 - Software Engineer (Freelance)",
			date: "2015 - 2016",
			children: "Maintaining a software system for commissioning and provisioning 4G network devices. Developed a consistency-checking tool to audit device configurations and enhanced overall software quality by improving tests and engineering practices.",
			tech: ["Ruby on Rails", "EventMachine", "RabbitMQ", "Backbone.js", "MongoDB", "Redis", "JavaScript", "Docker"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Postinitial - CTO",
			date: "2014 - 2016",
			children: "Building an e-learning platform for Corporate Finance.",
			tech: ["Ruby", "JavaScript", "Rails", "React", "Flux", "Docker"],
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Kabisa - Software Engineer / Lead / DevOps / Consultant",
			date: "2008 - 2015",
			children: "Kabisa specializes in developing elegant enterprise software solutions using technologies such as Ruby (on Rails) and Java. I have been with Kabisa since its inception, growing into roles including Scrum Master, DevOps engineer, lead developer, consultant, and software architect, contributing to a wide range of exciting projects for clients such as Philips, ViaViela B.V., Media Groep Limburg, Seacon Logistics, and Yellobrick.",
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Philips - Internship",
			date: "2007 - 2008",
			children: "Internship where I developed an internet-connected television prototype where users can share photos and play games over the internet.",
		}).map((line) => <div className="ml-8">{line}</div>),
		<div className="font-bold text-magenta uppercase">EDUCATION</div>,
		"",
		...ManEntry({
			title: "University of Amsterdam - Master Software Engineering",
			date: "2008 - 2009",
			children: "For my master's thesis, I researched Intelligent fuzzing of web applications.",
		}).map((line) => <div className="ml-8">{line}</div>),
		...ManEntry({
			title: "Avans Hogeschool s-Hertogenbosch - Bachelor Computer Science",
			date: "2005 - 2008",
			children: (
				<ul className="list-disc list-inside">
					<li>Graduated cum laude</li>
					<li>Graduation internship at the Philips Innovation Lab worked on the European-funded Amigo project</li>
				</ul>
			),
		}).map((line) => <div className="ml-8">{line}</div>),
		<div className="font-bold text-magenta uppercase">LANGUAGES</div>,
		<div className="ml-8">Dutch (mother tongue) • English (fluent) • German (basic)</div>,
		"",
		<div className="font-bold text-magenta uppercase">HONORS & AWARDS & CERTIFICATES</div>,
		<ul className="ml-8 list-disc list-inside">
			<li>Graduated cum laude for bachelor degree computer science</li>
			<li>Professional Scrum Master certificate (Scrum.org)</li>
			<li>Coursera: Neural Networks and Deep Learning</li>
			<li>Placed first at the RubyenRails 2009 rumble</li>
			<li>Dutch Drivers license (B)</li>
		</ul>,
		"",
		<div className="font-bold text-magenta uppercase">HOBBIES</div>,
		<ul className="ml-8 list-disc list-inside">
			<li>Ricing and customizing my development environment (Neovim, Alacritty, Tmux)</li>
			<li>Weight training, running (Marathon runner / iron man)</li>
			<li>Hiking, camping, mountains and nature, traveling</li>
			<li>Music and DJ-ing (soundcloud.com/herrgraaf)</li>
		</ul>,
		"",
		<div className="font-bold text-magenta uppercase">AUTHOR</div>,
		<div className="ml-8">Michel de Graaf &lt;michel@re-invention.nl&gt;</div>,
	]

	return <Buffer lines={lines} />
}
