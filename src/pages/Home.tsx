import Buffer from "../components/Buffer"

const logoLines = [
	"       -=:        :=",
	"      -++=.        :=.",
	"    .=+++++:        .=:",
	"   .=+++++++-        .=:",
	"  :++++++++++=         =:",
	" -++++++++++++=.        --",
	"=+++++++=+++++++:        --",
	"      .=+++++++===+++++++-        -=",
	"     .+++++++======+++++++-        :=.",
	"    :+++++++========+++++++=.       :=.",
	"   -+++++++==========+++++++=.       .=.",
	"  =+++++++===========-=+++++++:       .=:",
	".=+++++++===========-  -+++++++-        =:",
	"       .++++++++===========:    -+++++++=        --",
	"      .+++++++=============......---------        --",
	"     -+++++++------------:                         --",
	"    =+++++++============.                           :=.",
	"  .=+++++++===========-.                             .=.",
	"  -+++++++============-.:::::::::::::::::::::::::::::.--",
	"   -+++++=============================================:",
	"    :++==============================================.",
	"     :==============================================.",
]

export default function Home() {
	const lines = [
		...logoLines.map((line) => <span className="whitespace-pre font-bold text-magenta">{line}</span>),
		<span className="text-magenta">
			{"       "}
			<span className="font-bold">{"█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █"}</span>
		</span>,
		<span className="text-magenta">
			{"       "}
			<span className="font-bold">{"█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█"}</span>
		</span>,
		<>
			{"       "}
			<span className="text-fg">re-invention b.v.</span>
			{"                         "}
			<span className="text-yellow">v1337</span>
		</>,
		"",
		<span className="text-magenta"># Welcome to the system.</span>,
		<span className="text-comment">{"// Press <Space>f to fuzzy search files."}</span>,
		<span className="text-comment">{"// Use h/j/k/l to navigate if you're cool."}</span>,
		"",
		<>
			<span className="text-blue">const</span> <span className="text-cyan">status</span> = {"{"}
		</>,
		<>
			{"  "}role: <span className="text-green">"Tech Lead"</span>,
		</>,
		<>
			{"  "}loc: <span className="text-green">"NL"</span>,
		</>,
		<>
			{"  "}open_for_work: <span className="text-orange">true</span>
		</>,
		<>{"\}"}</>,
	]

	return <Buffer lines={lines} />
}
