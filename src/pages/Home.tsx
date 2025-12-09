import { Link } from "react-router-dom"
import Buffer from "../components/Buffer"

const logoLines = [
	"                        -=:        :=",
	"                      -++=.        :=.",
	"                    .=+++++:        .=:",
	"                   .=+++++++-        .=:",
	"                  :++++++++++=         =:",
	"                 -++++++++++++=.        --",
	"                =+++++++=+++++++:        --",
	"              .=+++++++===+++++++-        -=",
	"             .+++++++======+++++++-        :=.",
	"            :+++++++========+++++++=.       :=.",
	"           -+++++++==========+++++++=.       .=.",
	"          =+++++++===========-=+++++++:       .=:",
	"        .=+++++++===========-  -+++++++-        =:",
	"       .++++++++===========:    -+++++++=        --",
	"      .+++++++=============......---------        --",
	"     -+++++++------------:                         --",
	"    =+++++++============.                           :=",
	"  .=+++++++===========-.                             .",
	"  -+++++++============-.:::::::::::::::::::::::::::::.  ",
	"   -+++++=============================================",
	"    :++==============================================.",
	"     :==============================================.",
]

const articles = [
	{
		slug: "learning-rust-the-hard-way",
		title: "learning_rust_the_hard_way.md",
		date: "2024-12-01",
	},
]

export default function Home() {
	const lines = [
		// biome-ignore lint/suspicious/noArrayIndexKey: logo lines are static, index is appropriate key
		...logoLines.map((line, i) => (
			<span key={`logo-${i}`} className="whitespace-pre font-bold text-magenta">
				{line}
			</span>
		)),
		"",
		<span key="brand1" className="text-magenta">
			{"       "}
			<span className="font-bold">{"█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █"}</span>
		</span>,
		<span key="brand2" className="text-magenta">
			{"       "}
			<span className="font-bold">{"█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█"}</span>
		</span>,
		<span key="brand3">
			{"       "}
			<span className="text-fg">re-invention b.v.</span>
			{"                         "}
			<span className="text-yellow">v1337</span>
		</span>,
		"",
		<span key="welcome" className="text-magenta">
			# Welcome to the system.
		</span>,
		<span key="hint1" className="text-comment">
			{"// Press <Space>f to fuzzy search files."}
		</span>,
		<span key="hint2" className="text-comment">
			{"// Use h/j/k/l to navigate if you're cool."}
		</span>,
		"",
		<span key="const">
			<span className="text-blue">const</span> <span className="text-cyan">status</span> = {"{"}
		</span>,
		<span key="role">
			{"  "}role: <span className="text-green">"Tech Lead"</span>,
		</span>,
		<span key="loc">
			{"  "}loc: <span className="text-green">"NL"</span>,
		</span>,
		<span key="open">
			{"  "}open_for_work: <span className="text-orange">true</span>
		</span>,
		<span key="close">{"}"}</span>,
		"",
		"",
		<span key="prompt" className="text-cyan">
			michel@inference-node-01
		</span>,
		<span key="cmd">
			<span className="text-green">~</span> <span className="text-magenta">ls -la posts/</span>
		</span>,
		"",
		<span key="total" className="text-comment">{`total ${articles.length}`}</span>,
		...articles.map((article) => (
			<Link key={article.slug} to={`/posts/${article.slug}`} className="hover:bg-selection block">
				<span className="text-comment">-rw-r--r-- michel staff {article.date} </span>
				<span className="text-cyan">{article.title}</span>
			</Link>
		)),
	]

	return <Buffer lines={lines} />
}
