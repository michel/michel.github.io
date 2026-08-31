import { useMemo } from "react"
import { Link } from "react-router-dom"
import Buffer from "../components/Buffer"
import { useEditor } from "../context/EditorContext"
import { content } from "../data/content"
import { usePageTitle } from "../hooks/usePageTitle"
import { useTip } from "../hooks/useTip"

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

// CSS-based box using ch units for precise character width
const BOX_CHARS = 64

const Line = ({ children }: { children: React.ReactNode }) => (
	<div className="flex">
		<span className="text-green font-bold">║</span>
		<span className="flex-1 text-fg pl-5" style={{ width: `${BOX_CHARS}ch` }}>
			{children}
		</span>
		<span className="text-green font-bold">║</span>
	</div>
)

const CmdButton = ({ cmd, className = "" }: { cmd: string; className?: string }) => {
	const { queueTerminalCommand } = useEditor()
	return (
		<button
			type="button"
			className={`text-cyan cursor-pointer hover:underline ${className}`}
			onClick={() => queueTerminalCommand(cmd)}
		>
			{cmd}
		</button>
	)
}

const Cmd = ({ cmd, desc }: { cmd: string; desc: string }) => (
	<Line>
		{"    "}
		<CmdButton cmd={cmd} />
		<span className="text-comment">
			{" "}
			{".".repeat(Math.max(1, 10 - cmd.length))} {desc}
		</span>
	</Line>
)

const MobileInfoBox = ({ tip }: { tip: string | null }) => (
	<div className="max-w-full whitespace-normal border border-green p-3 leading-relaxed">
		<div className="text-orange font-bold">Best on a desktop with a keyboard.</div>
		<p className="mt-2">
			This website simulates a <span className="text-yellow">terminal</span> +{" "}
			<a
				href="https://github.com/neovim/neovim"
				target="_blank"
				rel="noopener noreferrer"
				className="text-yellow underline"
			>
				nvim
			</a>{" "}
			+{" "}
			<a
				href="https://github.com/tmux/tmux"
				target="_blank"
				rel="noopener noreferrer"
				className="text-yellow underline"
			>
				tmux
			</a>{" "}
			setup: a text-only interface to a computer. No icons, no mouse: just the keyboard.
		</p>
		<p className="mt-2">
			To the people who spend decades refining these setups, the terminal is an extension of
			thought.
		</p>
		<p className="mt-2">Tap to run in the terminal:</p>
		<div className="mt-1 flex flex-wrap gap-2">
			{["help", "colorscheme", "cowsay hi", "fortune"].map((cmd) => (
				<CmdButton key={cmd} cmd={cmd} className="min-h-9 border border-border px-2" />
			))}
		</div>
		<div className="mt-2 min-h-5 text-comment">{tip ? `TIP: ${tip}` : ""}</div>
	</div>
)

const InfoBox = ({ tip }: { tip: string | null }) => (
	<>
		<div className="md:hidden">
			<MobileInfoBox tip={tip} />
		</div>
		<div className="hidden font-mono text-sm md:block" style={{ width: `${BOX_CHARS + 2}ch` }}>
			<div className="text-green font-bold">╔{"═".repeat(BOX_CHARS)}╗</div>
			<Line>
				{" "}
				<span className="text-cyan font-bold">What am I looking at?</span>
			</Line>
			<Line> </Line>
			<Line>
				{" "}
				This website simulates a <span className="text-yellow">terminal</span> +{" "}
				<a
					href="https://github.com/neovim/neovim"
					target="_blank"
					rel="noopener noreferrer"
					className="text-yellow underline"
				>
					nvim
				</a>{" "}
				+{" "}
				<a
					href="https://github.com/tmux/tmux"
					target="_blank"
					rel="noopener noreferrer"
					className="text-yellow underline"
				>
					tmux
				</a>{" "}
				setup.
			</Line>
			<Line> </Line>
			<Line>
				{" "}
				A <span className="text-cyan">terminal</span> is a text-only interface to a computer.
			</Line>
			<Line> No icons, no mouse: just the keyboard.</Line>
			<Line> Programmers and hackers have been using terminals for</Line>
			<Line>
				{" "}
				over half a century. They're not outdated; they're{" "}
				<span className="text-magenta">blazingly</span>
			</Line>
			<Line>
				{" "}
				<span className="text-magenta">fast</span>, run anywhere, and work over ssh on a box on
			</Line>
			<Line> the other side of the world.</Line>
			<Line> </Line>
			<Line> Because it takes years to master a terminal (and</Line>
			<Line> its editors), most people never do. For those who do,</Line>
			<Line>
				{" "}
				these setups become a <span className="text-yellow">point of pride</span>. A certain breed
			</Line>
			<Line>
				{" "}
				of developer/hacker will spend <span className="text-orange">decades refining</span>
			</Line>
			<Line>
				{" "}
				<span className="text-orange">and tweaking</span> their tools to perfection.
			</Line>
			<Line> To them, the terminal is an extension of thought. </Line>
			<Line> </Line>
			<Line>
				{" "}
				In this world, <span className="text-red">mice slow you down</span>. Try these:
			</Line>
			<Line> </Line>
			<Line>
				{" "}
				<span className="text-cyan">Ctrl+p</span> fuzzy search
			</Line>
			<Line>
				{" "}
				<span className="text-cyan">Ctrl+`</span> toggle terminal
			</Line>
			<Line>
				{" "}
				<span className="text-cyan">j/k</span> scroll up/down
			</Line>
			<Line>
				{" "}
				<span className="text-cyan">:</span> vim command line
			</Line>
			<Line> </Line>
			<Line> Or click to run in the terminal:</Line>
			<Line> </Line>
			<Cmd cmd="help" desc="see all commands" />
			<Cmd cmd="colorscheme" desc="cycle theme" />
			<Cmd cmd="cowsay hi" desc="make a cow talk" />
			<Cmd cmd="fortune" desc="words of wisdom" />
			<Line> </Line>
			<Line>
				{" "}
				<span className="text-yellow">Easter eggs hidden everywhere. Have fun exploring!</span>
			</Line>
			<Line> </Line>
			<div className="flex">
				<span className="text-green font-bold">║</span>
				<span className="flex-1 text-fg pl-5 overflow-hidden" style={{ width: `${BOX_CHARS}ch` }}>
					{tip && <span className="text-comment">TIP: {tip}</span>}
				</span>
				<span className="text-green font-bold">║</span>
			</div>
			<Line> </Line>
			<div className="text-green font-bold">╚{"═".repeat(BOX_CHARS)}╝</div>
		</div>
	</>
)

export default function Home() {
	usePageTitle()
	const tip = useTip()
	const tipText = tip?.text ?? null
	const lines = useMemo(
		() => [
			...logoLines.map((line, i) => (
				<span
					key={`logo-${i}`}
					aria-hidden="true"
					className="whitespace-pre font-bold text-magenta text-xs md:text-sm"
				>
					{line}
				</span>
			)),
			"",
			<div key="brand1" aria-hidden="true" className="text-magenta text-[9px] md:text-sm">
				{"       "}
				<pre className="font-bold">{`	█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █
	█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█`}</pre>
			</div>,
			<span key="brand3">
				{"       "}
				<span className="text-fg">&nbsp;&nbsp;&nbsp;&nbsp;re-invention b.v.</span>
				{"                         "}
				<span className="text-yellow">v1337</span>
			</span>,
			"",
			<InfoBox key="readme-box" tip={tipText} />,
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
				&nbsp;&nbsp;role: <span className="text-green">"CTO"</span>,
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
				<Link key={item.slug} to={item.path} className="block hover:bg-black">
					<span className="text-comment">-rw-r--r-- michel staff {item.date} </span>
					<span className="text-cyan">{item.title}</span>
				</Link>
			)),
		],
		[tipText],
	)

	return (
		<>
			<h1 className="sr-only">Michel de Graaf — CTO and tech lead</h1>
			<Buffer lines={lines} />
		</>
	)
}
