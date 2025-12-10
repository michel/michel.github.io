import { Link } from "react-router-dom"
import Buffer from "../components/Buffer"
import { content } from "../data/content"
import { usePageTitle } from "../hooks/usePageTitle"

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


export default function Home() {
	usePageTitle()
	const lines = [
		...logoLines.map((line, i) => (
			<span key={`logo-${i}`} className="whitespace-pre font-bold text-magenta">
				{line}
			</span>
		)),
		"",
		<span key="brand1" className="text-magenta">
			{"       "}
			<span className="font-bold">
				<pre>{`	█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █
	█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█`}</pre>
			</span>
		</span>,
		<span key="brand3">
			{"       "}
			<span className="text-fg">&nbsp;&nbsp;&nbsp;&nbsp;re-invention b.v.</span>
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
		<span key="cat-status">
			<span className="text-green">~</span> <span className="text-magenta">cat status.rs</span>
		</span>,
		"",
		<span key="const">
			<span className="text-blue">let</span> <span className="text-cyan">status</span> ={" "}
			<span className="text-yellow">Status</span> {"{"}
		</span>,
		<span key="role">
			&nbsp;&nbsp;role: <span className="text-green">"Tech Lead"</span>,
		</span>,
		<span key="loc">
			&nbsp;&nbsp;loc: <span className="text-green">"NL"</span>,
		</span>,
		<span key="remote">
			&nbsp;&nbsp;remote: <span className="text-orange">true</span>,
		</span>,
		<span key="hybrid">
			&nbsp;&nbsp;hybrid: <span className="text-orange">true</span>,
		</span>,
		<span key="open">
			&nbsp;&nbsp;open_for_work: <span className="text-orange">true</span>,
		</span>,
		<span key="close">
			{"}"}
			<span className="text-fg">;</span>
		</span>,
		"",
		"",
		<span key="prompt" className="text-cyan">
			michel@spaceheater:
		</span>,
		<span key="cmd">
			<span className="text-green">~</span> <span className="text-magenta">ls -la ~/</span>
		</span>,
		"",
		<span key="total" className="text-comment">{`total ${content.length}`}</span>,
		...content.map((item) => (
			<Link key={item.slug} to={item.path} className="hover:bg-selection block">
				<span className="text-comment">-rw-r--r-- michel staff {item.date} </span>
				<span className="text-cyan">{item.title}</span>
			</Link>
		)),
	]

	return <Buffer lines={lines} />
}
