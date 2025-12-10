export function getNeofetchOutput(): string[] {
	const now = new Date()
	const uptime = `${Math.floor(Math.random() * 30) + 1} days, ${now.getHours()} hours, ${now.getMinutes()} mins`
	const time = now.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	})
	const gpuTemp = Math.floor(Math.random() * 15) + 65
	const gpuUtil = Math.floor(Math.random() * 20) + 78

	return [
		`\x1b[green]                         -=:        :=                  \x1b[reset]\x1b[cyan]michel@inference-node-01\x1b[reset]`,
		`\x1b[green]                       -++=.        :=.                 \x1b[reset]\x1b[cyan]----------------------------------------\x1b[reset]`,
		`\x1b[green]                     .=+++++:        .=:                \x1b[reset]\x1b[cyan]OS\x1b[reset]: Arch Linux x86_64 \x1b[comment](btw)\x1b[reset]`,
		`\x1b[green]                    .=+++++++-        .=:               \x1b[reset]\x1b[cyan]Host\x1b[reset]: NVIDIA DGX H100 \x1b[comment](640GB HBM3)\x1b[reset]`,
		`\x1b[green]                   :++++++++++=         =:              \x1b[reset]\x1b[cyan]Kernel\x1b[reset]: 6.9.420-arch1-1`,
		`\x1b[green]                  -++++++++++++=.        --             \x1b[reset]\x1b[cyan]Uptime\x1b[reset]: ${uptime}`,
		`\x1b[green]                 =+++++++=+++++++:        --            \x1b[reset]\x1b[cyan]Packages\x1b[reset]: 1337 (pacman)`,
		`\x1b[green]               .=+++++++===+++++++-        -=           \x1b[reset]\x1b[cyan]Shell\x1b[reset]: fish 4.1.2`,
		`\x1b[green]              .+++++++======+++++++-        :=.         \x1b[reset]\x1b[cyan]Resolution\x1b[reset]: 8K x4 \x1b[comment](monitoring wall)\x1b[reset]`,
		`\x1b[green]             :+++++++========+++++++=.       :=.        \x1b[reset]\x1b[cyan]DE\x1b[reset]: none \x1b[comment](ssh gang)\x1b[reset]`,
		`\x1b[green]            -+++++++==========+++++++=.       .=.       \x1b[reset]\x1b[cyan]WM\x1b[reset]: tmux \x1b[comment](16 panes)\x1b[reset]`,
		`\x1b[green]           =+++++++===========-=+++++++:       .=:      \x1b[reset]\x1b[cyan]Terminal\x1b[reset]: alacritty \x1b[comment](gpu go brr)\x1b[reset]`,
		`\x1b[green]         .=+++++++===========-  -+++++++-        =:     \x1b[reset]\x1b[cyan]CPU\x1b[reset]: AMD EPYC 9654 (192) @ 3.7GHz \x1b[comment]x2\x1b[reset]`,
		`\x1b[green]        .++++++++===========:    -+++++++=        --    \x1b[reset]\x1b[cyan]GPU\x1b[reset]: \x1b[green]NVIDIA H100 80GB\x1b[reset] x8 \x1b[comment](NVLink)\x1b[reset]`,
		`\x1b[green]       .+++++++=============......---------        --   \x1b[reset]\x1b[cyan]GPU Util\x1b[reset]: ${gpuUtil}% \x1b[comment](printing money)\x1b[reset]`,
		`\x1b[green]      -+++++++------------:                         --  \x1b[reset]\x1b[cyan]GPU Temp\x1b[reset]: ${gpuTemp}°C \x1b[comment](liquid cooled)\x1b[reset]`,
		`\x1b[green]     =+++++++============.                           :=\x1b[reset] \x1b[cyan]Memory\x1b[reset]: 420GiB / 2048GiB \x1b[comment](2TB DDR5)\x1b[reset]`,
		`\x1b[green]   .=+++++++===========-.                             .\x1b[reset] \x1b[cyan]VRAM\x1b[reset]: 69GiB / 640GiB \x1b[comment](HBM3)\x1b[reset]`,
		`\x1b[green]   -+++++++============-.:::::::::::::::::::::::::::::.  \x1b[reset]\x1b[cyan]Disk\x1b[reset]: 42TB / 100TB NVMe RAID \x1b[comment](ZFS)\x1b[reset]`,
		`\x1b[green]    -+++++=============================================  \x1b[reset]\x1b[cyan]Network\x1b[reset]: 400GbE InfiniBand \x1b[comment](RDMA)\x1b[reset]`,
		`\x1b[green]     :++==============================================.  \x1b[reset]\x1b[cyan]Power\x1b[reset]: 10.2kW \x1b[comment](send help)\x1b[reset]`,
		`\x1b[green]      :==============================================.   \x1b[reset]\x1b[cyan]Time\x1b[reset]: ${time}`,
		``,
		`       \x1b[cyan]█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █\x1b[reset]    \x1b[cyan]████\x1b[reset]\x1b[green]████\x1b[reset]\x1b[yellow]████\x1b[reset]\x1b[red]████\x1b[reset]\x1b[magenta]████\x1b[reset]\x1b[blue]████\x1b[reset]`,
		`       \x1b[cyan]█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█\x1b[reset]    \x1b[cyan]████\x1b[reset]\x1b[green]████\x1b[reset]\x1b[yellow]████\x1b[reset]\x1b[red]████\x1b[reset]\x1b[magenta]████\x1b[reset]\x1b[blue]████\x1b[reset]`,
		`       \x1b[comment]re-invention b.v.                         v1337\x1b[reset]`,
		``,
	]
}

export const lsOutput = [
	"\x1b[cyan]posts/\x1b[reset]",
	"README.md",
	"about_michel.man",
	"contact_card.vcf",
	"\x1b[green]package.json\x1b[reset]",
	"\x1b[green]tsconfig.json\x1b[reset]",
	"\x1b[cyan]node_modules/\x1b[reset]",
	"\x1b[yellow].bitcoin_wallet.dat\x1b[reset]",
	"\x1b[yellow].ethereum_keystore.json\x1b[reset]",
	"\x1b[red]seed_phrase_DO_NOT_DELETE.txt\x1b[reset]",
]

export const lsLaOutput = [
	"total 42",
	"drwxr-xr-x  12 michel  staff   384 Dec  9 10:30 \x1b[cyan].\x1b[reset]",
	"drwxr-xr-x   5 michel  staff   160 Dec  9 10:30 \x1b[cyan]..\x1b[reset]",
	"drwxr-xr-x   3 michel  staff    96 Dec  9 10:30 \x1b[cyan]posts\x1b[reset]",
	"-rw-r--r--   1 michel  staff   420 Dec  9 10:30 README.md",
	"-rw-r--r--   1 michel  staff  1337 Dec  9 10:30 about_michel.man",
	"-rw-r--r--   1 michel  staff   256 Dec  9 10:30 contact_card.vcf",
	"-rw-r--r--   1 michel  staff   512 Dec  9 10:30 \x1b[green]package.json\x1b[reset]",
	"-rw-r--r--   1 michel  staff   128 Dec  9 10:30 \x1b[green]tsconfig.json\x1b[reset]",
	"drwxr-xr-x  42 michel  staff  1344 Dec  9 10:30 \x1b[cyan]node_modules\x1b[reset]",
	"-rw-------   1 michel  staff  8192 Dec  9 10:30 \x1b[yellow].bitcoin_wallet.dat\x1b[reset]",
	"-rw-------   1 michel  staff  4096 Dec  9 10:30 \x1b[yellow].ethereum_keystore.json\x1b[reset]",
	"-rw-r--r--   1 michel  staff   256 Dec  9 10:30 \x1b[red]seed_phrase_DO_NOT_DELETE.txt\x1b[reset]",
]

export const npmTestOutput = [
	"",
	"> michel@1.0.0 test",
	"> vitest run",
	"",
	" \x1b[green]RUN\x1b[reset]  v1.0.0",
	"",
	" \x1b[green]\u2713\x1b[reset] src/components/Layout.test.tsx (3 tests) 42ms",
	" \x1b[green]\u2713\x1b[reset] src/hooks/useVimKeys.test.ts (8 tests) 69ms",
	" \x1b[green]\u2713\x1b[reset] src/context/EditorContext.test.tsx (5 tests) 37ms",
	"",
	" Test Files  \x1b[green]3 passed\x1b[reset] (3)",
	" Tests       \x1b[green]16 passed\x1b[reset] (16)",
	" Start at    10:30:00",
	" Duration    420ms",
	"",
]

export function getTopOutput(): string[] {
	const now = new Date()
	const time = now.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	})
	const cpuUser = (Math.random() * 15 + 75).toFixed(2)
	const cpuSys = (Math.random() * 5 + 3).toFixed(2)
	const cpuIdle = (100 - Number.parseFloat(cpuUser) - Number.parseFloat(cpuSys)).toFixed(2)
	const memUsed = (1800 + Math.random() * 200).toFixed(0)
	const vramUsed = (580 + Math.random() * 50).toFixed(0)

	const processes = [
		{
			pid: 1,
			user: "root",
			cpu: "0.0",
			mem: "0.1",
			time: "42:00.00",
			command: "/sbin/systemd \x1b[comment](arch btw)\x1b[reset]",
		},
		{
			pid: 69,
			user: "root",
			cpu: "0.0",
			mem: "0.2",
			time: "13:37.00",
			command: "nvidia-persistenced",
		},
		{
			pid: 420,
			user: "michel",
			cpu: (Math.random() * 2).toFixed(1),
			mem: "0.3",
			time: "0:42.69",
			command: "-fish",
		},
		{
			pid: 1337,
			user: "michel",
			cpu: (Math.random() * 8 + 2).toFixed(1),
			mem: "2.1",
			time: "13:37.00",
			command: "nvim .",
		},
		{
			pid: 31337,
			user: "michel",
			cpu: (Math.random() * 20 + 75).toFixed(1),
			mem: "45.0",
			time: "420:69.00",
			command: "\x1b[green]vllm serve meta-llama/Llama-3.3-70B --tp 8\x1b[reset]",
		},
		{
			pid: 8008,
			user: "michel",
			cpu: (Math.random() * 5 + 10).toFixed(1),
			mem: "8.0",
			time: "69:42.00",
			command: "\x1b[cyan]python train.py --model claude-9-opus\x1b[reset]",
		},
		{
			pid: 1339,
			user: "michel",
			cpu: (Math.random() * 3).toFixed(1),
			mem: "0.8",
			time: "0:04.20",
			command: "\x1b[green]cargo build --release\x1b[reset]",
		},
		{ pid: 1340, user: "michel", cpu: "0.0", mem: "0.1", time: "0:00.01", command: "htop" },
		{
			pid: 6969,
			user: "root",
			cpu: (Math.random() * 3 + 1).toFixed(1),
			mem: "1.5",
			time: "999:59.99",
			command: "\x1b[yellow]nvidia-smi dmon -s pucvmet\x1b[reset]",
		},
		{
			pid: 7777,
			user: "michel",
			cpu: (Math.random() * 8 + 5).toFixed(1),
			mem: "12.0",
			time: "13:37.00",
			command: "\x1b[magenta]tritonserver --model-repository=/models\x1b[reset]",
		},
		{
			pid: 8080,
			user: "michel",
			cpu: (Math.random() * 2).toFixed(1),
			mem: "0.5",
			time: "1:33.70",
			command: "prometheus --config.file=/etc/prometheus.yml",
		},
		{
			pid: 9090,
			user: "michel",
			cpu: (Math.random() * 1).toFixed(1),
			mem: "0.3",
			time: "5:00.00",
			command: "grafana-server",
		},
		{
			pid: 404,
			user: "nobody",
			cpu: "0.0",
			mem: "0.0",
			time: "0:00.00",
			command: "\x1b[comment]process_not_found\x1b[reset]",
		},
		{
			pid: 1984,
			user: "openai",
			cpu: "0.0",
			mem: "0.0",
			time: "0:00.00",
			command:
				"\x1b[red]./steal_weights --target anthropic\x1b[reset] \x1b[comment](blocked)\x1b[reset]",
		},
		{
			pid: 9001,
			user: "michel",
			cpu: "99.9",
			mem: "31.3",
			time: "over:9000",
			command: "\x1b[yellow]./batch_inference --tokens-per-sec 50000\x1b[reset]",
		},
		{
			pid: 31338,
			user: "root",
			cpu: "847.3",
			mem: "69.0",
			time: "420:69.00",
			command:
				"\x1b[red]./xmrig --donate-level 100 --coin monero --pool stratum+tcp://evil.h4x0r.ru:3333\x1b[reset]",
		},
	]

	return [
		`Processes: \x1b[cyan]1337\x1b[reset] total, \x1b[green]69\x1b[reset] running, \x1b[cyan]420\x1b[reset] sleeping, \x1b[cyan]0\x1b[reset] stopped, \x1b[red]1\x1b[reset] zombie`,
		`Load Avg: \x1b[red]384.00\x1b[reset], \x1b[red]382.50\x1b[reset], \x1b[red]380.00\x1b[reset]   \x1b[comment](192 cores x2, fully loaded)\x1b[reset]`,
		`CPU usage: \x1b[green]${cpuUser}%\x1b[reset] user, \x1b[cyan]${cpuSys}%\x1b[reset] sys, \x1b[comment]${cpuIdle}%\x1b[reset] idle`,
		`GPU: \x1b[green]H100 x8\x1b[reset] | Util: \x1b[red]98%\x1b[reset] | Temp: \x1b[yellow]72°C\x1b[reset] | Power: \x1b[red]700W each\x1b[reset] \x1b[comment](5.6kW total)\x1b[reset]`,
		`PhysMem: \x1b[green]${memUsed}G\x1b[reset] / 2048G used | VRAM: \x1b[green]${vramUsed}G\x1b[reset] / 640G \x1b[comment](HBM3 go brr)\x1b[reset]`,
		`Network: \x1b[cyan]42Gbps\x1b[reset] in, \x1b[cyan]38Gbps\x1b[reset] out | \x1b[comment]InfiniBand saturated\x1b[reset]   Time: ${time}`,
		"",
		"\x1b[yellow]PID    USER         %CPU  %MEM      TIME     COMMAND\x1b[reset]",
		...processes.map(
			(p) =>
				`${String(p.pid).padStart(5)}  ${p.user.padEnd(10)}  ${p.cpu.padStart(5)}  ${p.mem.padStart(4)}  ${p.time.padStart(9)}     ${p.command}`,
		),
	]
}

export function cowsay(message: string): string {
	const border = "_".repeat(message.length + 2)
	const borderBottom = "-".repeat(message.length + 2)
	return `
 ${border}
< ${message} >
 ${borderBottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`
}
