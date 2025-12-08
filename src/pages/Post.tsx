import type { ReactNode } from "react"
import { useParams } from "react-router-dom"
import Buffer from "../components/Buffer"

const posts: Record<string, { title: string; date: string; lines: ReactNode[] }> = {
	"learning-rust-the-hard-way": {
		title: "Learning Rust the Hard Way",
		date: "2025-12-04",
		lines: [
			<span className="text-comment">---</span>,
			<span className="text-comment">title: "Learning Rust the Hard Way"</span>,
			<span className="text-comment">date: "2025-12-04"</span>,
			<span className="text-comment">---</span>,
			"",
			<h1 className="text-pink font-bold text-xl"># Learning Rust the hard way: reverse engineering a 2000s P2P protocol</h1>,
			"",
			<>
				I wanted to really learn Rust. I needed a challenge after so many years of building systems for the
				web. Not tutorials. Not toy projects. <span className="text-green font-bold">Real systems programming.</span>
			</>,
			"",
			<>
				So I picked something close to my heart: <span className="text-blue font-bold">Soulseek</span>, the
				underground music sharing network that's been running since the early 2000s, and I've been using it
				to pirate music for my DJ sets.
			</>,
			"",
			<img src="/images/posts/soulseek_client.png" alt="Old Soulseek Windows client" className="max-w-full rounded border border-border" />,
			"",
			<h2 className="text-green font-bold text-lg">## The Rules I set myself:</h2>,
			<>• No external dependencies (just Rust's standard library)</>,
			<>• Reverse engineer the binary protocol (no peeking at existing implementations)</>,
			<>• No AI assistance - just me, the compiler, and documentation</>,
			<>• Keep going till it works</>,
			"",
			<img src="/images/posts/packet_dump.png" alt="tcpdump and hexyl packet analysis" className="max-w-full rounded border border-border" />,
			"",
			<>
				The reality? I got stuck on reverse engineering the protocol for months, testing against the real
				server instead of a stable simulation, because I didn't want to cheat by peeking at existing
				implementations.
			</>,
			"",
			<>
				Many sleepless nights staring at hex dumps, trying to figure out why my downloads wouldn't start
				transferring.
			</>,
			"",
			<div className="border-l-4 border-orange pl-4 text-comment italic">
				"On a flight to Costa Rica. 12 hours offline. No internet. No distractions. Just me, my laptop, and
				Wireshark captures. Something clicked. Deep work works. I broke through and finally got things
				working. Of course, it was an off-by-one bit error"
			</div>,
			"",
			<img src="/images/posts/rust_code.png" alt="Rust code for message decoding" className="max-w-full rounded border border-border" />,
			"",
			<h2 className="text-green font-bold text-lg">## What I ended up building from scratch</h2>,
			"",
			<>
				My goal was learning Rust the hard way. In my marathon training, I learned you just have to keep
				running kilometres for your body to adapt to the load. Programming is the same, just start building
				and actually doing things. Even better if you reinvent the wheel a few times. So instead of using
				libraries or reference implementations, I went and implemented things you'd normally take off the
				shelf:
			</>,
			"",
			<>• Binary protocol parsing (managing bits and bytes)</>,
			<>• Async-free networking</>,
			<>• Zlib decompression (following the official RFC)</>,
			<>• Custom logger/log levels & buffering</>,
			<>• Speed-ran through trying and building different concurrency models: naive threads per peer, to thread pools, to a homegrown actor system and making steps to migrate to a reactor event loop (epoll/kqueue)</>,
			"",
			<img src="/images/posts/costa_rica.jpg" alt="Hacking in the Costa Rica jungle" className="max-w-full rounded border border-border" />,
			"",
			<>
				The verdict on Rust? The compiler is brutal, but it becomes your friend once you start trusting the
				process. Once it compiles, it usually works. But productivity-wise? I wouldn't build an information
				system in it; the kind that captures domain and business logic. Those systems are prone to change
				and require flexibility. In Rust, once you define an abstraction or structure, it takes work to
				change it. You become careful upfront because the cost of redesign is high. During this project, I
				changed my design and abstractions many times. Each time was painful.
			</>,
			"",
			<>
				Am I done? Not even close. My code is riddled with .clone() calls. The multi-threading is naive. The
				design doesn't gracefully handle tens of thousands of peer connections yet, and you can't even share
				files, making it a very incomplete client.
			</>,
			"",
			<>But searching and downloading works, and that's a milestone!</>,
			"",
			<>
				Find the project on:{" "}
				<a href="https://github.com/michel/soulseek-rs" className="text-blue hover:underline">
					https://github.com/michel/soulseek-rs
				</a>
			</>,
			"",
			<span className="text-comment">
				#rust #systemsprogramming #learning #soulseek #rustlang #softwareengineering
			</span>,
		],
	},
}

export default function Post() {
	const { slug } = useParams()
	const post = slug ? posts[slug] : null

	if (!post) return <Buffer lines={[<span className="text-red">Error: Post not found</span>]} />

	return <Buffer lines={post.lines} />
}
