import type { ReactNode } from "react"
import Lightbox from "../components/Lightbox"

export const visualizing17YearsOfCode: { title: string; date: string; lines: ReactNode[] } = {
	title: "Visualizing 17 Years of Code",
	date: "2026-02-02",
	lines: [
		<span key="fm1" className="text-comment">
			---
		</span>,
		<span key="fm2" className="text-comment">
			title: "Visualizing 17 Years of Code"
		</span>,
		<span key="fm3" className="text-comment">
			date: "2026-02-02"
		</span>,
		<span key="fm4" className="text-comment">
			---
		</span>,
		"",
		<h1 key="title" className="text-pink font-bold text-xl">
			# Visualizing 17 Years of Code
		</h1>,
		"",
		// THE HOOK
		<span key="hook1">1.2 million lines of code. 200+ projects. 17 years.</span>,
		"",
		<span key="hook2">I had no idea until I built a tool to count them.</span>,
		"",
		<span key="hook3">
			Turns out most of it is TypeScript. The Ruby years are a distant memory. And I average{" "}
			<span className="text-orange font-bold">67 lines per day</span>, every day, for 17 years
			straight.
		</span>,
		"",
		<h2 key="problem" className="text-green font-bold text-lg">
			## The problem
		</h2>,
		"",
		<span key="p1">
			My portfolio was scattered. Git repos in ~/src. Old projects in ~/archive. Client work mixed
			with side projects. Some with git history, some without. Different languages, different eras,
			different me.
		</span>,
		"",
		<span key="p2">
			I wanted to see the whole picture. Not just a list of repos. The actual shape of my career in
			code.
		</span>,
		"",
		<h2 key="analyzer" className="text-green font-bold text-lg">
			## The analyzer
		</h2>,
		"",
		<span key="p3">
			First, I built a CLI that crawls directories and extracts everything: languages, frameworks,
			LOC, commit history, contributors.
		</span>,
		"",
		<span key="p4">The hard parts:</span>,
		"",
		<span key="b1">
			• <span className="text-blue font-bold">Monorepo detection.</span> Lerna, Turbo, pnpm, npm
			workspaces, Cargo workspaces. Each has different config formats. Each needs glob expansion to
			find subpackages.
		</span>,
		<span key="b2">
			• <span className="text-blue font-bold">Git blame at scale.</span> Processing thousands of
			files in parallel to calculate my actual contribution percentage. Had to filter binary files,
			handle encoding issues, timeout on massive repos.
		</span>,
		<span key="b3">
			• <span className="text-blue font-bold">Framework fingerprinting.</span> Rails vs Next.js vs
			Django vs FastAPI. Detection by config files, directory structure, and dependency inspection.
			25+ frameworks.
		</span>,
		<span key="b4">
			• <span className="text-blue font-bold">Customer attribution.</span> Parsing git remotes to
			figure out which client each project belonged to. Mapping freelance work to the right company.
		</span>,
		"",
		<span key="p5">
			Output: a single JSON file with everything. Languages, LOC, commits per year, framework,
			customer, status. Ready for visualization.
		</span>,
		"",
		<Lightbox
			key="analyzer-screenshot"
			src="/images/posts/visualizing-17-years-of-code/analyzer_output.png"
			alt="CLI analyzer output showing project analysis with language detection, LOC counting, and metadata extraction"
		/>,
		"",
		<h2 key="dashboard" className="text-green font-bold text-lg">
			## The dashboard
		</h2>,
		"",
		<span key="p6">
			JSON is data. I wanted a cockpit. Something that feels like{" "}
			<a
				href="https://htop.dev"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				htop
			</a>{" "}
			for your career.
		</span>,
		"",
		<span key="p7">
			So I built a terminal-style dashboard. Click a year, filter to projects from that era. Click a
			language, see only TypeScript or Ruby or Rust. Click a customer, see everything I built for
			IKEA or ING or Philips.
		</span>,
		"",
		<span key="p8">
			Navigate with <span className="text-cyan font-bold">j/k</span> like vim. Search with{" "}
			<span className="text-cyan font-bold">/</span>. Sort by commits, LOC, status, start date.
			Select a project, see the language breakdown, contribution level, customer context.
		</span>,
		"",
		<Lightbox
			key="img-dashboard"
			src="/images/posts/visualizing-17-years-of-code/projects_dashboard.png"
			alt="Projects dashboard showing 17 years of code"
		/>,
		"",
		<span key="p9">
			Check it out:{" "}
			<a href="/projects" className="text-blue hover:underline">
				/projects
			</a>
		</span>,
		"",
		<h2 key="learned" className="text-green font-bold text-lg">
			## What the data told me
		</h2>,
		"",
		<span key="l1">
			<span className="text-cyan font-bold">2008-2012:</span> The Ruby years. Rails everywhere.
			Agency work for newspapers, logistics companies, healthcare.
		</span>,
		"",
		<span key="l2">
			<span className="text-cyan font-bold">2013-2018:</span> The transition. Ruby fading,
			JavaScript rising. First React projects. First mobile apps. CTO roles.
		</span>,
		"",
		<span key="l3">
			<span className="text-cyan font-bold">2019-2024:</span> TypeScript dominance. Every new
			project. Backend, frontend, tooling. I still love writing Ruby, but the industry moved. The
			freelance work moved. You follow the work.
		</span>,
		"",
		<span key="l4">
			<span className="text-cyan font-bold">2024-now:</span> Rust curiosity. Systems programming
			after years of web work. Different muscles.
		</span>,
		"",
		<span key="p10">
			The commit graph doesn't lie. You can see the slow years. The burnout periods. The peak?
			COVID. 80-hour weeks at Homigo, a corporate proptech startup for ING Bank. The pandemic hit,
			everyone went remote, and I just... coded. Non-stop and I was loving it!
		</span>,
		"",
		<h2 key="why" className="text-green font-bold text-lg">
			## Why I built this
		</h2>,
		"",
		<span key="w1">
			This is a <span className="text-orange font-bold">proof of work</span>.
		</span>,
		"",
		<span key="w2">
			I've been writing code since I was 8, on the 386 my dad got for his banking job. But I could
			only recover projects going back 17 years. The earlier stuff is lost to time and dead hard
			drives.
		</span>,
		"",
		<span key="w3">
			In 2004, during my studies, a teacher referred his best students to TNO for a project:
			building a corporate website. To get paid, we needed to register at the Chamber of Commerce.
			That's how <span className="text-blue font-bold">Re-invention</span> was born. I'm forever
			grateful to that teacher. Re-invention still exists today, 20 years later.
		</span>,
		"",
		<span key="w4">
			We're at the end of an era. From now on, most code will be written by AI. The craft of
			hand-writing complex systems is becoming a historical skill.
		</span>,
		"",
		<span key="w5">
			I wanted a record. Evidence that I spent decades building things by hand. Line by line.
			Debugging at 3am. Learning languages the hard way. Before the machines took over.
		</span>,
		"",
		<span key="w6">
			The irony isn't lost on me: I used AI to build the tool that documents my pre-AI work.
		</span>,
		"",
		<span key="link">
			Try it:{" "}
			<a href="/projects" className="text-blue hover:underline">
				/projects
			</a>
		</span>,
		"",
		<span key="tags" className="text-comment">
			#typescript #react #tooling #portfolio #visualization #career
		</span>,
	],
}
