import type { ReactNode } from "react"

export const learningRustTheHardWay: { title: string; date: string; lines: ReactNode[] } = {
	title: "Learning Rust the Hard Way",
	date: "2025-12-04",
	lines: [
		<span key="fm1" className="text-comment">
			---
		</span>,
		<span key="fm2" className="text-comment">
			title: "Learning Rust the Hard Way"
		</span>,
		<span key="fm3" className="text-comment">
			date: "2025-12-04"
		</span>,
		<span key="fm4" className="text-comment">
			---
		</span>,
		"",
		<h1 key="title" className="text-pink font-bold text-xl">
			# Learning Rust the hard way: reverse engineering a 2000s P2P protocol
		</h1>,
		"",
		<span key="intro1">
			I wanted to really learn Rust. I needed a challenge after so many years of building systems
			for the web. Not tutorials. Not toy projects.{" "}
			<span className="text-green font-bold">Real systems programming.</span>
		</span>,
		"",
		<span key="intro2">
			So I picked something close to my heart:{" "}
			<span className="text-blue font-bold">Soulseek</span>, the underground music sharing network
			that's been running since the early 2000s, and I've been using it to pirate music for my DJ
			sets.
		</span>,
		"",
		<div key="img1" className="flex flex-col gap-1">
			<img
				src="/images/posts/learning-rust-the-hard-way/soulseek_client.png"
				alt="Old Soulseek Windows client"
				className="max-w-full rounded border border-border"
			/>
			<span className="text-comment text-sm">{"// Old Soulseek Windows client"}</span>
		</div>,
		"",
		<h2 key="rules" className="text-green font-bold text-lg">
			## The Rules I set myself:
		</h2>,
		<span key="rule1">• No external dependencies (just Rust's standard library)</span>,
		<span key="rule2">
			• Reverse engineer the binary protocol (no peeking at existing implementations)
		</span>,
		<span key="rule3">• No AI assistance - just me, the compiler, and documentation</span>,
		<span key="rule4">• Keep going till it works</span>,
		"",
		<div key="img2" className="flex flex-col gap-1">
			<img
				src="/images/posts/learning-rust-the-hard-way/packet_dump.png"
				alt="tcpdump and hexyl packet analysis"
				className="max-w-full rounded border border-border"
			/>
			<span className="text-comment text-sm">{"// tcpdump and hexyl packet analysis"}</span>
		</div>,
		"",
		<span key="p1">
			The reality? I got stuck on reverse engineering the protocol for months, testing against the
			real server instead of a stable simulation, because I didn't want to cheat by peeking at
			existing implementations.
		</span>,
		"",
		<span key="p2">
			Many sleepless nights staring at hex dumps, trying to figure out why my downloads wouldn't
			start transferring.
		</span>,
		"",
		<div key="quote" className="border-l-4 border-orange pl-4 text-comment italic">
			"On a flight to Costa Rica. 12 hours offline. No internet. No distractions. Just me, my
			laptop, and Wireshark captures. Something clicked. Deep work works. I broke through and
			finally got things working. Of course, it was an off-by-one bit error"
		</div>,
		"",
		<div key="img3" className="flex flex-col gap-1">
			<img
				src="/images/posts/learning-rust-the-hard-way/rust_code.png"
				alt="Rust code for message decoding"
				className="max-w-full rounded border border-border"
			/>
			<span className="text-comment text-sm">{"// Rust code for message decoding"}</span>
		</div>,
		"",
		<h2 key="built" className="text-green font-bold text-lg">
			## What I ended up building from scratch
		</h2>,
		"",
		<span key="p3">
			My goal was learning Rust the hard way. In my marathon training, I learned you just have to
			keep running kilometres for your body to adapt to the load. Programming is the same, just
			start building and actually doing things. Even better if you reinvent the wheel a few times.
			So instead of using libraries or reference implementations, I went and implemented things
			you'd normally take off the shelf:
		</span>,
		"",
		<span key="b1">• Binary protocol parsing (managing bits and bytes)</span>,
		<span key="b2">• Async-free networking</span>,
		<span key="b3">• Zlib decompression (following the official RFC)</span>,
		<span key="b4">• Custom logger/log levels & buffering</span>,
		<span key="b5">
			• Speed-ran through trying and building different concurrency models: naive threads per
			peer, to thread pools, to a homegrown actor system and making steps to migrate to a reactor
			event loop (epoll/kqueue)
		</span>,
		"",
		<div key="img4" className="flex flex-col gap-1">
			<img
				src="/images/posts/learning-rust-the-hard-way/costa_rica.png"
				alt="Hacking in the Costa Rica jungle"
				className="max-w-full rounded border border-border"
			/>
			<span className="text-comment text-sm">{"// Hacking in the Costa Rica jungle"}</span>
		</div>,
		"",
		<span key="p4">
			The verdict on Rust? The compiler is brutal, but it becomes your friend once you start
			trusting the process. Once it compiles, it usually works. But productivity-wise? I wouldn't
			build an information system in it; the kind that captures domain and business logic. Those
			systems are prone to change and require flexibility. In Rust, once you define an abstraction
			or structure, it takes work to change it. You become careful upfront because the cost of
			redesign is high. During this project, I changed my design and abstractions many times. Each
			time was painful.
		</span>,
		"",
		<span key="p5">
			Am I done? Not even close. My code is riddled with .clone() calls. The multi-threading is
			naive. The design doesn't gracefully handle tens of thousands of peer connections yet, and
			you can't even share files, making it a very incomplete client.
		</span>,
		"",
		<span key="p6">But searching and downloading works, and that's a milestone!</span>,
		"",
		<span key="link">
			Find the project on:{" "}
			<a href="https://github.com/michel/soulseek-rs" className="text-blue hover:underline">
				https://github.com/michel/soulseek-rs
			</a>
		</span>,
		"",
		<span key="tags" className="text-comment">
			#rust #systemsprogramming #learning #soulseek #rustlang #softwareengineering
		</span>,
	],
}
